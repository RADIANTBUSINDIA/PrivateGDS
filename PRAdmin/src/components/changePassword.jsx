import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../configAPI";
import { useNavigate } from "react-router-dom";
import { FaBackward } from "react-icons/fa";


const ChangePassword = () => {
  const [form, setForm] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

    const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setForm((prevForm) => ({
          ...prevForm,
          username: payload.username || "", 
        }));
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/userMaster/changepassword`,
        {
          username: form.username,
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setMessage(response.data.message || "Password changed successfully.");
      setForm((prevForm) => ({
        ...prevForm,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage(
        error.response?.data?.message || "Failed to change password."
      );
    }
  };

  return (
    <div className="container my-5">
   
      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("fail") ||
            message.toLowerCase().includes("not")
              ? "alert-warning"
              : "alert-success"
          } mx-auto text-center px-3 py-2 shadow`}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            borderRadius: "12px",
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
         <div className="d-flex justify-content-between align-items-center mb-4">
  <h4 className="mb-0 fw-semibold text-dark">Change Password Form</h4>
  <button
    className="btn d-flex align-items-center gap-2 shadow-sm px-3 py-1 rounded-pill"
    style={{
      backgroundColor: "#1e1e2d",
      color: "#fff",
      fontSize: "0.9rem",
      transition: "all 0.3s ease",
    }}
    onClick={() => navigate(-1)}
    onMouseOver={(e) =>
      (e.currentTarget.style.backgroundColor = "#34344a")
    }
    onMouseOut={(e) =>
      (e.currentTarget.style.backgroundColor = "#1e1e2d")
    }
  >
    <FaBackward size={14} />
    Back
  </button>
</div>

          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label htmlFor="username" className="form-label">
                User Name <span className="text-danger">*</span>
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                className="form-control"
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="oldPassword" className="form-label">
                Old Password <span className="text-danger">*</span>
              </label>
              <input
                id="oldPassword"
                type="password"
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="newPassword" className="form-label">
                New Password <span className="text-danger">*</span>
              </label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn px-4"
                style={{
                  backgroundColor: "#1e1e2d",
                  color: "#fff",
                  border: "none",
                }}
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
