export const runtime = "nodejs";

import { getDoctorAvailabilityForBooking } from "@/lib/controllers/doctorController";
import { handleOptions } from "@/lib/http";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;
  return getDoctorAvailabilityForBooking(request, docId);
}

export { handleOptions as OPTIONS };
