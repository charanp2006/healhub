// @ts-nocheck
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/src/context/AppContext";
import { assets } from "@/src/assets/assets";
import axios from "axios";
import { toast } from "@/src/components/ui/Toast";

const MyProfile = () => {
  const router = useRouter();
  const { userData, setUserData, token, backendURL, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!userData) return null;

  const updateUserProfileData = async () => {
    if (
      !userData.name ||
      !userData.phone ||
      !userData.address?.line1 ||
      !userData.gender ||
      !userData.dob
    ) {
      toast.error("Please fill all profile fields before saving");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);

      if (image) formData.append("image", image);

      const { data } = await axios.post(
        `${backendURL}/api/user/update-profile`,
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log("Error while updating Users profile data", error);
    }
  };

  return (
      <div className="max-w-lg flex flex-col gap-2 text-sm pt-5">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer mx-auto md:mx-0">
              <img
                className="w-36 rounded-full border-1 border-border"
                src={
                  image ? URL.createObjectURL(image) : userData.image
                }
                alt=""
              />
              <img
                className="w-10 absolute bottom-12 right-12"
                src={image ? "" : assets.upload_icon.src}
                alt=""
              />
            </div>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <img
            className="w-36 rounded-full border-1 border-border mx-auto md:mx-0"
            src={userData.image}
            alt=""
          />
        )}

        {isEdit ? (
          <input
            className="bg-background-base border-2 border-border rounded-sm px-2 text-3xl font-medium max-w-60 mt-4"
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
            required={isEdit}
          />
        ) : (
          <p className="font-medium text-3xl text-text-primary mt-4 text-center md:text-left">
            {userData.name}
          </p>
        )}
        <hr className="bg-border-light h-[1px] border-none" />
        <div>
          <p className="text-text-secondary underline mt-3">
            CONTACT INFORMATION
          </p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-text-primary">
            <p className="font-medium">Email id:</p>
            <p className="text-text-secondary">{userData.email}</p>
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                className="bg-background-base border-2 border-border rounded-sm px-2"
                type="text"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
                required={isEdit}
              />
            ) : (
              <p className="text-text-secondary">{userData.phone}</p>
            )}
            <p className="font-medium">Address:</p>
            {isEdit ? (
              <p>
                <input
                  className="bg-background-base border-2 border-border rounded-sm px-2"
                  value={userData.address.line1}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  type="text"
                  required={isEdit}
                />
                <br />
                <input
                  className="bg-background-base border-2 border-border rounded-sm px-2"
                  value={userData.address.line2}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  type="text"
                  required={isEdit}
                />
              </p>
            ) : (
              <p className="text-text-secondary">
                {userData.address.line1} <br /> {userData.address.line2}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-text-secondary underline mt-3">
            BASIC INFORMATION
          </p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-text-secondary">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                className="max-w-20 bg-background-base border-2 border-border rounded-sm "
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
                value={userData.gender}
                required={isEdit}
              >
                <option value="not selected">not selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-text-secondary">{userData.gender}</p>
            )}
            <p className="font-medium">DOB:</p>
            {isEdit ? (
              <input
                className="max-w-30 bg-background-base border-2 border-border rounded-sm"
                type="date"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                value={userData.dob}
                required={isEdit}
              />
            ) : (
              <p className="text-text-secondary">{userData.dob}</p>
            )}
          </div>
        </div>

        <div className="mt-10 mx-auto md:mx-0">
          {isEdit ? (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={updateUserProfileData}
            >
              Save
            </button>
          ) : (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => setIsEdit(true)}
            >
              Edit
            </button>
          )}
        </div>
    </div>
  );
};

export default MyProfile;
