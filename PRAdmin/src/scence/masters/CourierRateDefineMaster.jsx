import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const CourierRateDefineMaster = () => {
  const [rates, setRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    rateId: null,
    fromKm: "",
    toKm: "",
    fromWeight: "",
    toWeight: "",
    size: "",
    totalFare: "",
    deliveryMode: "",
    createdBy: 1,
    modifiedBy: 1,
    status: "Active",
  });

  const sizes = ["SMALL", "MEDIUM", "LARGE"];
  const deliveryModes = ["EXPRESS", "STANDARD"]; 

  const formRef = useRef(null); // ✅ Ref for scrolling to form

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/parcelCounter/courier/rateView`,
        getAuthHeaders()
      );

      const rows = res?.data?.data || [];

      const mappedRate = rows.map((r) => ({
        rateId: r.ID,
        fromKm: r.FROM_KILOMETER || "",
        toKm: r.TO_KILOMETER || "",
        fromWeight: r.FROM_WEIGHT || "",
        toWeight: r.TO_WEIGHT || "",
        size: r.SIZE || "",
        totalFare: r.TOTAL_AMOUNT || "",
        deliveryMode: r.DELIVERY_MODE || "",
        status: r.STATUS === "A" ? "Active" : "Inactive",
      }));

      setRates(mappedRate);
    } catch (err) {
      console.error("❌ Error fetching courier rates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      rateId: null,
      fromKm: "",
      toKm: "",
      fromWeight: "",
      toWeight: "",
      size: "",
      totalFare: "",
      deliveryMode: "",
      createdBy: 1,
      modifiedBy: 1,
      status: "Active",
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const newErrors = {};

    if (!form.fromKm || isNaN(form.fromKm)) {
      newErrors.fromKm = "Valid From Km is required";
    }

    if (!form.toKm || isNaN(form.toKm)) {
      newErrors.toKm = "Valid To Km is required";
    }

    if (!form.fromWeight || isNaN(form.fromWeight)) {
      newErrors.fromWeight = "Valid From Weight is required";
    }

    if (!form.toWeight || isNaN(form.toWeight)) {
      newErrors.toWeight = "Valid To Weight is required";
    }

    if (!form.size || !sizes.includes(form.size)) {
      newErrors.size = "Valid Size must be selected";
    }

    if (!form.totalFare || isNaN(form.totalFare)) {
      newErrors.totalFare = "Valid Fare is required";
    }

    if (!form.deliveryMode || !deliveryModes.includes(form.deliveryMode)) {
      newErrors.deliveryMode = "Valid Delivery Mode is required";
    }

    if (!newErrors.fromKm && !newErrors.toKm) {
      const fromKm = Number(form.fromKm);
      const toKm = Number(form.toKm);
      if (fromKm >= toKm) {
        newErrors.toKm = "To Km must be greater than From Km";
      }
    }

    if (!newErrors.fromWeight && !newErrors.toWeight) {
      const fromWeight = Number(form.fromWeight);
      const toWeight = Number(form.toWeight);
      if (fromWeight >= toWeight) {
        newErrors.toWeight = "To Weight must be greater than From Weight";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = form.rateId ? "rateUpdate" : "insert";

      const payload = form.rateId
        ? {
            rateId: form.rateId,
            fromKm: form.fromKm,
            toKm: form.toKm,
            fromWeight: form.fromWeight,
            toWeight: form.toWeight,
            size: form.size,
            totalFare: form.totalFare,
            deliveryMode: form.deliveryMode,
            modifiedBy: form.modifiedBy,
          }
        : {
            fromKm: form.fromKm,
            toKm: form.toKm,
            fromWeight: form.fromWeight,
            toWeight: form.toWeight,
            size: form.size,
            totalFare: form.totalFare,
            deliveryMode: form.deliveryMode,
            createdBy: form.createdBy,
          };

      const res = await axios.post(
        `${BASE_URL}/parcelCounter/courier/${endpoint}`,
        payload,
        getAuthHeaders()
      );

      const msg = res?.data?.meta?.message || "Saved successfully";
      setMessage(msg);

      if (res.data.meta.success) {
        resetForm();
        fetchRates();
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage(
        err.response?.data?.meta?.message ||
          "Error saving Courier Rate Define"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (rateId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "I" : "A";
    const displayStatus = newStatus === "I" ? "Inactive" : "Active";

    const confirmChange = window.confirm(`Change status to ${displayStatus}?`);
    if (!confirmChange) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/parcelCounter/courier/rateStatus`,
        { rateId, status: newStatus },
        getAuthHeaders()
      );

      const msg = res?.data?.meta?.message || "Status updated";
      setMessage(msg);

      if (res.data?.meta?.success) fetchRates();
    } catch (err) {
      console.error("❌ Status toggle error:", err);
      setMessage("Status update failed");
    }
  };

  const handleEdit = (rate) => {
    setForm({ ...rate });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div
          className="card-body py-3 px-4 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#1e1e2d", color: "white" }}
        >
          <h4 className="mb-0">Courier Rate Define Master</h4>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("fail")
              ? "alert-warning"
              : "alert-success"
          } text-center px-3 py-2 shadow`}
          style={{
            borderRadius: "12px",
            fontWeight: 500,
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {message}
        </div>
      )}

      <div className="card shadow border-0 rounded-4 mb-4" ref={formRef}>
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">
            {form.rateId ? "Edit Rate" : "Add Rate"}
          </h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <input
                type="number"
                name="fromKm"
                placeholder="From KM"
                value={form.fromKm}
                onChange={handleChange}
                className="form-control"
              />
              {errors.fromKm && (
                <small className="text-danger">{errors.fromKm}</small>
              )}
            </div>
            <div className="col-md-6">
              <input
                type="number"
                name="toKm"
                placeholder="To KM"
                value={form.toKm}
                onChange={handleChange}
                className="form-control"
              />
              {errors.toKm && (
                <small className="text-danger">{errors.toKm}</small>
              )}
            </div>
            <div className="col-md-6">
              <input
                type="number"
                name="fromWeight"
                placeholder="From Weight"
                value={form.fromWeight}
                onChange={handleChange}
                className="form-control"
              />
              {errors.fromWeight && (
                <small className="text-danger">{errors.fromWeight}</small>
              )}
            </div>
            <div className="col-md-6">
              <input
                type="number"
                name="toWeight"
                placeholder="To Weight"
                value={form.toWeight}
                onChange={handleChange}
                className="form-control"
              />
              {errors.toWeight && (
                <small className="text-danger">{errors.toWeight}</small>
              )}
            </div>
            <div className="col-md-6">
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Size</option>
                {sizes.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
              {errors.size && (
                <small className="text-danger">{errors.size}</small>
              )}
            </div>
            <div className="col-md-6">
              <input
                type="number"
                name="totalFare"
                placeholder="Total Fare"
                value={form.totalFare}
                onChange={handleChange}
                className="form-control"
              />
              {errors.totalFare && (
                <small className="text-danger">{errors.totalFare}</small>
              )}
            </div>
            <div className="col-md-6">
              <select
                name="deliveryMode"
                value={form.deliveryMode}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Delivery Mode</option>
                {deliveryModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              {errors.deliveryMode && (
                <small className="text-danger">{errors.deliveryMode}</small>
              )}
            </div>
           <div className="col-12 d-flex justify-content-end gap-2">
            <button
              type="submit"
              className="btn px-4"
              style={{ backgroundColor: "#1e1e2d", color: "#fff" }}
              disabled={submitting}
            >
              {submitting ? "Saving..." : form.rateId ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>

          </form>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-light">
          <h5 className="mb-3">Courier Rate List</h5>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search by KM or Weight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                  <tr>
                    <th>SL.NO</th>
                    <th>From KM</th>
                    <th>To KM</th>
                    <th>From Weight</th>
                    <th>To Weight</th>
                    <th>Size</th>
                    <th>Total Fare</th>
                    <th>Delivery Mode</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.length > 0 ? (
                    rates
                      .filter(
                        (r) =>
                          String(r.fromKm)
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          String(r.toKm)
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((r, index) => (
                        <tr key={r.rateId || index}>
                          <td>{index + 1}</td>
                          <td>{r.fromKm}</td>
                          <td>{r.toKm}</td>
                          <td>{r.fromWeight}</td>
                          <td>{r.toWeight}</td>
                          <td>{r.size}</td>
                          <td>{r.totalFare}</td>
                          <td>{r.deliveryMode}</td>
                          <td>{r.status}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-dark me-2"
                              onClick={() => handleEdit(r)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm rounded-pill px-3"
                              style={{
                                backgroundColor:
                                  r.status === "Active" ? "#6c757d" : "#2a5298",
                                color: "#fff",
                              }}
                              onClick={() => toggleStatus(r.rateId, r.status)}
                              aria-label="Toggle Status"
                            >
                              {r.status === "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierRateDefineMaster;
