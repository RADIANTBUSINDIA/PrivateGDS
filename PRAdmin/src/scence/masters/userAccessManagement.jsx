import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import BASE_URL from "../../configAPI";

const UserAccessManageMent = () => {
  const [userAccessList, setUserAccessList] = useState([]);
  const [message, setMessage] = useState("");
  const userInputRef = useRef(null);
  const moduleInputRef = useRef(null);

  const [userOptions, setUserOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);

  const [form, setForm] = useState({
    userAccessId: "",
    userId: "",
    moduleId: [],
    access: "",
    read: false,
    write: false,
    status: "A",
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const moduleOptionsFormatted = moduleOptions
    .filter((mod) => !mod.SUBMODULEID)
    .map((mod) => ({
      value: mod.MDM_ID,
      label: mod.MDM_NAME,
    }));

  const allOption = { value: "ALL", label: "All Modules" };
  const fullOptions = [allOption, ...moduleOptionsFormatted];

  const handleReset = () => {
    setForm({
      userAccessId: "",
      userId: "",
      moduleId: [],
      access: "",
      read: false,
      write: false,
      status: "A",
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.userId || form.moduleId.length === 0 || (!form.read && !form.write)) {
      setMessage("Please fill in all mandatory fields.");
      return;
    }

    // 👇 Custom access logic
    let accessValue = "";
    if (form.write) {
      accessValue = "W";
    } else if (form.read) {
      accessValue = "R";
    } else {
      setMessage("Select at least Read or Write access.");
      return;
    }

    try {
      if (!form.userAccessId && form.moduleId.includes("ALL")) {
        const modulesToInsert = moduleOptions.filter((mod) => !mod.SUBMODULEID);
        for (const mod of modulesToInsert) {
          const payload = {
            id: "",
            roleId: form.userId,
            moduleId: mod.MDM_ID,
            access: accessValue,
            read: form.read,
            write: form.write,
            status: "A",
          };
          await axios.post(`${BASE_URL}/userAccess/insert`, payload, getAuthHeaders());
        }
        setMessage(`Inserted access for all ${modulesToInsert.length} modules successfully.`);
      } else {
        for (const modId of form.moduleId) {
          const payload = {
            id: form.userAccessId || "",
            roleId: form.userId,
            moduleId: modId,
            access: accessValue,
            read: form.read,
            write: form.write,
            status: form.status,
          };

          const res = form.userAccessId
            ? await axios.put(`${BASE_URL}/userAccess/update`, payload, getAuthHeaders())
            : await axios.post(`${BASE_URL}/userAccess/insert`, payload, getAuthHeaders());

          setMessage(res?.data?.meta?.message || "Saved successfully.");
        }
      }

      handleReset();
      getAllUserAccessRecords();
    } catch (err) {
      console.error("Error:", err);
      setMessage(err?.response?.data?.meta?.message || "Error saving record.");
    }
  };

  const handleChange = (e) => {
    const { name, checked, value, type } = e.target;

    if (name === "read" || name === "write") {
      const updated = {
        ...form,
        [name]: checked,
      };
      updated.access = updated.write ? "W" : updated.read ? "R" : "";
      setForm(updated);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
      }));
    }
  };

  const handleEdit = (item) => {
    const access = item.USER_ACESS;
    setForm({
      userAccessId: item.ID,
      userId: item.ROLE_ID,
      moduleId: [item.MODULE_ID],
      read: access === "R" || access === "W",
      write: access === "W",
      access,
      status: item.STATUS,
    });

    setMessage(`Editing Module Name: ${item.MODULE_NAME}`);
    setTimeout(() => {
      moduleInputRef.current?.focus();
    }, 0);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (!window.confirm(`Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`)) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/userAccess/toggleStatus`,
        { id, status: newStatus },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message);
      if (res.data.meta.success) getAllUserAccessRecords();
    } catch (err) {
      console.error("Toggle Error:", err);
      setMessage(err?.response?.data?.meta?.message || "Failed to toggle status.");
    }
  };

  const getUsersDropDown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dropdown/getUsers`, getAuthHeaders());
      setUserOptions(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const getModulesDropDown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dropdown/getModules`, getAuthHeaders());
      setModuleOptions(res.data.data || []);
    } catch (err) {
      console.error("Module Fetch Error:", err);
    }
  };

  const getAllUserAccessRecords = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/userAccess/view`, getAuthHeaders());
      setUserAccessList(res.data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    getUsersDropDown();
    getModulesDropDown();
    getAllUserAccessRecords();
  }, []);

  return (
    <div className="container my-5">
      {message && (
        <div
          className={`alert ${message.includes("ALREADY") ? "alert-warning" : "alert-success"} mx-auto text-center px-3 py-2 shadow`}
          style={{ display: "inline-block", borderRadius: "12px", fontWeight: 500 }}
        >
          {message}
        </div>
      )}

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">Role Access Management Master Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label htmlFor="userId" className="form-label">
                Role Name <span className="text-danger">*</span>
              </label>
              <select
                id="userId"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                className="form-select"
                required
                ref={userInputRef}
                disabled={!!form.userAccessId}
              >
                <option value="">Select user</option>
                {userOptions.map((user) => (
                  <option key={user.LM_LOOKUPID} value={user.LM_LOOKUPID}>
                    {user.LM_VALUE}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="moduleId" className="form-label">
                Module Name <span className="text-danger">*</span>
              </label>
              <Select
                isMulti
                id="moduleId"
                name="moduleId"
                options={fullOptions}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                value={
                  form.moduleId.includes("ALL")
                    ? [allOption]
                    : moduleOptionsFormatted.filter((opt) =>
                        form.moduleId.includes(opt.value)
                      )
                }
                onChange={(selectedOptions) => {
                  const values = selectedOptions.map((opt) => opt.value);
                  setForm((prev) => ({
                    ...prev,
                    moduleId: values.includes("ALL") ? ["ALL"] : values,
                  }));
                }}
                styles={{
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    padding: "2px",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#333",
                  }),
                  multiValueRemove: (base, state) => ({
                    ...base,
                    color: "#555",
                    backgroundColor: state.isFocused ? "#ddd" : "transparent",
                    borderRadius: "2px",
                  }),
                }}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label d-block">Access</label>
              <div className="row">
                {["write", "read"].map((perm) => (
                  <div className="col-2" key={perm}>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`${perm}Switch`}
                        name={perm}
                        checked={form[perm]}
                        onChange={handleChange}
                        style={{
                          backgroundColor: form[perm] ? "#1e1e2d" : "",
                          borderColor: form[perm] ? "#1e1e2d" : "",
                        }}
                      />
                      <label className="form-check-label ms-2" htmlFor={`${perm}Switch`}>
                        <strong>{perm.charAt(0).toUpperCase() + perm.slice(1)}</strong>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 text-end d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn px-4"
                style={{ backgroundColor: "#6c757d", color: "#fff", border: "none" }}
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn px-4"
                style={{ backgroundColor: "#1e1e2d", color: "#fff", border: "none" }}
              >
                {form.userAccessId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {userAccessList.length > 0 && (
        <div className="card shadow mt-5 border-0 rounded-4" style={{ backgroundColor: "#fff" }}>
          <div className="card-body p-4">
            <h5 className="text-center mb-4 fw-bold" style={{ color: "#1e1e2d" }}>
              Role Access Records
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                  <tr>
                    <th>Sl.No</th>
                    <th>Role</th>
                    <th>Module</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th style={{ minWidth: "180px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userAccessList.map((item, index) => (
                    <tr key={item.ID}>
                      <td>{index + 1}</td>
                      <td>{item.ROLE_NAME}</td>
                      <td>{item.MODULE_NAME}</td>
                      <td>{item.USER_ACESS === "W" ? "Read & Write" : "Read Only"}</td>
                      <td>{item.STATUS === "A" ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{ backgroundColor: "#1e1e2d", color: "#fff", border: "none" }}
                            onClick={() => handleEdit(item)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: item.STATUS === "A" ? "#6c757d" : "#2a5298",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => handleToggleStatus(item.ID, item.STATUS)}
                          >
                            {item.STATUS === "A" ? "Deactivate" : "Activate"}
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

export default UserAccessManageMent;
