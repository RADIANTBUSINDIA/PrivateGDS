import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const LookupMaster = () => {
  const [form, setForm] = useState({
    moduleName: "",
    type: "",
    value: "",
    critical: "N",
    createdBy: 1,
  });

  const [filters, setFilters] = useState({
    lookupId: 0,
    moduleName: "",
    type: "",
  });

  const [lookupList, setLookupList] = useState([]);
  const [message, setMessage] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const moduleOptions = ["Booking", "Administration", "User", "Report"];
  const typeOptions = ["Roles", "Status", "Action", "Category"];


  useEffect(() => {
    fetchLookups();
  }, [filters]);

 const fetchLookups = async () => {
  try {
    const res = await axios.post(`${BASE_URL}/lookup/view`, {
      lookupId: filters.lookupId,
      moduleName: filters.moduleName,
      lookupType: filters.type,
    });

    setLookupList(res.data.data || []);
  } catch (err) {
    console.error("Fetch Error:", err);
    setLookupList([]);
  }
};


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.moduleName || !form.type || !form.value) {
      setMessage("Please fill in all mandatory fields.");
      return;
    }

    if (!form.critical) {
      setMessage("Please select Critical status (Active/Inactive).");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/lookup/insert`, form);
      const resultMsg = res?.data?.meta?.message || "Something happened";
      setMessage(resultMsg);

      if (res.data.meta.success && resultMsg !== "ALREADY EXISTS") {
        setForm({
          moduleName: "",
          type: "",
          value: "",
          critical: "N",
          createdBy: 1,
        });
        fetchLookups(); // refresh view
      }
    } catch (err) {
      console.error("Insert Error:", err);
      setMessage("Something went wrong while inserting.");
    }
  };

  return (
    <div className="container my-5">
      {/* 🔔 Message */}
      {message && (
        <div
          className={`alert ${
            message.includes("ALREADY") ? "alert-warning" : "alert-success"
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
          <h4 className="text-center mb-4">Lookup Master Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label htmlFor="moduleName" className="form-label">
                Module Name <span className="text-danger">*</span>
              </label>
              <input
                id="moduleName"
                type="text"
                name="moduleName"
                value={form.moduleName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter module name"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="type" className="form-label">
                Type <span className="text-danger">*</span>
              </label>
              <input
                id="type"
                type="text"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter type"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="value" className="form-label">
                Value <span className="text-danger">*</span>
              </label>
              <input
                id="value"
                type="text"
                name="value"
                value={form.value}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter value"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label d-block">
                Critical <span className="text-danger">*</span>
              </label>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="critical"
                  id="active"
                  value="Y"
                  checked={form.critical === "Y"}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label htmlFor="active" className="form-check-label">
                  Active
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="critical"
                  id="inactive"
                  value="N"
                  checked={form.critical === "N"}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label htmlFor="inactive" className="form-check-label">
                  Inactive
                </label>
              </div>
            </div>
            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn px-4"
                style={{
                  backgroundColor: "#2a5298",
                  color: "#fff",
                  border: "none",
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔍 Filter Section */}
      <div className="card shadow border-0 rounded-4 mb-4">
        <div className="card-body bg-light p-4">
          <h5 className="mb-3">Filter Records</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Lookup ID</label>
              <input
                type="number"
                name="lookupId"
                className="form-control"
                value={filters.lookupId}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Module Name</label>
              <select
                name="moduleName"
                className="form-select"
                value={filters.moduleName}
                onChange={handleFilterChange}
              >
                <option value="">-- All --</option>
                {moduleOptions.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select
                name="type"
                className="form-select"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">-- All --</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Table */}
      {lookupList.length > 0 && (
        <div className="card shadow mt-5 border-0 rounded-4">
          <div className="card-body bg-white p-4">
            <h5 className="text-center mb-3">Lookup Records</h5>
            <div className="table-responsive">
              <table className="table table-bordered text-center align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Module</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Critical</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lookupList.map((item) => (
                    <tr key={item.LOOKUPID}>
                      <td>{item.LOOKUPID}</td>
                      <td>{item.MODULENAME}</td>
                      <td>{item.LOOKUPTYPE}</td>
                      <td>{item.LOOKUPVALUE}</td>
                      <td>{item.CRITICAL}</td>
                      <td>{item.STATUS}</td>
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

export default LookupMaster;
