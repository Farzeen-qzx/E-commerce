import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { logout } from "../features/auth/authSlice.js";
import { getUserStatus } from "../services/userService";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(function (state) {
    return state.auth.user;
  });

  const userId = user?.id;

  const { data, isError, isPending } = useQuery({
    queryKey: ["userStatus", userId],

    queryFn: function () {
      return getUserStatus(userId);
    },

    enabled: !!userId,

    refetchInterval: 1000,

    refetchIntervalInBackground: true,

    refetchOnWindowFocus: true,

    retry: false,
  });

  const isBlocked = data?.data?.isBlocked === true;

  useEffect(
    function () {
      console.log("User ID:", userId);
      console.log("Latest user status:", data?.data?.isBlocked);

      if (isBlocked) {
        console.log("User blocked. Logging out.");

        dispatch(logout());

        navigate("/login", { replace: true });
      }
    },
    [isBlocked, userId, dispatch, navigate],
  );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isBlocked) {
    return null;
  }

  if (isPending) {
    return <p className="p-8">Checking account status...</p>;
  }

  if (isError) {
    return (
      <p className="p-8 text-red-600">
        Unable to verify your account. Please try again.
      </p>
    );
  }

  return children;
}

export default ProtectedRoute;
