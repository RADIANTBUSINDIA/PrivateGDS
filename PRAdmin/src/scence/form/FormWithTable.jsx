import React, { useState, useEffect } from 'react';

const FormWithTable = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    role: '',
    dob: '',
    subscribe: false,
  });

  const [submittedData, setSubmittedData] = useState([]);

  // Dummy data on mount
  useEffect(() => {
    const dummy = [
      {
        name: 'Ankit',
        email: 'ankit@example.com',
        gender: 'Male',
        role: 'Admin',
        dob: '1998-07-15',
        subscribe: true,
      },
      {
        name: 'Neha',
        email: 'neha@example.com',
        gender: 'Female',
        role: 'User',
        dob: '1997-02-10',
        subscribe: false,
      },
    ];
    setSubmittedData(dummy);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedData([...submittedData, formData]);
    setFormData({
      name: '',
      email: '',
      gender: '',
      role: '',
      dob: '',
      subscribe: false,
    });
  };

  // Inline styles


  const cardStyle = {
  borderRadius: '20px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

  const buttonStyle = {
    backgroundColor: '#2a5298',
    color: '#fff',
    border: 'none',
    transition: 'background 0.3s ease',
  };

  const buttonHoverStyle = {
    backgroundImage: 'linear-gradient(180deg, #1e3c72, #2a5298)',
    color: '#fff',
  };

  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="container my-5">
      <div className="card shadow rounded-3 border-0" style={cardStyle}>
        <div className="card-body px-5 py-4 bg-white">
          <h3 className="text-center mb-4">User Registration Form</h3>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <div className="d-flex gap-3 pt-1">
                <div className="form-check">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">Male</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">Female</label>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="User">User</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label className="form-check-label">
                  Subscribe to newsletter
                </label>
              </div>
            </div>

            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn px-4"
                style={isHovering ? buttonHoverStyle : buttonStyle}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {submittedData.length > 0 && (
        <div className="card mt-5 shadow rounded-3 border-0" style={cardStyle}>
          <div className="card-body px-4 py-3 bg-white">
            <h4 className="text-center mb-3">Submitted User Data</h4>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead>
                  <tr className="text-center">
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Role</th>
                    <th>DOB</th>
                    <th>Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map((data, index) => (
                    <tr key={index} className="text-center">
                      <td>{index + 1}</td>
                      <td>{data.name}</td>
                      <td>{data.email}</td>
                      <td>{data.gender}</td>
                      <td>{data.role}</td>
                      <td>{data.dob}</td>
                      <td>{data.subscribe ? 'Yes' : 'No'}</td>
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

export default FormWithTable;
