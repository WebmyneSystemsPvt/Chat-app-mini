import { useEffect } from "react";
import { useDispatch } from "react-redux";

import useUser from "./useUser";
import { userAPI } from "../services/api";
import { setUser } from "../redux/actions/userActions";
import { setProfile } from "../redux/actions/profileActions";

export default function useFetchUserProfile() {
  const dispatch = useDispatch();
  const userId = useUser()?.id;

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.data?.success) {
        const userData = response.data.data;
        dispatch(setProfile(userData));
        localStorage.setItem("userData", JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Profile fetch failed:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchUserProfile().then((userData) => {
      dispatch(setUser(userData));
    });
  }, [userId]);
}
