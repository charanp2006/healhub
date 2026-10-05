import appointmentModel from "../models/appointmentModel";
import doctorModel from "../models/doctorModel";
import userModel from "../models/userModel";
import hospitalModel from "../models/hospitalModel";
import { connectDB } from "../db";
import { json, bad } from "../http";
import type { AnyDoc } from "../types";

export async function getOverviewStats(request: Request): Promise<Response> {
  try {
    await connectDB();
    const now = new Date();
    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).getTime();
    const lastMonthEnd = thisMonthStart;

    const [totalDoctors, totalPatients, totalHospitals, allAppointments] =
      await Promise.all([
        doctorModel.countDocuments({}),
        userModel.countDocuments({}),
        hospitalModel.countDocuments({}),
        appointmentModel.find({}).lean(),
      ]);

    const totalAppointments = allAppointments.length;
    const completedAppointments = allAppointments.filter((a) => a.isCompleted)
      .length;
    const cancelledAppointments = allAppointments.filter((a) => a.cancelled)
      .length;
    const activeAppointments = allAppointments.filter(
      (a) => !a.cancelled && !a.isCompleted
    ).length;

    const thisMonthAppointments = allAppointments.filter(
      (a) => a.date >= thisMonthStart
    ).length;
    const lastMonthAppointments = allAppointments.filter(
      (a) => a.date >= lastMonthStart && a.date < lastMonthEnd
    ).length;
    const appointmentGrowth =
      lastMonthAppointments > 0
        ? Math.round(
            ((thisMonthAppointments - lastMonthAppointments) /
              lastMonthAppointments) *
              100
          )
        : thisMonthAppointments > 0
        ? 100
        : 0;

    const totalRevenue = allAppointments
      .filter((a) => a.isCompleted)
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    const thisMonthRevenue = allAppointments
      .filter(
        (a) => a.date >= thisMonthStart && (a.isCompleted)
      )
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    const lastMonthRevenue = allAppointments
      .filter(
        (a) =>
          a.date >= lastMonthStart &&
          a.date < lastMonthEnd &&
          (a.isCompleted)
      )
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          )
        : thisMonthRevenue > 0
        ? 100
        : 0;

    const videoCount = allAppointments.filter(
      (a) => a.appointmentType === "video"
    ).length;
    const inPersonCount = totalAppointments - videoCount;

    return json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        totalHospitals,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        activeAppointments,
        appointmentGrowth,
        totalRevenue,
        thisMonthRevenue,
        revenueGrowth,
        videoCount,
        inPersonCount,
      },
    }, undefined, request);
  } catch (error) {
    console.log("Error in getOverviewStats:", error);
    return bad((error as Error).message, request);
  }
}

export async function getAppointmentTrends(request: Request): Promise<Response> {
  try {
    await connectDB();
    const now = new Date();
    const trends = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1
      );

      const monthLabel = monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const startTs = monthStart.getTime();
      const endTs = monthEnd.getTime();

      const monthAppointments = await appointmentModel
        .find({
          date: { $gte: startTs, $lt: endTs },
        })
        .lean();

      const booked = monthAppointments.length;
      const completed = monthAppointments.filter((a) => a.isCompleted).length;
      const cancelled = monthAppointments.filter((a) => a.cancelled).length;
      const revenue = monthAppointments
        .filter((a) => a.isCompleted)
        .reduce((sum, a) => sum + (a.amount || 0), 0);

      trends.push({ month: monthLabel, booked, completed, cancelled, revenue });
    }

    return json({ success: true, trends }, undefined, request);
  } catch (error) {
    console.log("Error in getAppointmentTrends:", error);
    return bad((error as Error).message, request);
  }
}

export async function getDoctorPerformance(request: Request): Promise<Response> {
  try {
    await connectDB();
    const doctors = (await doctorModel
      .find({})
      .select("name speciality image fees")
      .lean()) as AnyDoc[];
    const appointments = await appointmentModel.find({}).lean();

    const performance = doctors.map((doc) => {
      const docAppointments = appointments.filter(
        (a) => a.docId && a.docId.toString() === doc._id.toString()
      );
      const total = docAppointments.length;
      const completed = docAppointments.filter((a) => a.isCompleted).length;
      const cancelled = docAppointments.filter((a) => a.cancelled).length;
      const revenue = docAppointments
        .filter((a) => a.isCompleted)
        .reduce((sum, a) => sum + (a.amount || 0), 0);
      const patientIds = new Set(
        docAppointments.map((a) => a.userId?.toString()).filter(Boolean)
      );
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        _id: doc._id,
        name: doc.name,
        speciality: doc.speciality,
        image: doc.image,
        total,
        completed,
        cancelled,
        revenue,
        patients: patientIds.size,
        completionRate,
      };
    });

    performance.sort((a, b) => b.revenue - a.revenue);

    return json({ success: true, performance }, undefined, request);
  } catch (error) {
    console.log("Error in getDoctorPerformance:", error);
    return bad((error as Error).message, request);
  }
}

export async function getSpecialityStats(request: Request): Promise<Response> {
  try {
    await connectDB();
    const appointments = await appointmentModel.find({}).lean();

    const specialityMap: Record<
      string,
      { total: number; revenue: number }
    > = {};
    appointments.forEach((a) => {
      const spec = (a as { docData?: { speciality?: string } }).docData
        ?.speciality || "Unknown";
      if (!specialityMap[spec]) {
        specialityMap[spec] = { total: 0, revenue: 0 };
      }
      specialityMap[spec].total += 1;
      if (a.isCompleted) {
        specialityMap[spec].revenue += a.amount || 0;
      }
    });

    const specialities = Object.entries(specialityMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    return json({ success: true, specialities }, undefined, request);
  } catch (error) {
    console.log("Error in getSpecialityStats:", error);
    return bad((error as Error).message, request);
  }
}

export async function getRecentActivity(request: Request): Promise<Response> {
  try {
    await connectDB();
    const recentAppointments = await appointmentModel
      .find({})
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const activities = recentAppointments.map((a) => {
      let action = "booked";
      if (a.isCompleted) action = "completed";
      else if (a.cancelled) action = "cancelled";
      else if ((a as { rescheduled?: boolean }).rescheduled)
        action = "rescheduled";

      return {
        _id: a._id,
        action,
        patientName: (a as { userData?: { name?: string } }).userData?.name || "Unknown",
        patientImage: (a as { userData?: { image?: string } }).userData?.image || "",
        doctorName: (a as { docData?: { name?: string } }).docData?.name || "Unknown",
        doctorImage: (a as { docData?: { image?: string } }).docData?.image || "",
        speciality: (a as { docData?: { speciality?: string } }).docData?.speciality || "",
        appointmentType: a.appointmentType || "in-person",
        slotDate: a.slotDate,
        slotTime: a.slotTime,
        amount: a.amount,
        date: a.date,
      };
    });

    return json({ success: true, activities }, undefined, request);
  } catch (error) {
    console.log("Error in getRecentActivity:", error);
    return bad((error as Error).message, request);
  }
}

export async function getHospitalAnalytics(request: Request): Promise<Response> {
  try {
    await connectDB();
    const url = new URL(request.url);
    const hospitalId = url.searchParams.get("hospitalId");

    const hospitalFilter: Record<string, unknown> = hospitalId
      ? { _id: hospitalId }
      : {};
    const hospitals = (await hospitalModel
      .find(hospitalFilter)
      .select("name city image")
      .lean()) as AnyDoc[];

    if (hospitals.length === 0) {
      return json({ success: true, hospitals: [] }, undefined, request);
    }

    const hospitalIds = hospitals.map((h) => h._id);

    const doctors = (await doctorModel
      .find({ hospitalId: { $in: hospitalIds } })
      .lean()) as AnyDoc[];

    const hospitalDoctorMap: Record<string, string[]> = {};
    hospitalIds.forEach((hId) => {
      hospitalDoctorMap[hId.toString()] = doctors
        .filter((d) => d.hospitalId?.toString() === hId.toString())
        .map((d) => d._id.toString());
    });

    const allDoctorIds = doctors.map((d) => d._id.toString());
    const appointments = allDoctorIds.length
      ? await appointmentModel
          .find({ docId: { $in: allDoctorIds } })
          .lean()
      : [];

    const now = new Date();
    const thisMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).getTime();
    const lastMonthEnd = thisMonthStart;

    const hospitalAnalytics = hospitals.map((hospital) => {
      const hId = hospital._id.toString();
      const doctorIds = hospitalDoctorMap[hId] || [];

      const hospitalAppointments = appointments.filter((a) =>
        a.docId && doctorIds.includes(a.docId.toString())
      );
      const hospitalDoctors = doctors.filter(
        (d) => d.hospitalId?.toString() === hId
      );

      const totalAppointments = hospitalAppointments.length;
      const completedAppointments = hospitalAppointments.filter(
        (a) => a.isCompleted
      ).length;
      const cancelledAppointments = hospitalAppointments.filter(
        (a) => a.cancelled
      ).length;
      const activeAppointments = hospitalAppointments.filter(
        (a) => !a.cancelled && !a.isCompleted
      ).length;

      const thisMonthAppointments = hospitalAppointments.filter(
        (a) => a.date >= thisMonthStart
      ).length;
      const lastMonthAppointments = hospitalAppointments.filter(
        (a) => a.date >= lastMonthStart && a.date < lastMonthEnd
      ).length;
      const appointmentGrowth =
        lastMonthAppointments > 0
          ? Math.round(
              ((thisMonthAppointments - lastMonthAppointments) /
                lastMonthAppointments) *
                100
            )
          : thisMonthAppointments > 0
          ? 100
          : 0;

      const totalRevenue = hospitalAppointments
        .filter((a) => a.isCompleted)
        .reduce((sum, a) => sum + (a.amount || 0), 0);

      const thisMonthRevenue = hospitalAppointments
        .filter((a) => a.date >= thisMonthStart && a.isCompleted)
        .reduce((sum, a) => sum + (a.amount || 0), 0);

      const completionRate =
        totalAppointments > 0
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0;

      const doctorAppointmentCounts: Record<string, number> = {};
      hospitalAppointments.forEach((a) => {
        const dId = a.docId?.toString();
        if (dId)
          doctorAppointmentCounts[dId] =
            (doctorAppointmentCounts[dId] || 0) + 1;
      });

      const topDoctors = Object.entries(doctorAppointmentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([dId, count]) => {
          const doc = hospitalDoctors.find((d) => d._id.toString() === dId);
          return {
            _id: dId,
            name: doc?.name || "Unknown",
            image: doc?.image || "",
            speciality: doc?.speciality || "",
            appointments: count,
          };
        });

      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );
        const monthEnd = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1
        );
        const monthLabel = monthStart.toLocaleDateString("en-US", {
          month: "short",
        });

        const monthAppointments = hospitalAppointments.filter(
          (a) =>
            a.date >= monthStart.getTime() && a.date < monthEnd.getTime()
        ).length;
        const monthRevenue = hospitalAppointments
          .filter(
            (a) =>
              a.date >= monthStart.getTime() &&
              a.date < monthEnd.getTime() &&
              a.isCompleted
          )
          .reduce((sum, a) => sum + (a.amount || 0), 0);

        monthlyTrend.push({
          month: monthLabel,
          appointments: monthAppointments,
          revenue: monthRevenue,
        });
      }

      return {
        _id: hospital._id,
        name: hospital.name,
        city: hospital.city,
        image: hospital.image,
        stats: {
          totalDoctors: hospitalDoctors.length,
          activeDoctors: hospitalDoctors.filter((d) => d.available).length,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          activeAppointments,
          appointmentGrowth,
          thisMonthAppointments,
          totalRevenue,
          thisMonthRevenue,
          completionRate,
        },
        topDoctors,
        monthlyTrend,
      };
    });

    return json({ success: true, hospitals: hospitalAnalytics }, undefined, request);
  } catch (error) {
    console.log("Error in getHospitalAnalytics:", error);
    return bad((error as Error).message, request);
  }
}
