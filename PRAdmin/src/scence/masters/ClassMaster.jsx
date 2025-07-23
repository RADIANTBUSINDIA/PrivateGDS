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

  const API_BASE = "http://172.31.98.168:5000/api/classMaster";

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  // 🔄 Fetch class list
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/getClassList`, getAuthHeaders());
      const data = res.data.data || [];
      setClasses(data);
      setMessage(res.data.meta.message || "");
    } catch (err) {
      console.error(err);
      setClasses([]);
      setMessage("Failed to load class list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ✏️ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { classId, classCode, className, category, status } = form;

    if (!classCode || !className) {
      setMessage("Class code and name are required.");
      return;
    }

    const payload = classId
      ? {
          classId,
          classCode,
          className,
          calssCatagory: category,
          modifiedBy: localStorage.getItem("currentUserId"),
          status,
        }
      : {
          classCode,
          className,
          calssCatagory: category,
          createdBy: localStorage.getItem("currentUserId"),
        };

    try {
      const url = classId ? `${API_BASE}/update` : `${API_BASE}/insert`;
      const res = await axios.post(url, payload, getAuthHeaders());
      setMessage(res.data.data?.STATUS || res.data.meta.message);
      fetchClasses();
      setForm({ classId: null, classCode: "", className: "", category: "", status: "A" });
    } catch (err) {
      console.error(err);
      setMessage("Save failed.");
    }
  };

  // 🖊️ Edit handler
  const handleEdit = (cls) => {
    setForm({
      classId: cls.CLASS_ID,
      classCode: cls.CLASS_CODE,
      className: cls.CLASSNAME,
      category: cls.CATEGORY,
      status: cls.STATUS,
    });
    setMessage(`Editing ${cls.CLASSNAME}`);
  };

  // 🔁 Toggle active/inactive status
  const toggleStatus = async (cls) => {
    const newStatus = cls.STATUS === "A" ? "I" : "A";
    if (!window.confirm(`Switch to ${newStatus === "A" ? "Active" : "Inactive"}?`)) return;

    try {
      const payload = {
        classId: cls.CLASS_ID,
        status: newStatus,
        modifiedBy: localStorage.getItem("currentUserId"),
      };
      const res = await axios.post(`${API_BASE}/update`, payload, getAuthHeaders());
      setMessage(res.data.meta.message || "Status updated.");
      fetchClasses();
    } catch (err) {
      console.error(err);
      setMessage("Status update failed.");
    }
  };

  return (
    <div className="container my-4">
 
 <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">Class Master </h4>
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
        Category
      </label>
      <input
        id="category"
        name="category"
        type="text"
        className="form-control"
        placeholder="Enter category (optional)"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
    </div>

    <div className="col-md-6">
      <label className="form-label d-block">
        Status <span className="text-danger">*</span>
      </label>
      <div className="form-check form-check-inline">
        <input
          type="radio"
          name="status"
          id="statusActive"
          value="A"
          checked={form.status === "A"}
          onChange={() => setForm({ ...form, status: "A" })}
          className="form-check-input"
        />
        <label htmlFor="statusActive" className="form-check-label">
          Active
        </label>
      </div>
      <div className="form-check form-check-inline">
        <input
          type="radio"
          name="status"
          id="statusInactive"
          value="I"
          checked={form.status === "I"}
          onChange={() => setForm({ ...form, status: "I" })}
          className="form-check-input"
        />
        <label htmlFor="statusInactive" className="form-check-label">
          Inactive
        </label>
      </div>
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


      <div className="card p-4">
        <h5>Class List</h5>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th><th>Name</th><th>Category</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Loading…</td></tr>
            ) : classes.length ? (
              classes.map((cls) => (
                <tr key={cls.CLASS_ID}>
                  <td>{cls.CLASS_CODE}</td>
                  <td>{cls.CLASSNAME}</td>
                  <td>{cls.CATEGORY}</td>
                  <td>{cls.STATUS === "A" ? "Active" : "Inactive"}</td>
                  <td>
                    <button className="btn btn-sm me-2" onClick={() => handleEdit(cls)}>Edit</button>
                    <button className="btn btn-sm" onClick={() => toggleStatus(cls)}>Toggle Status</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5">No classes found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default ClassMaster;
