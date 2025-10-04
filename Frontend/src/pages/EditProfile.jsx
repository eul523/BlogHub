import { useForm } from "react-hook-form";
import { Edit } from "lucide-react";
import api from "../api/api";
import { useState } from "react";
import { useNavigate, useLoaderData } from "react-router";
import { useNotificationStore } from "../stores/notificationStore";
import CircularProgress from '@mui/material/CircularProgress';

export async function loader() {
  const user = await api.get("/auth/me");
  return user.data.user;
}

export default function EditProfile() {
  const user = useLoaderData();
  const { register, formState: { errors, isSubmitting }, handleSubmit } = useForm({
    defaultValues: {
      name: user.name,
      description: user.description || "",
    },
  });
  const { addNotification } = useNotificationStore();
  const [imageUploading, setImageUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await api.put("/users/edit-profile", {
        name: data.name,
        description: data.description,
      });
      navigate("/me?msg=Profile+updated+successfully.");
    } catch (err) {
      addNotification(err?.response?.data?.msg || "Couldn't update profile.","error")
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const res = await api.post("/users/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileImage(res.data.profileImage);
    } catch (err) {
      addNotification(err?.response?.data?.msg || "Couldn't upload image.","error")
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5 container max-w-[700px] justify-center items-center m-auto">
      <form className="flex flex-col space-y-8 items-center p-4 w-[90%]" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative w-[200px] flex justify-center items-center">
          <img
            className="w-[200px] max-w-[50%] aspect-square rounded-full"
            src={import.meta.env.VITE_BASE_URL + profileImage}
            alt="Profile"
          />
          {imageUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="profileImageUpload"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="profileImageUpload"
            className="absolute bottom-2 right-2 bg-white dark:bg-[#1E1E1E] p-2 rounded-full shadow hover:bg-gray-100 hover:dark:bg-gray-700 cursor-pointer"
            aria-label="Edit profile image"
          >
            <Edit/>
          </label>
        </div>

        <input
          className="max-w-1/2 w-full border rounded-full h-[50px] focus:outline-black focus:outline-2 p-2"
          type="text"
          {...register("name")}
          placeholder="The name you want to change to."
        />
        <input
          className="min-w-1/2 border rounded-full h-[50px] focus:outline-black focus:outline-2 p-2"
          type="text"
          {...register("description")}
          placeholder="About you..."
        />


        <button
          className="text-white max-w-[700px] min-w-1/2 h-[50px] rounded-full bg-blue-600"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && <CircularProgress color="white" size={10} className="inline" />}
          {isSubmitting ? "Saving" : "Save"}
        </button>
      </form>
    </div>
  );
}