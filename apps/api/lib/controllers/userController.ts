import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel";
import doctorModel from "../models/doctorModel";
import hospitalModel from "../models/hospitalModel";
import appointmentModel from "../models/appointmentModel";
import razorpay from "razorpay";
import { connectDB } from "../db";
import { uploadImageToCloudinary } from "../upload";
import { json, bad, tooMany } from "../http";
import { verifyUser, signAuthToken } from "../auth";
import {
  clientIp,
  checkLoginRateGate,
  recordLoginAttempt,
} from "../ratelimit";

function getRazorpay() {
  return new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });
}

export async function registerUser(request: Request): Promise<Response> {
  try {
    await connectDB();
    const { name, email, password } = await request.json();
    if (!name || !password || !email) {
      return json({ success: false, message: "All fields are required" }, undefined, request);
    }
    if (!validator.isEmail(email)) {
      return json({ success: false, message: "Enter a valid email" }, undefined, request);
    }
    if (!validator.isStrongPassword(password)) {
      return json({
        success: false,
        message:
          "Password is not strong enough. It should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.",
      }, undefined, request);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    const userData = { name, email, password: hashedpassword };
    const newUser = new userModel(userData);
    const user = await newUser.save();
    const token = await signAuthToken({
      id: String(user._id),
      role: "user",
      email: user.email || "",
      name: user.name || "",
    });
    if (!token) return json({ success: false, message: "Could not create session" }, undefined, request);
    return json({ success: true, token }, undefined, request);
  } catch (error) {
    console.log("Error in add user to db:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function loginUser(request: Request): Promise<Response> {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const ip = clientIp(request);
    const gate = checkLoginRateGate({ role: "user", email, ip });
    if (gate.blocked) {
      return tooMany(
        "Too many failed attempts. Try again in a few minutes.",
        gate.retryAfterSeconds,
        request
      );
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      recordLoginAttempt({ role: "user", email, ip, ok: false });
      return json({ success: false, message: "Invalid credentials" }, undefined, request);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = await signAuthToken({
        id: String(user._id),
        role: "user",
        email: user.email || "",
        name: user.name || "",
      });
      if (!token) return json({ success: false, message: "Could not create session" }, undefined, request);
      recordLoginAttempt({ role: "user", email, ip, ok: true });
      return json({ success: true, token }, undefined, request);
    }
    recordLoginAttempt({ role: "user", email, ip, ok: false });
    return json({ success: false, message: "Invalid credentials" }, undefined, request);
  } catch (error) {
    console.log("Error in user login:", error);
    return json({ success: false, message: "Something went wrong. Please try again." }, undefined, request);
  }
}

export async function getUserProfile(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const userId = auth.userId;
    const userData = await userModel.findById(userId).select("-password");
    return json({ success: true, userData }, undefined, request);
  } catch (error) {
    console.log("Error in getting user data:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function updateUserProfile(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const userId = auth.userId;

    const formData = await request.formData();
    const get = (k: string) => {
      const v = formData.get(k);
      return typeof v === "string" ? v : undefined;
    };
    const name = get("name");
    const phone = get("phone");
    const dob = get("dob");
    const gender = get("gender");
    const address = get("address");
    const imageFile = formData.get("image");

    if (!name || !phone || !dob || !gender) {
      return json({ success: false, message: "data Missing" }, undefined, request);
    }

    const updateData: Record<string, unknown> = {
      name,
      phone,
      dob,
      gender,
    };
    if (address) {
      try {
        updateData.address = JSON.parse(address);
      } catch {
        updateData.address = { line1: address, line2: "" };
      }
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    if (imageFile instanceof File) {
      const imageUrl = await uploadImageToCloudinary(imageFile);
      if (imageUrl) {
        await userModel.findByIdAndUpdate(userId, { image: imageUrl });
      }
    }
    return json({ success: true, message: "Profile updated successfully" }, undefined, request);
  } catch (error) {
    console.log("Error in updating user profile:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function bookAppointment(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const userId = auth.userId;

    const { docId, slotDate, slotTime, appointmentType, symptoms, notes } =
      await request.json();

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return json({ success: false, message: "Doctor not available" }, undefined, request);
    }

    const slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return json({ success: false, message: "Slot not available" }, undefined, request);
      }
      slots_booked[slotDate].push(slotTime);
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    const docDataClone = docData.toObject();
    delete docDataClone.slots_booked;

    const appointmentData = {
      userId,
      docId,
      hospitalId: docData.hospitalId || "",
      slotDate,
      slotTime,
      userData,
      docData: docDataClone,
      amount: docData.fees,
      date: Date.now(),
      appointmentType: appointmentType || "in-person",
      symptoms: symptoms || "",
      notes: notes || "",
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    return json({ success: true, message: "Appointment booked successfully" }, undefined, request);
  } catch (error) {
    console.log("Error in creating the appointment:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function getUserAppointments(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const userId = auth.userId;
    const appointments = await appointmentModel.find({ userId });
    return json({ success: true, appointments }, undefined, request);
  } catch (error) {
    console.log("Error in fetching user appointments:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function rateAppointment(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const userId = auth.userId;

    const { appointmentId, rating, review } = await request.json();
    if (!userId || !appointmentId || !rating) {
      return json({ success: false, message: "Missing required data" }, undefined, request);
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return json({ success: false, message: "Appointment not found" }, undefined, request);
    }
    if (appointment.userId !== userId) {
      return json({ success: false, message: "Unauthorized" }, undefined, request);
    }
    if (!appointment.isCompleted) {
      return json({ success: false, message: "Cannot rate before completion" }, undefined, request);
    }
    if (appointment.rating) {
      return json({ success: false, message: "Appointment already rated" }, undefined, request);
    }

    appointment.rating = rating;
    appointment.review = review || "";
    appointment.ratedAt = Date.now();
    await appointment.save();

    const doc = await doctorModel.findById(appointment.docId);
    if (doc) {
      const prevCount = doc.ratingCount || 0;
      const newCount = prevCount + 1;
      const prevAvg = doc.ratingAverage || 0;
      const newAvg = (prevAvg * prevCount + rating) / newCount;
      doc.ratingCount = newCount;
      doc.ratingAverage = newAvg;
      doc.reviews.push({ userId, rating, comment: review || "" });
      await doc.save();
    }

    if (appointment.hospitalId) {
      const hosp = await hospitalModel.findById(appointment.hospitalId);
      if (hosp) {
        const prevCount = hosp.ratingCount || 0;
        const newCount = prevCount + 1;
        const prevAvg = hosp.ratingAverage || 0;
        const newAvg = (prevAvg * prevCount + rating) / newCount;
        hosp.ratingCount = newCount;
        hosp.ratingAverage = newAvg;
        hosp.reviews.push({ userId, rating, comment: review || "" });
        await hosp.save();
      }
    }

    return json({ success: true, message: "Rating submitted successfully" }, undefined, request);
  } catch (error) {
    console.log("Error in rateAppointment:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function getStats(request: Request): Promise<Response> {
  try {
    await connectDB();
    const userCount = await userModel.countDocuments();
    const doctorCount = await doctorModel.countDocuments();
    const hospitalCount = await hospitalModel.countDocuments();
    return json({ success: true, userCount, doctorCount, hospitalCount }, undefined, request);
  } catch (error) {
    console.log("Error in getStats:", error);
    return json({ success: false, message: (error as Error).message }, 500, request);
  }
}

export async function cancelUserAppointment(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const userId = auth.userId;

    const { appointmentId } = await request.json();
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData.userId !== userId) {
      return json({ success: false, message: "Unauthorized action" }, undefined, request);
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointmentData;
    const docData = await doctorModel.findById(docId);
    const slots_booked = docData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (time: string) => time !== slotTime
    );
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    return json({ success: true, message: "Appointment cancled successfully" }, undefined, request);
  } catch (error) {
    console.log("Error in cancelling user appointment:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function rescheduleAppointment(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const userId = auth.userId;

    const { appointmentId, newSlotDate, newSlotTime } = await request.json();
    if (!appointmentId || !newSlotDate || !newSlotTime) {
      return json({ success: false, message: "Missing required data" }, undefined, request);
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return json({ success: false, message: "Appointment not found" }, undefined, request);
    }
    if (appointment.userId !== userId) {
      return json({ success: false, message: "Unauthorized action" }, undefined, request);
    }
    if (appointment.cancelled || appointment.isCompleted) {
      return json({ success: false, message: "Cannot reschedule this appointment" }, undefined, request);
    }

    const docData = await doctorModel.findById(appointment.docId);
    if (!docData) {
      return json({ success: false, message: "Doctor not found" }, undefined, request);
    }

    const slots_booked = docData.slots_booked || {};
    if (slots_booked[newSlotDate] && slots_booked[newSlotDate].includes(newSlotTime)) {
      return json({ success: false, message: "New slot not available" }, undefined, request);
    }

    const oldDate = appointment.slotDate;
    const oldTime = appointment.slotTime;
    if (slots_booked[oldDate]) {
      slots_booked[oldDate] = slots_booked[oldDate].filter(
        (t: string) => t !== oldTime
      );
    }
    if (!slots_booked[newSlotDate]) {
      slots_booked[newSlotDate] = [];
    }
    slots_booked[newSlotDate].push(newSlotTime);

    await doctorModel.findByIdAndUpdate(appointment.docId, { slots_booked });
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      slotDate: newSlotDate,
      slotTime: newSlotTime,
      rescheduled: true,
    });
    return json({
      success: true,
      message: "Appointment rescheduled successfully",
    }, undefined, request);
  } catch (error) {
    console.log("Error in rescheduling appointment:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function paymentRazorpay(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);

    const { appointmentId } = await request.json();
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData || appointmentData.cancelled) {
      return json({
        success: false,
        message: "Appointment cancelled or not found",
      }, undefined, request);
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: appointmentId.toString(),
    };
    const order = await getRazorpay().orders.create(options);
    return json({ success: true, order }, undefined, request);
  } catch (error) {
    console.log("Error making payment:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function verifyRazorpay(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);

    const { razorpay_order_id } = await request.json();
    const orderInfo = await getRazorpay().orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      return json({ success: true, message: "Payment successfully" }, undefined, request);
    }
    return json({ success: false, message: "Payment Failed" }, undefined, request);
  } catch (error) {
    console.log("Error making payment:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}
