import { LoginForm } from "@/components/login-form";
import { toast } from "@/components/ui/toast";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. useNavigate import karein

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser, loading: authLoading } = useAuth();

  const [userData, setUserData] = useState({
    password: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleinputChange = (e) => {
    const { name, value } = e.target;
    setUserData((pre) => ({
      ...pre,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // API call
      const response = await loginUser(userData);

      if (response && response.user) {
        setUser(response.user);
        navigate("/dashboard");
      } else {
        throw new Error("Login response did not include user information.");
      }
    } catch (error) {
      console.log("Toast Error Message:", error.message);
      toast.add({
        type: "error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.status === "Active") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <div className="p-6">Checking authentication...</div>;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          userData={userData}
          onInputChange={handleinputChange}
          onSubmit={handleSubmit}
          loading={loading}
          errorMsg={errorMsg}
        />
      </div>
    </div>
  );
};

export default Login;
