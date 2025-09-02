import React, { useState, useEffect } from "react";
import axios from "axios";

const ClassMaster = () => {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
  classId: null,
  classCode: "",
  className: "",
  category: "",
  status: "A",
});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  // const fetchClasses = async () => {
  //   setLoading(true);
  //   setMessage("");
  //   try {
  //     const res = await axios.get(`http://localhost:5000/api/classMaster/getClassList`, getAuthHeaders());
  //     console.log("Fetched classes:", res.data);
  //     setClasses(res.data.data || []);
  //   } catch (err) {
  //     console.error("Fetch classes error:", err);
  //     setClasses([]);
  //     //setMessage("Failed to load class list.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchClasses = async () => {
  setLoading(true);
  setMessage(""); // Clear previous messages
  try {
    const res = await axios.get(
      `http://localhost:5000/api/classMaster/getClassList`,
      getAuthHeaders()
    );
    console.log("Fetched classes:", res.data);
    setClasses(res.data.data || []);
  } catch (err) {
    console.error("Fetch classes error:", err);
    if (err.response) {
      // Server responded with a status code outside the 2xx range
      setMessage(`Error: ${err.response.status} - ${err.response.data.message || 'An error occurred'}`);
    } else if (err.request) {
      // No response received
      setMessage("Network error: No response from server.");
    } else {
      // Error setting up the request
      setMessage(`Request error: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  if (!form.classCode.trim() || !form.className.trim() || !form.category.trim()) {
    setMessage("Class code, name, and category are required.");
    return;
  }

  if (form.classId) {
    await handleUpdate();
  } else {
    await handleInsert();
  }
};

const handleInsert = async () => {
  const payload = {
    classCode: form.classCode.trim(),
    className: form.className.trim(),
    calssCatagory: form.category.trim().toUpperCase(),
  };

  try {
    const res = await axios.post(`http://localhost:5000/api/classMaster/insert`, payload, getAuthHeaders());
    const result = res.data;
    console.log("Insert response:", result);  
    if (result.meta.success) {
      resetForm();
      fetchClasses();
      setMessage(result?.data?.[0]?.STATUS);
    }
  } catch (err) {
    console.error("Insert error:", err);
    setMessage("Insert failed.");
  }
};

const handleUpdate = async () => {
  const payload = {
    classId: form?.classId,
    className: form?.className?.trim(),
    classCatagory: form?.category?.trim(),
    status: form?.status?.trim(),
  };

  console.log("📤 Updating payload:", payload);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/classMaster/update",
      payload,
      getAuthHeaders()
    )  
    const result = res.data.data;
    console.log("📥 Update response:", result);
    setMessage(result[0]?.STATUS);
    if (result?.meta?.success) {
      resetForm();
      fetchClasses();
     
    }
  } catch (err) {
    console.error("❌ Update error:", err?.response?.data || err.message);
    setMessage("Update failed.");
  }
};


const resetForm = () => {
  setForm({ classId: null, classCode: "", className: "", category: "", status: "A" });
};
const toggleClassStatus = async (classId, currentStatus) => {
  const newStatus = currentStatus === "A" ? "I" : "A";
  const confirmMsg = `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`;
  if (!window.confirm(confirmMsg)) return;

  const cls = classes.find((c) => c.CLASS_ID === classId);

  const payload = {
    classId: cls.CLASS_ID,
    status: newStatus,
    className: cls.CLASSNAME,
    classCatagory: cls.CATEGORY, // or classCategory
    modifiedBy: 1,
  };

  try {
    const res = await axios.put(
      `http://localhost:5000/api/classMaster/toggleStatus`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders().headers,
        },
      }
    );
    const msg = res?.data?.meta?.message || "Status updated successfully";
    setMessage(msg);

    if (res.data?.meta?.success) {
      fetchClasses();
    }
  } catch (err) {
    console.error("Toggle Error:", err.response?.data || err.message || err);
    const msg = err?.response?.data?.meta?.message || "Failed to toggle status.";
    setMessage(msg);
  }
};


  const handleEdit = (cls) => {
    setForm({
      classId: cls.CLASS_ID,
      classCode: cls.CLASS_CODE,
      className: cls.CLASSNAME,
      category: cls.CATEGORY,
      status: cls.STATUS,
    });
    setMessage(`Editing Class: ${cls.CLASSNAME}`);
  };


  return (
    <div className="container my-5">
      {/* 🔔 Message */}
      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("fail") || message.toLowerCase().includes("required")
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

      {/* 📝 Class Master Form */}
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">Class Master Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label htmlFor="classCode" className="form-label">
                Class Code <span className="text-danger">*</span>
              </label>
              <input
                id="classCode"
                name="classCode"
                type="text"
                required
                className="form-control"
                placeholder="Enter class code"
                value={form.classCode}
                onChange={(e) => setForm({ ...form, classCode: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="className" className="form-label">
                Class Name <span className="text-danger">*</span>
              </label>
              <input
                id="className"
                name="className"
                type="text"
                required
                className="form-control"
                placeholder="Enter class name"
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="category" className="form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">---Select category---</option>
                <option value="AC">AC</option>
                <option value="NAC">NAC</option>
              </select>
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
                {form.classId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 📋 Class Records Table */}
      {classes.length > 0 && (
        <div className="card shadow mt-5 border-0 rounded-4" style={{ backgroundColor: "#fff" }}>
          <div className="card-body p-4">
            <h5 className="text-center mb-4 fw-bold" style={{ color: "#1e1e2d" }}>
              Class Records
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ minWidth: "180px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5">Loading…</td>
                    </tr>
                  ) : (
                    classes.map((cls) => (
                      <tr key={cls.CLASS_ID}>
                        <td>{cls.CLASS_CODE}</td>
                        <td>{cls.CLASSNAME}</td>
                        <td>{cls.CATEGORY}</td>
                        <td>{cls.STATUS === "A" ? "Active" : "Inactive"}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm rounded-pill px-3"
                              style={{
                                backgroundColor: "#1e1e2d",
                                color: "#fff",
                                border: "none",
                              }}
                              onClick={() => handleEdit(cls)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-sm rounded-pill px-3"
                              style={{
                                backgroundColor: cls.STATUS === "A" ? "#6c757d" : "#2a5298",
                                color: "#fff",
                                border: "none",
                              }}
                              onClick={() =>
                               toggleClassStatus(cls.CLASS_ID, cls.STATUS)}
                            >
                              {cls.STATUS === "A"
                               ? "Deactivate" 
                               : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassMaster;
