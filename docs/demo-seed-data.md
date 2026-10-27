# Demo Seed Data (Reference Only)

> Do **not** commit real credentials or PHI. This is for local development/testing only. 
> Run `cd apps/api && npm run seed` or insert manually using the values below.

## 1) Patient / User (users collection)
```json
{
  "name": "Demo User",
  "email": "demo@healhub.com",
  "password": "<bcrypt hash of Demo@123>",
  "phone": "9012345678",
  "gender": "Male",
  "dob": "01/01/1995",
  "address": { "line1": "", "line2": "" },
  "image": ""
}
```

## 2) Hospital (hospitals collection)
```json
{
  "name": "Demo City Hospital",
  "email": "hospital@healhub.com",
  "password": "<bcrypt hash of Hospital@123>",
  "city": "Mumbai",
  "address": { "line1": "12 MG Road", "line2": "Andheri West" },
  "specialties": ["Cardiology", "Orthopedics", "General Medicine"],
  "totalBeds": 120,
  "availableBeds": 84,
  "image": "https://res.cloudinary.com/healhub/image/upload/v1/hospitals/demo-city-hospital.webp",
  "location": { "type": "Point", "coordinates": [72.8777, 19.076] },
  "isRegistered": true,
  "isAvailable": true,
  "ratingAverage": 4.6,
  "ratingCount": 210
}
```

## 3) Doctor (doctors collection)
```json
{
  "name": "Dr. Demo Doctor",
  "email": "doctor@healhub.com",
  "password": "<bcrypt hash of Doctor@123>",
  "image": "https://res.cloudinary.com/healhub/image/upload/v1/doctors/demo-doctor.webp",
  "speciality": "Cardiologist",
  "experience": 10,
  "degree": "MBBS, MD (Cardiology)",
  "about": "Board-certified cardiologist with a decade of experience in interventional cardiology.",
  "fees": 500,
  "address": { "line1": "12 MG Road", "line2": "Andheri West" },
  "hospitalId": { "$oid": "<ObjectId of demo hospital>" },
  "date": 1712345678900,
  "slots_booked": {},
  "available": true
}
```


<!-- ## Notes
- Hash passwords with bcrypt (10 rounds) before inserting.
- Link doctor to hospital via `hospitalId`.
- Keep in sync with `apps/api/scripts/seed.ts`. -->
