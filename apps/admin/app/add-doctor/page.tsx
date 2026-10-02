// @ts-nocheck
"use client";
import { assets } from "@/src/assets/assets";
import { useState, useEffect, useContext } from "react";
import { AdminContext } from "@/src/context/AdminContext";
import { toast } from "@/src/components/ui/Toast";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { PageContainer, PageHeader, Card } from "@/src/components/ui";

const AddDoctor = () => {
    const [docImg,setDocImg] = useState(false);
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [showPassword,setShowPassword] = useState(false);
    const [experience,setExperience] = useState('Select');
    const [fees,setFees] = useState('');
    const [about,setAbout] = useState('');
    const [Speciality,setSpeciality] = useState('Select');
    const [degree,setDegree] = useState('');
    const [address1,setAddress1] = useState('');
    const [address2,setAddress2] = useState('');
    const [hospitalId,setHospitalId] = useState('');
    const [registeredHospitals,setRegisteredHospitals] = useState([]);

    const {backendURL, aToken} = useContext(AdminContext);

    const fetchRegisteredHospitals = async () => {
        try {
            const {data} = await axios.get(`${backendURL}/api/admin/registered-hospitals`, {headers: {aToken}});
            if(data.success){
                setRegisteredHospitals(data.hospitals);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if(aToken){
            fetchRegisteredHospitals();
        }
  // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aToken]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            if (!docImg) {
                return toast.error("Image not selsected");                
            }
            if (!hospitalId) {
                return toast.error("Please select a hospital / clinic");
            }
            const formData = new FormData();
            formData.append('image',docImg);
            formData.append('name',name);
            formData.append('email',email);
            formData.append('password',password);
            formData.append('experience',Number(experience.split(" ")[0]));
            formData.append('fees',Number(fees));
            formData.append('about',about);
            formData.append('speciality',Speciality);
            formData.append('degree',degree);
            formData.append('address',JSON.stringify({line1:`${address1}`, line2:`${address2}`}));
            formData.append('hospitalId', hospitalId);
            const {data} = await axios.post(`${backendURL}/api/admin/add-doctor`, formData, {headers: {aToken} });
            if(data.success){
                toast.success(data.message);
                setDocImg(false);
                setName('');
                setEmail('');
                setPassword('');
                setFees('');
                setAbout('');
                setDegree('');
                setAddress1('');
                setAddress2('');
                setExperience('Select');
                setSpeciality('Select');
                setHospitalId('');
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    }

  return (
    <PageContainer>
      <form onSubmit={onSubmitHandler} className="w-full">
        <PageHeader
          title="Add Doctor"
          subtitle="Register a new doctor and assign them to a hospital"
          actions={
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover cursor-pointer">
              Add Doctor
            </button>
          }
        />
        <Card padded={false} className="w-full max-w-4xl p-8 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8 text-text-secondary">
          <label htmlFor="doc-img">
            <img className="w-16 border-border rounded-full cursor-pointer" src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e)=> setDocImg(e.target.files[0]) } type="file" id="doc-img" hidden />
          <p>
            Upload doctor <br />
            picture
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-start text-text-secondary gap-10">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor name</p>
              <input onChange={(e)=> setName(e.target.value) } value={name} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" type="text" placeholder="Name" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Email</p>
              <input onChange={(e)=> setEmail(e.target.value) } value={email} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" type="email" placeholder="Email" required />
            </div>
            <div className="flex-1 flex flex-col gap-1 relative">
              <p>Doctor password</p>
              <input onChange={(e)=> setPassword(e.target.value) } value={password} className="border rounded px-3 py-2 pr-10" type={showPassword ? "text" : "password"} placeholder="Password" required />
              <div onClick={()=> setShowPassword(prev=>!prev)} className="absolute right-3 top-9.5 cursor-pointer text-text-secondary">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select onChange={(e)=> setExperience(e.target.value) } value={experience} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" name="" id="experience">
                <option value="">*select</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="6 Year">6 Year</option>
                <option value="7 Year">7 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="9 Year">9 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input onChange={(e)=> setFees(e.target.value) } value={fees} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" type="number" placeholder="fees" required />
            </div>
          </div>
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Select Hospital / Clinic</p>
              <select onChange={(e)=> setHospitalId(e.target.value) } value={hospitalId} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" required>
                <option value="">*select</option>
                {registeredHospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>{hospital.name} — {hospital.city}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Speciality</p>
              <select onChange={(e)=> setSpeciality(e.target.value) } value={Speciality} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" name="" id="speciality">
                <option >*select</option>
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input onChange={(e)=> setDegree(e.target.value) } value={degree} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" type="text" placeholder="Education" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input onChange={(e)=> setAddress1(e.target.value) } value={address1} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" type="text" placeholder="Address 1" required />
              <input onChange={(e)=> setAddress2(e.target.value) } value={address2} className="w-full border border-border bg-background-card rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" type="text" placeholder="Address 2" required />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-text-secondary">About Doctor</p>
          <textarea onChange={(e)=> setAbout(e.target.value) } value={about} className="w-full rounded-xl border border-border bg-background-card px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Write about doctor" rows={5} required />
        </div>
        </Card>
      </form>
    </PageContainer>
  );
};

export default AddDoctor;
