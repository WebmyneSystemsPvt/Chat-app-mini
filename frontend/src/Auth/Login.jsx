import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";

import { authAPI } from "../services/api";
import { getToken } from "../utils/token";
import { setUser } from "../redux/actions/userActions";
import { loginSchema } from "../validation/loginSchema";

function Login() {
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onAuth = (userData) => {
    dispatch(
      setUser({
        ...userData,
        token: getToken(),
      })
    );
    navigate("/dashboard", { replace: true });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    if (errors?.email) {
      toast.error(errors.email.message);
    }
    if (errors?.password) {
      toast.error(errors.password.message);
    }
  }, [errors]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit = async (data) => {
    setError("");
    try {
      const response = await authAPI.login(data);
      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userData", JSON.stringify(user));

      onAuth({ ...user, token });
      toast.success(`Welcome back, ${user.username}!`);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-panel">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="login-field">
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className={`login-input ${
                errors.email ? "login-input-error" : ""
              }`}
              disabled={isSubmitting}
            />
          </div>
          <div className="login-field-last">
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className={`login-input ${
                errors.password ? "login-input-error" : ""
              }`}
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`login-btn ${isSubmitting ? "login-btn-disabled" : ""}`}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="login-footer">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="login-link"
            disabled={isSubmitting}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
