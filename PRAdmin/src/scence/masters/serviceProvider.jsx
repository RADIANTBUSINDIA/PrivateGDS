import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axios from "axios";
import BASE_URL from "../../configAPI";

const ServiceProvider = () => {
  const [form, setForm] = useState({
    spId: "",
    serviceProviderName: "",
    logoPath: "",
    gstNo: "",
    licenseNo: "",
    panCardNo: "",
    address: "",
    contactNo: "",
    emailId: "",
    advanceBookingDays: "",
    maxSeats: "",
    pnrPrefix: "",
    stateId: "",
    placeId: "",
    effectFrom: "",
    effectTo: "",
  });

  const spNameInputRef = useRef(null);
const fileInputRef = useRef(null); 
  const [spList, setSpList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [placeList, setPlaceList] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedPath = response.data?.imagePath || "";
      if (uploadedPath) {
        setForm((prev) => ({ ...prev, logoPath: uploadedPath })); // ✅ use logoPath
      } else {
        setMessage("Image path not found in response");
      }
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      setMessage("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // File change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, GIF, and WebP formats are allowed.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    uploadFile(file); // ✅ upload silently (no preview)
  };

  const handleReset = () => {
    setForm({
      spId: "",
      serviceProviderName: "",
      logoPath: "",
      gstNo: "",
      licenseNo: "",
      panCardNo: "",
      address: "",
      contactNo: "",
      emailId: "",
      advanceBookingDays: "",
      maxSeats: "",
      pnrPrefix: "",
      stateId: "",
      placeId: "",
      effectFrom: "",
      effectTo: "",
    });

    setMessage("");

    setSelectedFile(null); // reset selected file
  setMessage("");

  if (fileInputRef.current) {
    fileInputRef.current.value = ""; // manually clear file input
  }


    setTimeout(() => {
      spNameInputRef?.current?.focus();
    }, 0);
  };

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const fetchServiceProviders = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/serviceProvider/list`,
        getAuthHeaders()
      );
      if (res.data.success) {
        setSpList(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
    }
  };

  useEffect(() => {
    fetchServiceProviders();
    getStates();
    getPlaces();
  }, []);

  const handleEdit = (item) => {
    setForm({
      spId: item.spId,
      serviceProviderName: item.serviceProviderName,
      logoPath: item.logoPath, // ✅ keep only path
      gstNo: item.gstNo,
      licenseNo: item.licenseNo,
      panCardNo: item.panCardNo,
      address: item.address,
      contactNo: item.contactNo,
      emailId: item.emailId,
      advanceBookingDays: item.advanceBookingDays,
      maxSeats: item.maxSeats,
      pnrPrefix: item.pnrPrefix,
      stateId: item.stateId,
      placeId: item.placeId,
      effectFrom: item.effectFrom,
      effectTo: item.effectTo,
    });

    setMessage(`Editing: ${item.serviceProviderName}`);
    setTimeout(() => {
      spNameInputRef.current?.focus();
    }, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const getStates = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/getState`,
        getAuthHeaders()
      );
      const allData = res.data.data || [];
      console.log("data", allData);

      setStateList(allData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setStateList([]);
    }
  };

  const getPlaces = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/getPlacesLists`,
        getAuthHeaders()
      );
      const allData = res.data.data || [];
      console.log("data", allData);

      setPlaceList(allData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setPlaceList([]);
    }
  };

  const placeOptions = placeList.map((place) => {
    return {
      value: place.ID,
      label: place.NAME,
    };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = form.spId
        ? `${BASE_URL}/serviceProvider/update`
        : `${BASE_URL}/serviceProvider/insert`;

      const response = await axios.post(url, form, getAuthHeaders());

      
        setMessage(
          response.data.message
        );
        handleReset();
        fetchServiceProviders();
     
    } catch (err) {
      console.error(err);
      setMessage("Error occurred while saving service provider");
    }
  };

  return (
    <div className="container my-5">
      {/* 🔔 Message */}
      {message && (
        <div
          className={`alert ${
            message.includes("failed") ? "alert-warning" : "alert-success"
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

      <div className="card shadow border-0 rounded-4 mb-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">Service Provider Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            {/* Service Provider Name */}
            <div className="col-md-4">
              <label htmlFor="serviceProviderName" className="form-label">
                Service Provider Name <span className="text-danger">*</span>
              </label>
              <input
                id="serviceProviderName"
                type="text"
                name="serviceProviderName"
                value={form.serviceProviderName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter provider name"
                required
                ref={spNameInputRef}
              />
            </div>

            {/* Logo Path */}

            <div className="col-md-4">
              <label htmlFor="logoPath" className="form-label">
                Logo Path <span className="text-danger">*</span>
              </label>
              <input
                id="logoPath"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control"
                ref={fileInputRef} 
              />
              {uploading && <p className="text-primary mt-1">Uploading...</p>}
            </div>

            {/* GST No */}
            <div className="col-md-4">
              <label htmlFor="gstNo" className="form-label">
                GST No
              </label>
              <input
                id="gstNo"
                type="text"
                name="gstNo"
                value={form.gstNo}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter GST Number"
              />
            </div>

            {/* License No */}
            <div className="col-md-4">
              <label htmlFor="licenseNo" className="form-label">
                License No
              </label>
              <input
                id="licenseNo"
                type="text"
                name="licenseNo"
                value={form.licenseNo}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter License Number"
              />
            </div>

            {/* PAN Card No */}
            <div className="col-md-4">
              <label htmlFor="panCardNo" className="form-label">
                PAN Card No
              </label>
              <input
                id="panCardNo"
                type="text"
                name="panCardNo"
                value={form.panCardNo}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter PAN Number"
              />
            </div>

            {/* Address */}
            <div className="col-md-4">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                id="address"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Address"
              />
            </div>

            
            

            {/* Contact No */}
            <div className="col-md-4">
              <label htmlFor="contactNo" className="form-label">
                Contact No
              </label>
              <input
                id="contactNo"
                type="text"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Contact Number"
              />
            </div>

            {/* Email ID */}
            <div className="col-md-4">
              <label htmlFor="emailId" className="form-label">
                Email ID
              </label>
              <input
                id="emailId"
                type="email"
                name="emailId"
                value={form.emailId}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Email"
              />
            </div>

            {/* Advance Booking Days */}
            <div className="col-md-4">
              <label htmlFor="advanceBookingDays" className="form-label">
                Advance Booking Days
              </label>
              <input
                id="advanceBookingDays"
                type="number"
                name="advanceBookingDays"
                value={form.advanceBookingDays}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter no. of days"
              />
            </div>

            {/* Max Seats */}
            <div className="col-md-4">
              <label htmlFor="maxSeats" className="form-label">
                Max Seats
              </label>
              <input
                id="maxSeats"
                type="number"
                name="maxSeats"
                value={form.maxSeats}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter max seats"
              />
            </div>

            {/* PNR Prefix */}
            <div className="col-md-4">
              <label htmlFor="pnrPrefix" className="form-label">
                PNR Prefix
              </label>
              <input
                id="pnrPrefix"
                type="text"
                name="pnrPrefix"
                value={form.pnrPrefix}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter PNR Prefix"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="stateId" className="form-label">
                State <span className="text-danger">*</span>
              </label>
              <select
                id="stateId"
                name="stateId"
                value={form.stateId}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">-- Select State --</option>
                {stateList.map((s) => (
                  <option key={s.stateId} value={s.stateId}>
                    {s.stateName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Place Name <span className="text-danger">*</span>
              </label>
              <Select
                options={placeOptions}
                value={
                  form.placeId
                    ? placeOptions.find(
                        (option) => option.value === String(form.placeId)
                      )
                    : null
                }
                onChange={(selected) =>
                  handleSearchChange({
                    target: {
                      name: "placeId",
                      value: selected?.value || null,
                    },
                  })
                }
                placeholder="-- Select To Place --"
                isClearable
              />
            </div>

            {/* Effect From */}
            <div className="col-md-4">
              <label htmlFor="effectFrom" className="form-label">
                Effect From
              </label>
              <input
                id="effectFrom"
                type="date"
                name="effectFrom"
                value={form.effectFrom}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Effect To */}
            <div className="col-md-4">
              <label htmlFor="effectTo" className="form-label">
                Effect To
              </label>
              <input
                id="effectTo"
                type="date"
                name="effectTo"
                value={form.effectTo}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Buttons */}
            <div className="col-12 text-end d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn px-4"
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn px-4"
                style={{
                  backgroundColor: "#1e1e2d",
                  color: "#fff",
                  border: "none",
                }}
              >
                {form.spId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List of Service Providers */}
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h5 className="mb-3">Service Provider List</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>GST</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {spList.length > 0 ? (
                  spList.map((sp, index) => (
                    <tr key={sp.spId}>
                      <td>{index + 1}</td>
                      <td>{sp.serviceProviderName}</td>
                      <td>{sp.contactNo}</td>
                      <td>{sp.emailId}</td>
                      <td>{sp.gstNo}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(sp)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No service providers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProvider;
