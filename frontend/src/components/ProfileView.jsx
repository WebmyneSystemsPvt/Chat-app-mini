import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { userAPI } from "../services/api";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { updateProfile } from "../redux/actions/profileActions";
import useSocket from "../hooks/useSocket";

const profileSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

function ProfileView() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { handleBackToSidebar } = useOutletContext();

  const { id: userIdParam } = useParams();
  const user = useSelector((state) => state.user?.user);
  const { profile } = useSelector((state) => state.profile || {});
  const [viewedProfile, setViewedProfile] = useState(profile);

  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!userIdParam || userIdParam === user._id) {
          setViewedProfile(profile);
          return;
        }

        const res = await userAPI.getUser(userIdParam);
        if (res.data?.success) {
          setViewedProfile(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    }
    loadProfile();
  }, [userIdParam, user._id, profile]);

  useEffect(() => {
    if (viewedProfile) {
      reset({
        firstName: viewedProfile.firstName || "",
        lastName: viewedProfile.lastName || "",
        username: viewedProfile.username || "",
        email: viewedProfile.email || "",
      });
    }
  }, [viewedProfile, reset]);

  const onSubmit = async (data) => {
    try {
      if (!socket) throw new Error("Socket connection not available");
      const updatedUser = {
        ...user,
        ...data,
      };

      socket.emit(
        SOCKET_EVENTS.USER_UPDATE_PROFILE,
        updatedUser,
        (response) => {
          if (!response?.success) {
            reset({ ...user });
            toast.error(response?.message || "Failed to update profile");
            return;
          }

          const updatedData = response.data;
          console.log(updatedData);
          dispatch(updateProfile(updatedData));
          setViewedProfile(updatedData);
          reset(updatedData, { keepDirty: false });
          toast.success("Profile updated successfully");
        }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const isOwnProfile = viewedProfile?._id === user?._id;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="profile-view-form">
        <div className="profile-view-header">
          <button
            onClick={() =>
              window.innerWidth <= 768 &&
              handleBackToSidebar &&
              handleBackToSidebar()
            }
            className="sidebar-back-btn"
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              color: "black",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="profile-view-avatar-container">
            <div className="profile-view-avatar">
              {viewedProfile?.profilePicture ? (
                <img src={viewedProfile.profilePicture} alt="profile" />
              ) : (
                viewedProfile?.firstName?.charAt(0)?.toUpperCase()
              )}
            </div>
          </div>
        </div>

        <div className="profile-view-content">
          <div className="profile-view-grid">
            <div className="profile-view-field">
              <label className="profile-view-label">First Name</label>
              <input
                type="text"
                {...register("firstName")}
                readOnly={!isOwnProfile}
                className={`profile-view-input ${
                  errors.firstName
                    ? "profile-view-input-error"
                    : "profile-view-input-normal"
                }`}
              />
              {errors.firstName && (
                <p className="profile-view-error">{errors.firstName.message}</p>
              )}
            </div>

            <div className="profile-view-field">
              <label className="profile-view-label">Last Name</label>
              <input
                type="text"
                {...register("lastName")}
                readOnly={!isOwnProfile}
                className={`profile-view-input ${
                  errors.lastName
                    ? "profile-view-input-error"
                    : "profile-view-input-normal"
                }`}
              />
              {errors.lastName && (
                <p className="profile-view-error">{errors.lastName.message}</p>
              )}
            </div>

            <div className="profile-view-field">
              <label className="profile-view-label">Username</label>
              <input
                type="text"
                {...register("username")}
                readOnly={!isOwnProfile}
                className={`profile-view-input ${
                  errors.username
                    ? "profile-view-input-error"
                    : "profile-view-input-normal"
                }`}
              />
              {errors.username && (
                <p className="profile-view-error">{errors.username.message}</p>
              )}
            </div>

            <div className="profile-view-field">
              <label className="profile-view-label">Email</label>
              <input
                type="email"
                {...register("email")}
                readOnly={!isOwnProfile}
                className={`profile-view-input ${
                  errors.email
                    ? "profile-view-input-error"
                    : "profile-view-input-readonly"
                }`}
              />
              {errors.email && (
                <p className="profile-view-error">{errors.email.message}</p>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <div className="profile-view-actions">
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className={`profile-view-submit-btn ${
                  !isDirty || isSubmitting
                    ? "profile-view-submit-btn-disabled"
                    : ""
                }`}
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </button>
            </div>
          )}
        </div>
      </form>
    </>
  );
}

export default ProfileView;
