import { useEffect } from "react";
import API from "../api/api";
import { useAppDispatch } from "../redux/hook";
import { setLoading, setLoggedUser } from "../redux/slices/userSlices";

export const useGetLoggedUser = () => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.post("/auth/get-curr-user", { token });

        if (res.data?.success) {
          dispatch(setLoggedUser(res.data.user));
          console.log("Logged user fetched:", res.data.user);
        } else {
          dispatch(setLoggedUser(null));
        }
      } catch (error) {
        console.error("Error fetching logged user:", error);
        dispatch(setLoggedUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [dispatch, token]);
};
