import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const ZoneMaster = () => {
  const [zones, setZones] = useState([]);
  const [places, setPlaces] = useState([]);
  const [form, setForm] = useState({
    zoneId: null,
    placeId: "",
    zoneCode: "",
    zoneName: "",
    status: "Active",
    createdBy: 1,
    modifiedBy: 1,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ✅ Clear message immediately on user interaction
  const clearMessage = () => {
    if (message) setMessage("");
  };

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchZones();
    fetchPlaces();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/zoneMaster/viewZones`, getAuthHeaders());
      const rows = res.data.data || [];

      const mappedZones = rows.map((z) => ({
        ZONEID: z.ZONEID,
        ZM_ZONECODE: z.ZONECODE,
        ZM_ZONENAME: z.ZONENAME,
        ZM_STATUS: z.STATUS,
        ZM_PLACEID: z.PLACEID,
      }));

      setZones(mappedZones);
    } catch (err) {
      console.error("❌ Error fetching zones:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaces = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/routeMaster/places`, getAuthHeaders());
      const data = res.data?.data || [];
      setPlaces(data);
    } catch (err) {
      console.error("Error fetching places:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearMessage(); // ✅ clear on typing/selecting
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessage(); // ✅ clear on submit

    if (!form.placeId || !form.zoneCode || !form.zoneName) {
      setMessage("❗ Please fill all required fields");
      return;
    }

    const payload = {
      placeId: form.placeId,
      zoneCode: form.zoneCode.trim(),
      zoneName: form.zoneName.trim(),
    };

    const dateSend = {
      zoneId: form.zoneId,
      zonePlaceId: form.placeId,
      zoneCode: form.zoneCode,
      zoneName: form.zoneName,
    };

    try {
      let res;
      if (form.zoneId) {
        res = await axios.post(`${BASE_URL}/zoneMaster/zoneMasterUpdate`, dateSend, getAuthHeaders());
      } else {
        res = await axios.post(`${BASE_URL}/zoneMaster/insert`, payload, getAuthHeaders());
      }

  

      if (res?.data?.meta?.success) {
        
        resetForm();
        fetchZones();
        setMessage(res?.data?.meta?.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Error saving zone");
    }
  };

  const resetForm = () => {
    setForm({
      zoneId: null,
      placeId: "",
      zoneCode: "",
      zoneName: "",
      status: "Active",
      createdBy: 1,
      modifiedBy: 1,
    });
    clearMessage(); // ✅ clear on cancel
  };

  const handleEdit = (z) => {
    setForm({
      zoneId: z.ZONEID,
      placeId: z.ZM_PLACEID,
      zoneCode: z.ZM_ZONECODE,
      zoneName: z.ZM_ZONENAME,
      status: z.ZM_STATUS === "A" ? "Active" : "Inactive",
      createdBy: 1,
      modifiedBy: 1,
    });
    clearMessage(); // ✅ clear on edit
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleZoneStatus = async (zoneId, currentStatus) => {
    clearMessage(); // ✅ clear on status toggle

    const newStatus = currentStatus === "A" ? "I" : "A";
    const statusLabel = newStatus === "A" ? "Activate" : "Deactivate";

    if (!window.confirm(`Are you sure you want to ${statusLabel} this zone?`)) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/zoneMaster/zoneMasterDelete`,
        {
          zoneId: zoneId,
          status: newStatus,
          modifiedBy: 1,
        },
        getAuthHeaders()
      );

      setMessage(res?.data?.data?.[0]?.RESULT );
      if (res?.data?.meta?.success) {
        setMessage(res?.data?.meta?.message);
        fetchZones();
      }
    } catch (err) {
      console.error("Toggle error:", err);
      setMessage("❌ Failed to update status");
    }
  };

  return (
    <div className="container my-4" onClick={clearMessage}>
      <div className="card border-0 rounded-4 shadow mb-4">
        <div className="card-body">
          <h4 className="text-center mb-4">🏘️ Zone Master</h4>
          {message && <div className="alert alert-info text-center">{message}</div>}
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <select
                name="placeId"
                value={form.placeId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">-- Select Place --</option>
                {places.map((p) => (
                  <option key={p.ID} value={p.ID}>
                    {p.NAME}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="zoneCode"
                value={form.zoneCode}
                onChange={handleChange}
                className="form-control"
                placeholder="Zone Code *"
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="zoneName"
                value={form.zoneName}
                onChange={handleChange}
                className="form-control"
                placeholder="Zone Name *"
              />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-dark">
                {form.zoneId ? "Update" : "Submit"}
              </button>
              {form.zoneId && (
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 rounded-4 shadow">
        <div className="card-body">
          <h5 className="mb-3">📋 Zone List</h5>
          {loading ? (
            <div className="text-center py-3">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover text-center">
                <thead className="table-dark">
                  <tr>
                    <th>SL.NO</th>
                    <th>PlaceName</th>
                    <th>Zone Code</th>
                    <th>Zone Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.length > 0 ? (
                    zones.map((z, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{places.find((p) => p.ID === z.ZM_PLACEID)?.NAME || "—"}</td>
                        <td>{z.ZM_ZONECODE}</td>
                        <td>{z.ZM_ZONENAME}</td>
                        <td>{z.ZM_STATUS === "A" ? "Active" : "Inactive"}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={() => handleEdit(z)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                backgroundColor: z.ZM_STATUS === "A" ? "#6c757d" : "#198754",
                                color: "#fff",
                              }}
                              onClick={() => toggleZoneStatus(z.ZONEID, z.ZM_STATUS)}
                            >
                              {z.ZM_STATUS === "A" ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-muted">
                        No zones found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneMaster;
