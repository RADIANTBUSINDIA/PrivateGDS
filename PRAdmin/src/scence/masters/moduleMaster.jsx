import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const ModuleMaster = () => {
  const moduleInputRef = useRef(null);
  const [moduleList, setModuleList] = useState([]);
  const [message, setMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mainModuleDrop, setModuleDrop] = useState([]);
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const [form, setForm] = useState({
    moduleName: "",
    moduleOrder: "",
    moduleId: null,
    moduleStatus: "",
    mdId: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });
  };
  const handleReset = () => {
  setForm({
    moduleName: "",
    moduleOrder: "",
    moduleId: null,
    moduleStatus: "",
    mdId: "",
  });

  // Optional: also clear message or dropdown visibility
  setMessage("");
  setShowDropdown(false);

  // Optional: focus first input field
  setTimeout(() => {
    moduleInputRef.current?.focus();
  }, 0);
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.moduleName || !form.moduleOrder) {
      setMessage("Please fill in all mandatory fields.");
      return;
    }

    const payload = {
      mdmId: form.mdId,
      moduleId: form.moduleId,
      moduleName: form.moduleName,
      moduleOrder: form.moduleOrder,
    };

    console.log(payload);
    try {
      var res;
      if (form.mdId) {
        res = await axios.put(
          `${BASE_URL}/moduleMaster/update`,
          payload,
          getAuthHeaders()
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/moduleMaster/insert`,
          payload,
          getAuthHeaders()
        );
      }

      const resultMsg = res?.data?.meta?.message;
      setMessage(resultMsg);
      if (res.data.meta.success) {
        setForm({
          moduleName: "",
          moduleOrder: "",
          moduleId: null,
          moduleStatus: "",
          mdId: "",
        });
        getDropDownMainModule();
        getAllModel();
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMsg =
        err?.response?.data?.meta?.message || "Error saving record.";
      setMessage(errorMsg);
    }
  };

  //const handleFilterChange = (e) => {};

const handleEdit = (item) => {
  const isSubmodule = item.SUBMODULENAME !== null && item.SUBMODULENAME !== undefined;

  setShowDropdown(isSubmodule);

  setForm({
    moduleName: isSubmodule ? item.SUBMODULENAME : item.MDM_NAME,
    moduleOrder: item.ORDER_NUM,
    moduleId: isSubmodule ? item.SUBMODULEID : null, 
    moduleStatus: item.MDM_STATUS,
    mdId: item.MDM_ID, 
  });

  setMessage(
    `Editing ${isSubmodule ? "Submodule" : "Module"}: ${isSubmodule ? item.SUBMODULENAME : item.MDM_NAME}`
  );

  setTimeout(() => {
    moduleInputRef.current?.focus();
  }, 0);
};





  const handleToggleStatus = async (mdmId, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (
      !window.confirm(
        `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`
      )
    )
      return;

    try {
      const res = await axios.put(
        `${BASE_URL}/moduleMaster/toggleStatus`,
        { mdmId: mdmId, status: newStatus },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message);
      if (res.data.meta.success) getAllModel();
    } catch (err) {
      console.error("Toggle Error:", err);
      const msg =
        err?.response?.data?.meta?.message || "Failed to toggle status.";
      setMessage(msg);
    }
  };

  const getAllModel = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/moduleMaster/view`,
        getAuthHeaders()
      );
      const allData = res.data.data || [];
      console.log("data", allData);

      setModuleList(allData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setModuleList([]);
    }
  };

  useEffect(() => {
    getAllModel();
  }, []);

  const getDropDownMainModule = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropDown/mainModule`,
        getAuthHeaders()
      );

      const allData = res.data.data || [];
      console.log(allData);

      setModuleDrop(allData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setModuleDrop([]);
    }
  };

  useEffect(() => {
    getDropDownMainModule();
  }, []);

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
          <h4 className="text-center mb-4">Module Master Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label className="form-label d-block">Submodule Toggle</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchShowDropdown"
                  checked={showDropdown}
                  onChange={() => setShowDropdown(!showDropdown)}
                  style={{
                    backgroundColor: showDropdown ? "#1e1e2d" : "",
                    borderColor: "#1e1e2d",
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="flexSwitchShowDropdown"
                  style={{ color: "red" }}
                >
                  Please turn it on if you want to enter submodule
                </label>
              </div>
            </div>

            {showDropdown && (
              <div className="col-md-6">
                <label htmlFor="dropdownOption" className="form-label">
                  Select Main Module
                </label>
                <select
                  id="moduleId"
                  className="form-select"
                  name="moduleId"
                  value={form.moduleId}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {mainModuleDrop.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                Module Order <span className="text-danger">*</span>
              </label>
              <input
                id="moduleOrder"
                type="number"
                name="moduleOrder"
                value={form.moduleOrder}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter module order"
                required
              />
            </div>


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
    {form.mdId ? "Update" : "Submit"}
  </button>

  
</div>

          </form>
        </div>
      </div>

      {/* 📋 Table */}
      {moduleList.length > 0 && (
        <div
          className="card shadow mt-5 border-0 rounded-4"
          style={{ backgroundColor: "#ffff" }}
        >
          <div className="card-body p-4">
            <h5
              className="text-center mb-4 fw-bold"
              style={{ color: "#1e1e2d" }}
            >
              Module Records
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#ffff" }}>
                  <tr>
                    <th>Sl.No</th>
                    <th>Module Name</th>
                    <th>Sub Module Name</th>
                    <th>Module Order</th>
                    <th>Status</th>
                    <th style={{ minWidth: "180px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleList.map((item, index) => (
                    <tr key={item.MDM_ID}>
                      <td>{index + 1}</td>
                      <td>{item.MDM_NAME}</td>
                      <td>{item.SUBMODULENAME || "--"}</td>
                      <td>{item.ORDER_NUM}</td>
                      <td>{item.MDM_STATUS === "A" ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: "#1e1e2d",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => handleEdit(item)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor:
                                item.MDM_STATUS === "A" ? "#6c757d" : "#2a5298",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() =>
                              handleToggleStatus(item.MDM_ID, item.MDM_STATUS)
                            }
                          >
                            {item.MDM_STATUS === "A" ? "Deactivate" : "Activate"}
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

export default ModuleMaster;
