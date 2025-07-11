import React, { useState, useEffect, useRef } from "react";

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
const moduleInputRef = useRef(null);

  const [filters, setFilters] = useState({
    lookupId: 0,
    moduleName: "",
    type: "",
  });

  const [lookupList, setLookupList] = useState([]);
  const [message, setMessage] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    fetchLookups();
  }, [filters]);

  const fetchLookups = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/lookup/view`, {
        lookupId: 0, 
        moduleName: "",
        lookupType: "",
      });

     
      const allData = res.data.data || [];

      
      const filtered = allData.filter((item) => {
        const matchModule =
          filters.moduleName === "" ||
          item.MODULENAME.toLowerCase().includes(
            filters.moduleName.toLowerCase()
          );

        const matchType =
          filters.type === "" ||
          item.LOOKUPTYPE.toLowerCase().includes(filters.type.toLowerCase());

        return matchModule && matchType;
      });

      setLookupList(filtered);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLookupList([]);
    }
  };

const handleEdit = (item) => {
  setForm({
    lookupId: item.LOOKUPID,
    moduleName: item.MODULENAME,
    type: item.LOOKUPTYPE,
    value: item.LOOKUPVALUE,
    critical: item.CRITICAL,
    createdBy: 1,
  });

  setMessage(`Editing Module Name: ${item.MODULENAME}`);

  
  setTimeout(() => {
    moduleInputRef.current?.focus();
  }, 0);
};


const handleToggleStatus = async (lookupId, currentStatus) => {
  const newStatus = currentStatus === "A" ? "I" : "A";

  const confirmMsg = `Are you sure you want to change status to ${
    newStatus === "A" ? "Active" : "Inactive"
  }?`;
  if (!window.confirm(confirmMsg)) return;

  const payload = {
    status: newStatus,
    modifiedBy: 1, 
  };

  console.log("Payload to send:", payload);

  try {
    const res = await axios.put(`${BASE_URL}/lookup/inactive/${lookupId}`, payload);
    const msg = res?.data?.meta?.message || "Status updated";
    setMessage(msg);

    if (res.data.meta.success) {
      fetchLookups(); // Refresh updated data
    }
  } catch (err) {
    console.error("Toggle Error:", err);
    setMessage("Failed to toggle status.");
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

    const payload = {
      lookupId: form.lookupId, 
      moduleName: form.moduleName,
      type: form.type,
      value: form.value,
      critical: form.critical,
      createdBy: form.createdBy,
    };

    console.log(payload, "payyyyyyyyyy");
    try {
      let res;
      if (form.lookupId) {
        
        res = await axios.put(`${BASE_URL}/lookup/update`, payload);
      } else {
        
        res = await axios.post(`${BASE_URL}/lookup/insert`, payload);
      }

      const resultMsg = res?.data?.meta?.message || "Something happened";
      setMessage(resultMsg);

      if (res.data.meta.success) {
        setForm({
          lookupId: null,
          moduleName: "",
          type: "",
          value: "",
          critical: "N",
          createdBy: 1,
        });
        fetchLookups();
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Something went wrong while saving.");
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
                ref={moduleInputRef}
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
                  Yes
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
                  No
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
>
  {form.lookupId ? "Update" : "Submit"}
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
            <div className="col-md-6">
              <label className="form-label">Module Name</label>
              <input
                type="text"
                name="moduleName"
                className="form-control"
                value={filters.moduleName}
                onChange={handleFilterChange}
                placeholder="e.g., Booking, User"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Type</label>
              <input
                type="text"
                name="type"
                className="form-control"
                value={filters.type}
                onChange={handleFilterChange}
                placeholder="e.g., Roles, Status"
              />
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
              <table className="table table-bordered text-center align-middle table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Module</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Critical</th>
                    <th>Status</th>
                    <th>Actions</th>
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
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${
                            item.STATUS === "A" ? "btn-info" : "btn-success"
                          }`}
                          onClick={() =>
                            handleToggleStatus(item.LOOKUPID, item.STATUS)
                          }
                        >
                          {item.STATUS === "A"
                            ? "Make Inactive"
                            : "Make Active"}
                        </button>
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

export default LookupMaster;
