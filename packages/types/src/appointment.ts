export type AppointmentType = "in-person" | "video";

export interface Appointment {
  _id: string;
  userId: string;
  docId: string;
  hospitalId?: string;
  slotDate: string;
  slotTime: string;
  userData?: {
    name?: string;
    image?: string;
    phone?: string;
  } & Record<string, unknown>;
  docData?: {
    name?: string;
    image?: string;
    speciality?: string;
    fees?: number;
  } & Record<string, unknown>;
  amount: number;
  date: number;
  appointmentType: AppointmentType;
  symptoms?: string;
  notes?: string;
  prescription?: string;
  followUpDate?: string;
  cancelled?: boolean;
  isCompleted?: boolean;
  rescheduled?: boolean;
  rating?: number;
  review?: string;
  ratedAt?: number;
}
