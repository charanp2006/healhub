export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface OverviewStats {
  totalDoctors: number;
  totalPatients: number;
  totalHospitals: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  activeAppointments: number;
  appointmentGrowth: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  revenueGrowth: number;
}

export interface TrendPoint {
  month: string;
  booked: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface DoctorPerformance {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  total: number;
  completed: number;
  cancelled: number;
  revenue: number;
  patients: number;
  completionRate: number;
}
