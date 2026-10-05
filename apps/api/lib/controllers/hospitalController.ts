import validator from "validator";
import bcrypt from "bcrypt";
import hospitalModel from "../models/hospitalModel";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appointmentModel";
import { connectDB } from "../db";
import { uploadImageToCloudinary } from "../upload";
import { json, bad, tooMany } from "../http";
import { verifyAdmin, verifyHospital, verifyUser, signAuthToken } from "../auth";
import {
  clientIp,
  checkLoginRateGate,
  recordLoginAttempt,
} from "../ratelimit";
import type { AnyDoc } from "../types";

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

async function enrichDoctorCounts(
  hospitals: Array<Record<string, any>>
): Promise<Array<Record<string, any>>> {
  const hospitalIds = hospitals.map((h) => h._id);
  if (hospitalIds.length === 0) return hospitals;
  const groups = await doctorModel.aggregate([
    { $match: { hospitalId: { $in: hospitalIds } } },
    {
      $group: {
        _id: "$hospitalId",
        total: { $sum: 1 },
        available: {
          $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] },
        },
      },
    },
  ]);
  const countMap = new Map(groups.map((g) => [String(g._id), g]));
  return hospitals.map((h) => {
    const counts = countMap.get(String(h._id));
    return {
      ...h,
      doctorsCount: counts?.total || 0,
      availableDoctors: counts?.available || 0,
    };
  });
}

export async function addHospital(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyAdmin(request.headers.get("atoken"));
    if (!auth.ok) return bad(auth.message, request);

    const body = await request.json();
    const {
      name,
      email,
      password,
      city,
      address,
      lat,
      lng,
      specialties,
      image,
      about,
      isRegistered,
      isAvailable,
      totalBeds,
      availableBeds,
      ratingAverage,
      ratingCount,
    } = body;

    if (!name || !email || !password || !city || lat === undefined || lng === undefined) {
      return json({ success: false, message: "Required data missing" }, undefined, request);
    }

    const latitude = parseNumber(lat);
    const longitude = parseNumber(lng);
    if (latitude === null || longitude === null) {
      return json({ success: false, message: "Invalid coordinates" }, undefined, request);
    }
    if (!validator.isEmail(email)) {
      return json({ success: false, message: "Invalid email address" }, undefined, request);
    }
    if (!validator.isStrongPassword(password)) {
      return json({
        success: false,
        message:
          "Password is not strong enough. It should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.",
      }, undefined, request);
    }

    const existingHospital = await hospitalModel.findOne({ email });
    if (existingHospital) {
      return json({
        success: false,
        message: "A hospital with this email already exists",
      }, undefined, request);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const parsedAddress = address ? JSON.parse(address) : { line1: "", line2: "" };
    const parsedSpecialties = specialties
      ? Array.isArray(specialties)
        ? specialties
        : JSON.parse(specialties)
      : [];

    const totalBedsValue = parseNumber(totalBeds) ?? 0;
    const availableBedsValue = parseNumber(availableBeds) ?? 0;
    if (availableBedsValue < 0 || totalBedsValue < 0) {
      return json({ success: false, message: "Bed counts cannot be negative" }, undefined, request);
    }
    if (availableBedsValue > totalBedsValue) {
      return json({
        success: false,
        message: "Available beds cannot exceed total beds",
      }, undefined, request);
    }

    const hospitalData = {
      name,
      email,
      password: hashedPassword,
      city,
      address: parsedAddress,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      image: image || "",
      about: about || "",
      specialties: parsedSpecialties,
      ratingAverage: parseNumber(ratingAverage) ?? 0,
      ratingCount: parseNumber(ratingCount) ?? 0,
      isRegistered: isRegistered === true || isRegistered === "true",
      isAvailable: isAvailable !== "false",
      totalBeds: totalBedsValue,
      availableBeds: availableBedsValue,
    };

    const newHospital = new hospitalModel(hospitalData);
    await newHospital.save();
    return json({ success: true, message: "Hospital added successfully" }, undefined, request);
  } catch (error) {
    console.log("Error in addHospital:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function listHospitals(request: Request): Promise<Response> {
  try {
    await connectDB();
    const url = new URL(request.url);
    const { searchParams } = url;
    const name = searchParams.get("name");
    const city = searchParams.get("city");
    const speciality = searchParams.get("speciality");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");
    const sort = searchParams.get("sort");

    const pageNumber = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limitNumber = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 50);
    const skipCount = (pageNumber - 1) * limitNumber;

    const matchStage: Record<string, unknown> = {};
    if (name) matchStage.name = { $regex: escapeRegExp(name), $options: "i" };
    if (city) matchStage.city = { $regex: escapeRegExp(city), $options: "i" };
    if (speciality) {
      matchStage.specialties = { $regex: escapeRegExp(speciality), $options: "i" };
    }

    const sortMap: Record<string, Record<string, number>> = {
      rating: { ratingAverage: -1, ratingCount: -1 },
      availability: { isAvailable: -1, availableBeds: -1 },
      distance: { distance: 1 },
      latest: { _id: -1 },
    };
    const sortStage = sortMap[sort || ""] || { _id: -1 };

    const fields = {
      name: 1,
      city: 1,
      address: 1,
      image: 1,
      about: 1,
      specialties: 1,
      ratingAverage: 1,
      ratingCount: 1,
      isRegistered: 1,
      isAvailable: 1,
      totalBeds: 1,
      availableBeds: 1,
    };

    if (lat !== null && lng !== null) {
      const latitude = parseNumber(lat);
      const longitude = parseNumber(lng);
      if (latitude === null || longitude === null) {
        return json({ success: false, message: "Invalid coordinates" }, undefined, request);
      }
      const radiusKm = parseNumber(radius) ?? null;
      const maxDistance = radiusKm ? radiusKm * 1000 : undefined;

      const geoPipeline: any[] = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [longitude, latitude] },
            distanceField: "distance",
            spherical: true,
            ...(maxDistance ? { maxDistance } : {}),
          },
        },
        { $match: matchStage },
        {
          $addFields: {
            distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
          },
        },
        { $sort: sortStage },
        {
          $facet: {
            data: [
              { $skip: skipCount },
              { $limit: limitNumber },
              { $project: { ...fields, distanceKm: 1 } },
            ],
            total: [{ $count: "count" }],
          },
        },
      ];

      const [result] = await hospitalModel.aggregate(geoPipeline);
      const totalCount = result?.total?.[0]?.count || 0;
      const enrichedHospitals = await enrichDoctorCounts(result?.data || []);
      return json({
        success: true,
        hospitals: enrichedHospitals,
        pagination: { page: pageNumber, limit: limitNumber, total: totalCount },
      }, undefined, request);
    }

    const hospitals = await hospitalModel
      .find(matchStage)
      .select(fields)
      .sort(sortStage as Record<string, 1 | -1>)
      .skip(skipCount)
      .limit(limitNumber);
    const totalCount = await hospitalModel.countDocuments(matchStage);
    const hospitalDocs = hospitals.map((h) => h.toObject());
    const enrichedHospitals = await enrichDoctorCounts(hospitalDocs);
    return json({
      success: true,
      hospitals: enrichedHospitals,
      pagination: { page: pageNumber, limit: limitNumber, total: totalCount },
    }, undefined, request);
  } catch (error) {
    console.log("Error in listHospitals:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function getHospitalProfile(
  request: Request,
  hospitalId: string
): Promise<Response> {
  try {
    await connectDB();
    const hospital = await hospitalModel
      .findById(hospitalId)
      .select("-password -__v");
    if (!hospital) {
      return json({ success: false, message: "Hospital not found" }, undefined, request);
    }
    const doctors = await doctorModel
      .find({ hospitalId })
      .select(["-password", "-email"]);
    return json(
      {
        success: true,
        hospital,
        doctors,
        doctorsCount: doctors.length,
        availableDoctors: doctors.filter((d) => d.available).length,
      },
      undefined,
      request
    );
  } catch (error) {
    console.log("Error in getHospitalProfile:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function validateHospitalBooking(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyUser(request.headers.get("token"));
    if (!auth.ok) return bad(auth.message, request);
    const { hospitalId } = await request.json();
    const hospital = await hospitalModel.findById(hospitalId).select("isRegistered");
    if (!hospital) {
      return json({ success: false, message: "Hospital not found" }, undefined, request);
    }
    if (!hospital.isRegistered) {
      return json({
        success: false,
        message: "Hospital is not registered for bookings",
      }, undefined, request);
    }
    return json({ success: true, message: "Booking eligible" }, undefined, request);
  } catch (error) {
    console.log("Error in validateHospitalBooking:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function getRegisteredHospitals(request: Request): Promise<Response> {
  try {
    await connectDB();
    const hospitals = await hospitalModel
      .find({ isRegistered: true })
      .select("name city")
      .sort({ name: 1 })
      .lean();
    return json({ success: true, hospitals }, undefined, request);
  } catch (error) {
    console.log("Error in getRegisteredHospitals:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function hospitalLogin(request: Request): Promise<Response> {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const ip = clientIp(request);
    const gate = checkLoginRateGate({ role: "hospital", email, ip });
    if (gate.blocked) {
      return tooMany(
        "Too many failed attempts. Try again in a few minutes.",
        gate.retryAfterSeconds,
        request
      );
    }

    const hospital = await hospitalModel.findOne({ email });
    if (!hospital) {
      recordLoginAttempt({ role: "hospital", email, ip, ok: false });
      return json({ success: false, message: "Invalid email or password" }, undefined, request);
    }
    if (!hospital.isRegistered) {
      recordLoginAttempt({ role: "hospital", email, ip, ok: false });
      return json({
        success: false,
        message: "Hospital is not registered. Contact admin.",
      }, undefined, request);
    }
    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      recordLoginAttempt({ role: "hospital", email, ip, ok: false });
      return json({ success: false, message: "Invalid email or password" }, undefined, request);
    }
    const token = await signAuthToken({
      id: String(hospital._id),
      role: "hospital",
      email: hospital.email || "",
      name: hospital.name || "",
    });
    if (!token) return json({ success: false, message: "Could not create session" }, undefined, request);
    recordLoginAttempt({ role: "hospital", email, ip, ok: true });
    return json({ success: true, token }, undefined, request);
  } catch (error) {
    console.log("Error in hospitalLogin:", error);
    return json({ success: false, message: "Something went wrong. Please try again." }, undefined, request);
  }
}

export async function hospitalDashboard(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyHospital(request.headers.get("htoken"));
    if (!auth.ok) return bad(auth.message, request);
    const hospitalId = auth.hospitalId;

    const doctors = await doctorModel.find({ hospitalId }).select("-password");
    const appointments = await appointmentModel.find({
      docId: { $in: doctors.map((d) => d._id) },
    });
    const dashboardData = {
      doctors: doctors.length,
      appointments: appointments.length,
      latestAppointments: appointments.slice(-5),
    };
    return json({ success: true, dashboardData }, undefined, request);
  } catch (error) {
    console.log("Error in hospitalDashboard:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function hospitalAddDoctor(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyHospital(request.headers.get("htoken"));
    if (!auth.ok) return bad(auth.message, request);
    const hospitalId = auth.hospitalId;

    const formData = await request.formData();
    const get = (k: string) => formData.get(k);
    const { name, email, password, speciality, experience, degree, about, fees, address } = {
      name: get("name"),
      email: get("email"),
      password: get("password"),
      speciality: get("speciality"),
      experience: get("experience"),
      degree: get("degree"),
      about: get("about"),
      fees: get("fees"),
      address: get("address"),
    };

    if (!name || !email || !password || !speciality || !experience || !degree || !about || !fees || !address) {
      return json({ success: false, message: "All fields are required" }, undefined, request);
    }

    const hospital = await hospitalModel.findById(hospitalId);
    if (!hospital) {
      return json({ success: false, message: "Hospital not found" }, undefined, request);
    }
    if (!hospital.isRegistered) {
      return json({ success: false, message: "Hospital is not registered" }, undefined, request);
    }

    if (!validator.isEmail(String(email))) {
      return json({ success: false, message: "Invalid email address" }, undefined, request);
    }
    if (!validator.isStrongPassword(String(password))) {
      return json({
        success: false,
        message:
          "Password is not strong enough. It should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.",
      }, undefined, request);
    }

    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return json({ success: false, message: "A doctor with this email already exists" }, undefined, request);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const imageFile = formData.get("image");
    const imageUrl = await uploadImageToCloudinary(
      imageFile instanceof File ? imageFile : null
    );

    const doctorData = {
      name: String(name),
      email: String(email),
      password: hashedPassword,
      image: imageUrl,
      speciality: String(speciality),
      experience: Number(experience),
      degree: String(degree),
      about: String(about),
      fees: Number(fees),
      address: JSON.parse(String(address)),
      hospitalId,
      date: Date.now(),
      slots_booked: {},
    };
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    return json({ success: true, message: "Doctor added successfully" }, undefined, request);
  } catch (error) {
    console.log("Error in hospitalAddDoctor:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function hospitalGetDoctors(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyHospital(request.headers.get("htoken"));
    if (!auth.ok) return bad(auth.message, request);
    const hospitalId = auth.hospitalId;
    const doctors = await doctorModel.find({ hospitalId }).select("-password");
    return json({ success: true, doctors }, undefined, request);
  } catch (error) {
    console.log("Error in hospitalGetDoctors:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function hospitalProfile(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyHospital(request.headers.get("htoken"));
    if (!auth.ok) return bad(auth.message, request);
    const hospitalId = auth.hospitalId;
    const hospital = await hospitalModel.findById(hospitalId).select("-password");
    if (!hospital) {
      return json({ success: false, message: "Hospital not found" }, undefined, request);
    }
    return json({ success: true, profileData: hospital }, undefined, request);
  } catch (error) {
    console.log("Error in hospitalProfile:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function updateHospitalProfile(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyHospital(request.headers.get("htoken"));
    if (!auth.ok) return bad(auth.message, request);
    const hospitalId = auth.hospitalId;

    const formData = await request.formData();
    const get = (k: string) => {
      const v = formData.get(k);
      return typeof v === "string" ? v : undefined;
    };
    const about = get("about");
    const address = get("address");
    const specialties = get("specialties");
    const isAvailable = get("isAvailable");
    const totalBeds = get("totalBeds");
    const availableBeds = get("availableBeds");

    const updateData: Record<string, unknown> = {};
    if (about !== undefined) updateData.about = about;
    if (address !== undefined) {
      updateData.address = typeof address === "string" ? JSON.parse(address) : address;
    }
    if (specialties !== undefined) {
      updateData.specialties =
        typeof specialties === "string" ? JSON.parse(specialties) : specialties;
    }
    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable === "true";
    }
    if (totalBeds !== undefined) {
      const beds = Number(totalBeds);
      if (!isNaN(beds) && beds >= 0) updateData.totalBeds = beds;
    }
    if (availableBeds !== undefined) {
      const beds = Number(availableBeds);
      if (!isNaN(beds) && beds >= 0) updateData.availableBeds = beds;
    }

    const imageFile = formData.get("image");
    if (imageFile instanceof File) {
      const url = await uploadImageToCloudinary(imageFile);
      if (url) updateData.image = url;
    }

    await hospitalModel.findByIdAndUpdate(hospitalId, updateData);
    return json({ success: true, message: "Profile updated successfully" }, undefined, request);
  } catch (error) {
    console.log("Error in updateHospitalProfile:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}

export async function hospitalPanelAnalytics(request: Request): Promise<Response> {
  try {
    await connectDB();
    const auth = await verifyHospital(request.headers.get("htoken"));
    if (!auth.ok) return bad(auth.message, request);
    const hospitalId = auth.hospitalId;

    const hospital = await hospitalModel.findById(hospitalId).select("name city").lean();
    if (!hospital) {
      return json({ success: false, message: "Hospital not found" }, undefined, request);
    }

    const doctors = (await doctorModel.find({ hospitalId }).lean()) as AnyDoc[];
    const doctorIds = doctors.map((d) => d._id.toString());
    const appointments = await appointmentModel
      .find({ docId: { $in: doctorIds } })
      .lean();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const lastMonthEnd = thisMonthStart as number;

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.isCompleted).length;
    const cancelledAppointments = appointments.filter((a) => a.cancelled).length;
    const activeAppointments = appointments.filter((a) => !a.cancelled && !a.isCompleted).length;

    const thisMonthAppointments = appointments.filter((a) => a.date >= thisMonthStart).length;
    const lastMonthAppointments = appointments.filter(
      (a) => a.date >= lastMonthStart && a.date < lastMonthEnd
    ).length;
    const appointmentGrowth =
      lastMonthAppointments > 0
        ? Math.round(((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100)
        : thisMonthAppointments > 0
        ? 100
        : 0;

    const totalRevenue = appointments
      .filter((a) => a.isCompleted)
      .reduce((sum: number, a) => sum + (a.amount || 0), 0);
    const thisMonthRevenue = appointments
      .filter((a) => a.date >= thisMonthStart && a.isCompleted)
      .reduce((sum: number, a) => sum + (a.amount || 0), 0);
    const lastMonthRevenue = appointments
      .filter((a) => a.date >= lastMonthStart && a.date < lastMonthEnd && a.isCompleted)
      .reduce((sum: number, a) => sum + (a.amount || 0), 0);
    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : thisMonthRevenue > 0
        ? 100
        : 0;

    const completionRate =
      totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

    const doctorAppointmentCounts: Record<string, number> = {};
    appointments.forEach((a) => {
      const dId = a.docId?.toString();
      if (dId) doctorAppointmentCounts[dId] = (doctorAppointmentCounts[dId] || 0) + 1;
    });

    const topDoctors = Object.entries(doctorAppointmentCounts as Record<string, number>)
      .sort(([, a2], [, b]) => b - a2)
      .slice(0, 5)
      .map(([dId, count]) => {
        const doc = doctors.find((d) => d._id.toString() === dId);
        return {
          _id: dId,
          name: doc?.name || "Unknown",
          image: doc?.image || "",
          speciality: doc?.speciality || "",
          appointments: count,
          revenue: appointments
            .filter((a) => a.docId?.toString() === dId && a.isCompleted)
            .reduce((sum: number, a) => sum + (a.amount || 0), 0),
        };
      });

    const specialityMap: Record<string, { doctors: number; appointments: number }> = {};
    doctors.forEach((d) => {
      if (!specialityMap[d.speciality]) {
        specialityMap[d.speciality] = { doctors: 0, appointments: 0 };
      }
      specialityMap[d.speciality].doctors++;
    });
    appointments.forEach((a) => {
      const doc = doctors.find((d) => d._id.toString() === a.docId?.toString());
      if (doc && specialityMap[doc.speciality]) {
        specialityMap[doc.speciality].appointments++;
      }
    });
    const specialityBreakdown = Object.entries(specialityMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.appointments - a.appointments);

    const monthlyTrend: {
      month: string;
      appointments: number;
      completed: number;
      cancelled: number;
      revenue: number;
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = monthStart.toLocaleDateString("en-US", { month: "short" });
      const monthAppts = appointments.filter(
        (a) => a.date >= monthStart.getTime() && a.date < monthEnd.getTime()
      );
      const monthRevenue = monthAppts
        .filter((a) => a.isCompleted)
        .reduce((sum: number, a) => sum + (a.amount || 0), 0);
      monthlyTrend.push({
        month: monthLabel,
        appointments: monthAppts.length,
        completed: monthAppts.filter((a) => a.isCompleted).length,
        cancelled: monthAppts.filter((a) => a.cancelled).length,
        revenue: monthRevenue,
      });
    }

    return json({
      success: true,
      analytics: {
        stats: {
          totalDoctors: doctors.length,
          activeDoctors: doctors.filter((d) => d.available).length,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          activeAppointments,
          completionRate,
          appointmentGrowth,
          thisMonthAppointments,
          totalRevenue,
          thisMonthRevenue,
          revenueGrowth,
        },
        topDoctors,
        specialityBreakdown,
        monthlyTrend,
      },
    }, undefined, request);
  } catch (error) {
    console.log("Error in hospitalPanelAnalytics:", error);
    return json({ success: false, message: (error as Error).message }, undefined, request);
  }
}
