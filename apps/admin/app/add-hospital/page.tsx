// @ts-nocheck
"use client";
import { useContext, useState } from "react";
import { toast } from "@/src/components/ui/Toast";
import axios from "axios";
import { AdminContext } from "@/src/context/AdminContext";
import { Eye, EyeOff } from "lucide-react";
import { PageContainer, PageHeader, Card } from "@/src/components/ui";

const fieldCls = "w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15";

const AddHospital = () => {
  const { backendURL, aToken } = useContext(AdminContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [about, setAbout] = useState("");
  const [image, setImage] = useState("");
  const [isRegistered, setIsRegistered] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [totalBeds, setTotalBeds] = useState(0);
  const [availableBeds, setAvailableBeds] = useState(0);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!name || !email || !password || !city || !lat || !lng) {
        return toast.error("Name, email, password, city, latitude and longitude are required");
      }
      const payload = {
        name,
        email,
        password,
        city,
        address: JSON.stringify({ line1: address1, line2: address2 }),
        lat: Number(lat),
        lng: Number(lng),
        specialties: JSON.stringify(
          specialties.split(",").map((item) => item.trim()).filter(Boolean)
        ),
        about,
        image,
        isRegistered,
        isAvailable,
        totalBeds: Number(totalBeds),
        availableBeds: Number(availableBeds),
      };
      const { data } = await axios.post(`${backendURL}/api/admin/add-hospital`, payload, { headers: { aToken } });
      if (data.success) {
        toast.success(data.message);
        setName(""); setEmail(""); setPassword(""); setCity(""); setAddress1(""); setAddress2("");
        setLat(""); setLng(""); setSpecialties(""); setAbout(""); setImage("");
        setIsRegistered(true); setIsAvailable(true); setTotalBeds(0); setAvailableBeds(0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <PageContainer>
      <form onSubmit={onSubmitHandler} className="w-full">
        <PageHeader
          title="Add Hospital"
          subtitle="Create and register a new hospital on the platform"
          actions={
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover cursor-pointer">
              Add Hospital
            </button>
          }
        />
        <Card padded={false} className="w-full max-w-4xl p-8 overflow-y-auto">
        <div className="flex flex-col lg:flex-row items-start text-text-secondary gap-10">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Hospital name</p>
              <input onChange={(e) => setName(e.target.value)} value={name} className={fieldCls} type="text" placeholder="Name" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Hospital Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} className={fieldCls} type="email" placeholder="hospital@email.com" required />
            </div>
            <div className="flex-1 flex flex-col gap-1 relative">
              <p>Hospital Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} className="border rounded px-3 py-2 pr-10" type={showPassword ? "text" : "password"} placeholder="Password" required />
              <div onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-9.5 cursor-pointer text-text-secondary">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>City</p>
              <input onChange={(e) => setCity(e.target.value)} value={city} className={fieldCls} type="text" placeholder="City" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Latitude</p>
              <input onChange={(e) => setLat(e.target.value)} value={lat} className={fieldCls} type="number" placeholder="12.971598" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Longitude</p>
              <input onChange={(e) => setLng(e.target.value)} value={lng} className={fieldCls} type="number" placeholder="77.594566" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Total beds</p>
              <input onChange={(e) => setTotalBeds(e.target.value)} value={totalBeds} className={fieldCls} type="number" min="0" placeholder="100" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Available beds</p>
              <input onChange={(e) => setAvailableBeds(e.target.value)} value={availableBeds} className={fieldCls} type="number" min="0" placeholder="80" />
            </div>
          </div>
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Image URL</p>
              <input onChange={(e) => setImage(e.target.value)} value={image} className={fieldCls} type="text" placeholder="https://" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Specialties (comma separated)</p>
              <input onChange={(e) => setSpecialties(e.target.value)} value={specialties} className={fieldCls} type="text" placeholder="General physician, Neurologist" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input onChange={(e) => setAddress1(e.target.value)} value={address1} className={fieldCls} type="text" placeholder="Address 1" />
              <input onChange={(e) => setAddress2(e.target.value)} value={address2} className={fieldCls} type="text" placeholder="Address 2" />
            </div>
            <div className="flex items-center gap-6 text-sm mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isRegistered} onChange={(e) => setIsRegistered(e.target.checked)} />
                Registered for bookings
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                Available
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-text-secondary">About Hospital</p>
          <textarea onChange={(e) => setAbout(e.target.value)} value={about} className="w-full rounded-xl border border-border bg-background-card px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Write about hospital" rows={5} />
        </div>
        </Card>
      </form>
    </PageContainer>
  );
};

export default AddHospital;
