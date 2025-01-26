import React, { useEffect } from "react";
import "./index.css";
import { useLocation, useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  console.log(location);

  useEffect(() => {
    navigate("/applink");
  }, [navigate, location]);

  return (
    <div className="userProfileSection">
      <section>
        <h2 style={{ marginTop: "30px" }}>User profile</h2>
        <div className="pDiv">
          <p>Opening Bonfiire app in mobile or redirecting to download link</p>
        </div>
      </section>
    </div>
  );
};

export default UserProfilePage;
