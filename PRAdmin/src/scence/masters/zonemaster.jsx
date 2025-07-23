// src/pages/ZoneMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const ZoneMaster = () => {
  const [form, setForm] = useState({
    placeId: "",
    zoneCode: "",
    zoneName: "",
  });

  const [zones, setZones] = useState([]);
  const [places, setPlaces] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchPlaces();
    fetchZones();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/lookup/places`, getAuthHeaders());
      setPlaces(res.data.data || []);
    } catch (err) {
      console.error("Error fetching places:", err);
    }
  };

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/zoneMaster/viewZones`, getAuthHeaders());
      setZones(res.data.data || []);
    } catch (err) {
      console.error("Error fetching zones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.placeId || !form.zoneCode || !form.zoneName) {
      setMessage("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        placeId: form.placeId,
        zoneCode: form.zoneCode,
        zoneName: form.zoneName,
      };

      const res = await axios.post(`${BASE_URL}/zoneMaster/insert`, payload, getAuthHeaders());
      const msg = res?.data?.meta?.message || "Saved successfully";
      setMessage(msg);
      if (res.data.meta.success) {
        setForm({ placeId: "", zoneCode: "", zoneName: "" });
        fetchZones();
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage(err.response?.data?.meta?.message || "Error saving zone");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body py-3 px-4 bg-dark text-white">
          <h4 className="mb-0">📍 Zone Master</h4>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.toLowerCase().includes("fail") ? "alert-warning" : "alert-success"} text-center`}>
          {message}
        </div>
      )}

      <div className="card shadow border-0 rounded-4 mb-4">
        <div className="card-body p-4 bg-white">
          <h5 className="text-center mb-4">Add Zone</h5>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-4">
              <select name="placeId" value={form.placeId} onChange={handleChange} className="form-select" required>
                <option value="">-- Select Place --</option>
                {places.map((p) => (
                  <option key={p.ID} value={p.ID}>{p.NAME}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" name="zoneCode" value={form.zoneCode} onChange={handleChange} className="form-control" placeholder="Zone Code" required />
            </div>
            <div className="col-md-4">
              <input type="text" name="zoneName" value={form.zoneName} onChange={handleChange} className="form-control" placeholder="Zone Name" required />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-light">
          <h5 className="mb-3">Zone List</h5>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <table className="table table-hover text-center">
              <thead className="table-dark">
                <tr>
                  <th>SL.NO</th>
                  <th>Place</th>
                  <th>Zone Code</th>
                  <th>Zone Name</th>
                </tr>
              </thead>
              <tbody>
                {zones.length > 0 ? (
                  zones.map((z, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{z.PLACENAME}</td>
                      <td>{z.ZONECODE}</td>
                      <td>{z.ZONENAME}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-muted">No zones found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneMaster;
