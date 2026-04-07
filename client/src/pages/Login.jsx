import React from "react";
import LoginForm from "../components/auth/LoginForm";
import LandingNavbar from "../components/common/LandingNavbar";

function Login() {
  return (
    <div className="relative">
      <LandingNavbar />
      <LoginForm />
    </div>
  );
}

export default Login;
