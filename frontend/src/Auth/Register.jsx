import { User } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";

import { authAPI } from "../services/api";
import { registerSchema } from "../validation/registerSchema";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const navigate = useNavigate();

  const [error, setError] = useState("");

  function switchToLogin() {
    navigate("/");
  }

  useEffect(() => {
    Object.values(errors).forEach((err) => {
      if (err?.message) toast.error(err.message);
    });
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
      const response = await authAPI.register(data);

      if (response.data?.success) {
        toast.success("Account created successfully! Please log in.");
        switchToLogin();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-panel">
          <h2 className="register-title">Create Account</h2>

          <div className="register-avatar-container">
            <div className="relative">
              <div className="register-avatar-placeholder">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="register-field">
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName")}
                className={`register-input ${
                  errors.firstName ? "register-input-error" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="register-field">
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName")}
                className={`register-input ${
                  errors.lastName ? "register-input-error" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="register-field">
              <input
                type="text"
                placeholder="Username"
                {...register("username")}
                className={`register-input ${
                  errors.username ? "register-input-error" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="register-field">
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`register-input ${
                  errors.email ? "register-input-error" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            <div className="register-field-last">
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`register-input ${
                  errors.password ? "register-input-error" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`register-btn ${
                isSubmitting ? "register-btn-disabled" : ""
              }`}
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="register-footer">
            Already have an account?{" "}
            <button
              type="button"
              onClick={switchToLogin}
              className="register-link"
              disabled={isSubmitting}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
