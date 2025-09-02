import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const PlaceMaster = () => {
  const [form, setForm] = useState({
    placeCode: "",
    placeName: "",
    stateId: "",
    createdBy: 1,
    placeId: null,
  });
  const [filters, setFilters] = useState({ stateId: "" });
  const [places, setPlaces] = useState([]);
  const [states, setStates] = useState([]);
  const [message, setMessage] = useState("");
  const placeInputRef = useRef(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [filters]);

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dropdown/getState`, getAuthHeaders());
      if (res.data.meta.success) setStates(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlaces = async () => {
    try {
      const payload = filters.stateId ? { stateId: +filters.stateId } : {};
      const res = await axios.post(`${BASE_URL}/placeMaster/view`, payload, getAuthHeaders());
      setPlaces(res.data.data || []);
    } catch (e) {
      console.error(e);
      setPlaces([]);
    }
  };


const handleToggleStatus = async (placeId, currentStatus) => {
  const newStatus = currentStatus === "A" ? "I" : "A";
  const confirmMsg = `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`;
  if (!window.confirm(confirmMsg)) return;

  const payload = {
    placeId,
    status: newStatus,
    modifiedBy: 1       // add this as in your initial example
  };
  console.log("Payload to send:", payload);

  try {
    const res = await axios.put(
      `${BASE_URL}/placeMaster/toggleStatus`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()?.headers
        }
      }
    );
    const msg = res?.data?.meta?.message || "Status updated successfully";
    setMessage(msg);

    if (res.data?.meta?.success) {
      fetchPlaces(); // refresh list
    }
  } catch (err) {
    console.error("Toggle Error:", err);
    const msg = err?.response?.data?.meta?.message || "Failed to toggle status.";
    setMessage(msg);
  }
};

  const handleEdit = (p) => {
    setForm({
      placeId: p.PLACE_ID,
      placeCode: p.PLACECODE,
      placeName: p.PLACENAME,
      stateId: p.STATE_ID,
      createdBy: 1,
    });
    setMessage(`Editing Place: ${p.PLACENAME}`);
    setTimeout(() => placeInputRef.current?.focus(), 0);
  };

  
  const onFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    const { placeCode, placeName, stateId } = form;
    if (!placeCode || !placeName || !stateId) {
      setMessage("Please fill all fields.");
      return;
    }
    try {
      const res = form.placeId
        ? await axios.put(`${BASE_URL}/placeMaster/update`, { ...form, stateId: +stateId }, getAuthHeaders())
        : await axios.post(`${BASE_URL}/placeMaster/insert`, { ...form, stateId: +stateId }, getAuthHeaders());
      setMessage(res.data.meta.message || "Saved successfully.");

      if (res.data.meta.success) {
        setForm({ placeCode: "", placeName: "", stateId: "", createdBy: 1, placeId: null });
        fetchPlaces();
      }
    } catch (e) {
      console.error(e);
      setMessage(e.response?.data?.meta?.message || "Error saving place.");
    }
  };

  return (
    <div className="container my-5">
      {/* 🔔 Message */}
      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("error") || message.toLowerCase().includes("please")
              ? "alert-danger"
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

      {/* 📝 Form Section */}
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">Place Master </h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-4">
              <label htmlFor="stateId" className="form-label">
                State <span className="text-danger">*</span>
              </label>
            <select
                id="stateId"
                name="stateId"
                value={form.stateId}
                onChange={onFormChange}
                className="form-select"
                required
              >
                <option value="">-- Select State --</option>
                {states.map((s) => (
                  <option key={s.stateId} value={s.stateId}>
                    {s.stateName}
                  </option>
                ))}
              </select>  
            </div>
            <div className="col-md-4">
              <label htmlFor="placeCode" className="form-label">
                Place Code <span className="text-danger">*</span>
              </label>
              <input
                id="placeCode"
                name="placeCode"
                ref={placeInputRef}
                value={form.placeCode}
                onChange={onFormChange}
                className="form-control"
                placeholder="Enter Place Code"
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="placeName" className="form-label">
                Place Name <span className="text-danger">*</span>
              </label>
              <input
                id="placeName"
                name="placeName"
                value={form.placeName}
                onChange={onFormChange}
                className="form-control"
                placeholder="Enter Place Name"
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
                {form.placeId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔍 Filter Section */}
      <div className="card shadow border-0 rounded-4 my-4">
        <div className="card-body bg-light p-4">
          <h5 className="mb-3">Filter By State</h5>
          <select
            name="stateId"
            value={filters.stateId}
            onChange={onFilterChange}
            className="form-select"
            style={{ maxWidth: "300px" }}
          >
            <option value="">-- All States --</option>
            {states.map((s) => (
              <option key={s.stateId} value={s.stateId}>
                {s.stateName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📋 Table */}
      {places.length > 0 && (
        <div
          className="card shadow mt-5 border-0 rounded-4"
          style={{ backgroundColor: "#ffff" }}
        >
          <div className="card-body p-4">
            <h5
              className="text-center mb-4 fw-bold"
              style={{ color: "#1e1e2d" }}
            >
              Place Records
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead
                  style={{ backgroundColor: "#1e1e2d", color: "#ffff" }}
                >
                  <tr>
                    <th>State</th>
                    <th>Place Code</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th style={{ minWidth: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map((p) => (
                    <tr key={p.PLACE_ID}>
                      <td>{p.STATE_NAME}</td>
                      <td>{p.PLACECODE}</td>
                      <td>{p.PLACENAME}</td>
                      <td>{p.STATUS === "A" ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: "#1e1e2d",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => handleEdit(p)}
                          >
                            ✏️ Edit
                          </button>

                              <button
                                className="btn btn-sm rounded-pill px-3"
                                     style={{
                                      backgroundColor: p.STATUS === 'A' ? '#6c757d' : '#2a5298',
                                      color: '#fff',
                                     border: 'none',
                                           }}
                               onClick={() => 
                                handleToggleStatus(p.PLACE_ID, p.STATUS)
                                        }
                             >
                                {p.STATUS === "A" 
                                 ? "Deactivate" 
                                 : "Activate"}
                             </button>
                     
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceMaster;
