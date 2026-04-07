import React from "react";
import RegistrationForm from "../components/auth/RegistrationForm";
import LandingNavbar from "../components/common/LandingNavbar";

function Register() {
  return (
    <div className="relative">
      <LandingNavbar />
      <RegistrationForm />
    </div>
  );
}

export default Register;
