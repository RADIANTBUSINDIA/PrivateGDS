import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: null,
    name: "",
    fullName: "",
    role: "",
    status: "Active",
    email: "",
    contactPhone: "",
    fromDate: new Date().toISOString().substring(0, 10),
    toDate: "",
    password: "",
    confirmPassword: "",
    createdBy: 1,
    modifiedBy: 1,
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);


  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);
    return () => clearTimeout(timer); // Cleanup on unmount or message change
  }
}, [message]);


  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/lookup/roles`, getAuthHeaders());
      setRoles(res.data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/userMaster/viewUsers`, getAuthHeaders());
      const rows = res.data.data || [];
      const mappedUsers = rows.map((u) => ({
        userId: u.USERID,
        name: u.USERNAME,
        fullName: u.USERFULLNAME,
        email: u.EMAIL,
        contactPhone: u.PHONE,
        role: u.ROLEID,
        fromDate: u.EFFFROMDATE?.substring(0, 10) || "",
        toDate: u.EFFTODATE?.substring(0, 10) || "",
        status: u.STATUS === "A" ? "Active" : "Inactive",
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
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
      userId: null,
      name: "",
      fullName: "",
      role: "",
      status: "Active",
      email: "",
      contactPhone: "",
      fromDate: new Date().toISOString().substring(0, 10),
      toDate: "",
      password: "",
      confirmPassword: "",
      createdBy: 1,
      modifiedBy: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name || !form.fullName || !form.role || !form.email) {
      setMessage("Please fill all required fields");
      return;
    }

    // ✅ Validate phone number: 10 digits
    if (!/^\d{10}$/.test(form.contactPhone)) {
      setMessage("Phone number must be exactly 10 digits");
      return;
    }

    // ✅ Validate full name: only letters and spaces
    if (!/^[A-Za-z\s]+$/.test(form.fullName)) {
      setMessage("Full name must contain only letters and spaces");
      return;
    }

    // ✅ Password match
    if (!form.userId && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    

    setSubmitting(true);

    try {
      const endpoint = form.userId ? "update" : "insert";

      const payload = form.userId
        ? {
            userId: form.userId,
            fullname: form.fullName,
            email: form.email,
            phone: form.contactPhone,
            password: "",
            roleId: form.role,
            effFrom: form.fromDate,
            effTo: form.toDate,
          }
        : {
            username: form.name,
            fullname: form.fullName,
            email: form.email,
            phone: form.contactPhone,
            password: form.password,
            roleId: form.role,
            effFrom: form.fromDate,
            effTo: form.toDate,
            createdBy: form.createdBy || 1,
          };

      let res;
      if (endpoint === "insert") {
        res = await axios.post(`${BASE_URL}/userMaster/${endpoint}`, payload, getAuthHeaders());
      } else {
        res = await axios.put(`${BASE_URL}/userMaster/${endpoint}`, payload, getAuthHeaders());
      }

      const msg = res?.data?.meta?.message || "Saved successfully";
      setMessage(msg);
      if (res.data.meta.success) {
        resetForm();
        fetchUsers();
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage(err.response?.data?.meta?.message || "Error saving user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setMessage("");
    setForm({
      userId: user.userId,
      name: user.name,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      email: user.email,
      contactPhone: user.contactPhone,
      fromDate: user.fromDate,
      toDate: user.toDate,
      password: "",
      confirmPassword: "",
      createdBy: 1,
      modifiedBy: 1,
    });
  };

  const toggleStatus = async (userId, currentStatus) => {
    setMessage("");
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/userMaster/delete`,
        { userId, status: newStatus },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message || "Status updated");
      if (res.data.meta.success) fetchUsers();
    } catch (err) {
      console.error("Status toggle error:", err);
      setMessage("Status update failed");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body py-3 px-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#1e1e2d", color: "white" }}>
          <h4 className="mb-0">👥 User Master</h4>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.toLowerCase().includes("fail") ? "alert-warning" : "alert-success"} text-center px-3 py-2 shadow`}
          style={{
            borderRadius: "12px",
            fontWeight: 500,
            width: "fit-content",
            margin: "0 auto",
          }}>
          {message}
        </div>
      )}

      <div className="card shadow border-0 rounded-4 mb-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">{form.userId ? "Edit User" : "Add User"}</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Username *" disabled={!!form.userId} />
            </div>
           <div className="col-md-6">
  <input
    type="text"
    name="fullName"
    value={form.fullName}
    onChange={handleChange}
    onKeyDown={(e) => {
      const key = e.key;
      if (!/^[a-zA-Z\s]$/.test(key) && key.length === 1) {
        e.preventDefault(); // Prevent typing if it's not a letter or space
      }
    }}
    className="form-control"
    placeholder="Full Name *"
  />
</div>

            <div className="col-md-6">
              <select name="role" value={form.role} onChange={handleChange} className="form-select">
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.ID} value={r.ID}>{r.NAME}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label d-block">Status *</label>
              <div className="form-check form-check-inline">
                <input type="radio" className="form-check-input" name="status" value="Active" checked={form.status === "Active"} onChange={handleChange} />
                <label className="form-check-label">Active</label>
              </div>
              <div className="form-check form-check-inline">
                <input type="radio" className="form-check-input" name="status" value="Inactive" checked={form.status === "Inactive"} onChange={handleChange} />
                <label className="form-check-label">Inactive</label>
              </div>
            </div>
            <div className="col-md-6">
  <input
    type="email"
    name="email"
    value={form.email}
    onChange={handleChange}
    onBlur={(e) => {
      const email = e.target.value.trim();

      if (!email.includes("@") || !email.includes(".")) {
        alert("Email must contain both '@' and '.'");
        return;
      }
     
    }}
    className="form-control"
    placeholder="Email *"
  />
</div>


            <div className="col-md-6">
              <input type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange} className="form-control" placeholder="Phone (10 digits)" maxLength="10" />
            </div>
            <div className="col-md-6">
  <label htmlFor="fromDate" className="form-label">Effective From Date</label>
  <input
    type="date"
    id="fromDate"
    name="fromDate"
    value={form.fromDate}
    onChange={handleChange}
    className="form-control"
  />
</div>

<div className="col-md-6">
  <label htmlFor="toDate" className="form-label">Effective To Date</label>
  <input
    type="date"
    id="toDate"
    name="toDate"
    value={form.toDate}
    onChange={handleChange}
    className="form-control"
  />
</div>

            {!form.userId && (
              <>
                <div className="col-md-6">
                  <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control" placeholder="Password *" />
                </div>
                <div className="col-md-6">
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-control" placeholder="Confirm Password *" />
                </div>
              </>
            )}
            <div className="col-12 text-end">
              <button type="submit" className="btn px-4" style={{ backgroundColor: "#1e1e2d", color: "#fff" }} disabled={submitting}>
                {submitting ? "Saving..." : form.userId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-light">
          <h5 className="mb-3">User List</h5>
          <input type="text" className="form-control mb-3" placeholder="Search by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                    <th>Name</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u, index) => (
                      <tr key={u.userId}>
                        <td>{index + 1}</td>
                        <td>{u.name}</td>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td>{u.contactPhone}</td>
                        <td>{roles.find((r) => r.ID === u.role)?.NAME || "-"}</td>
                        <td>{u.status}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-sm rounded-pill px-3" style={{ backgroundColor: "#1e1e2d", color: "#fff" }} onClick={() => handleEdit(u)}>✏️ Edit</button>
                            <button className="btn btn-sm rounded-pill px-3" style={{ backgroundColor: u.status === "Active" ? "#6c757d" : "#2a5298", color: "#fff" }} onClick={() => toggleStatus(u.userId, u.status)}>
                              {u.status === "Active" ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="text-muted">No users found</td></tr>
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

export default UserMaster;
