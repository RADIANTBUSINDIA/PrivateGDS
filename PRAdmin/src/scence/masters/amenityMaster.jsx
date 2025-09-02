import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const AmenityMaster = () => {
  const API_BASE_URL = BASE_URL; // e.g. http://localhost:5000/api
  const IMAGE_BASE_URL = "http://localhost:5000"; // for image display

  const [form, setForm] = useState({
    amenityId: "",
    amenityName: "",
    amenityDisc: "",
    imagePath: "",
    status: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const amenityInputRef = useRef(null);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  // ✅ Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, GIF, and WebP formats are allowed.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    uploadFile(file);
  };

  // ✅ Upload file immediately after selection
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedPath = response.data?.imagePath || "";
      if (uploadedPath) {
        setForm((prev) => ({ ...prev, imagePath: uploadedPath }));
      } else {
        setMessage("Image path not found in response");
      }
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      setMessage("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imagePath) {
      alert("Please upload an image first.");
      return;
    }

    try {
      const endpoint = form.amenityId
        ? `${API_BASE_URL}/amenityMaster/update`
        : `${API_BASE_URL}/amenityMaster/insert`;

      const res = await axios.post(endpoint, form, getAuthHeaders());
      setMessage(res?.data?.meta?.message || "Saved successfully");

      if (res.data.meta.success) {
        handleReset();
        getAllAmenities();
      }
    } catch (error) {
      console.error("Error saving amenity", error);
      setMessage("Failed to save. Please check console for details.");
    }
  };

  // ✅ Fetch all amenities
  const getAllAmenities = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/amenityMaster/view`,
        getAuthHeaders()
      );
      setAmenitiesList(res.data.data || []);
    } catch (err) {
      setMessage(
        err?.response?.data?.meta?.message || "Failed to fetch amenities"
      );
    }
  };

  useEffect(() => {
    getAllAmenities();
  }, []);

  // ✅ Reset form
  const handleReset = () => {
    setForm({
      amenityId: "",
      amenityName: "",
      amenityDisc: "",
      imagePath: "",
      status: "",
    });
    setSelectedFile(null);
    setPreview(null);
    setMessage("");
    if (amenityInputRef.current) {
      amenityInputRef.current.value = "";
    }
  };

  // ✅ Edit existing amenity
  const handleEdit = (item) => {
    setForm({
      amenityId: item.ID,
      amenityName: item.NAME,
      amenityDisc: item.DESCRIPTION,
      imagePath: item.URL,
      status: item.STATUS,
    });
    setPreview(`${IMAGE_BASE_URL}${item.URL}`);
    setMessage(`Editing Amenity: ${item.NAME}`);
    setTimeout(() => amenityInputRef.current?.focus(), 0);
  };

    const handleToggleStatus = async (amenityId, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (
      !window.confirm(
        `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`
      )
    )
      return;

    try {
      const res = await axios.post(
        `${BASE_URL}/amenityMaster/toggleStatus`,
        { status: newStatus, amenityId },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message || "Status updated");
      if (res.data.meta.success) getAllAmenities();
    } catch (err) {
      setMessage(
        err?.response?.data?.meta?.message || "Failed to toggle status."
      );
    }
  };
  return (
    <div className="container my-5">
      {message && (
        <div
          className={`alert ${
            message.includes("ALREADY") ? "alert-warning" : "alert-success"
          } text-center`}
          style={{ borderRadius: "12px", fontWeight: 500 }}
        >
          {message}
        </div>
      )}

      {/* Form */}
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4">
          <h4 className="text-center mb-4">Amenity Master Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            {/* Name */}
            <div className="col-md-6">
              <label htmlFor="amenityName" className="form-label">
                Amenity Name <span className="text-danger">*</span>
              </label>
              <input
                id="amenityName"
                type="text"
                name="amenityName"
                value={form.amenityName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter amenity name"
                required
                ref={amenityInputRef}
              />
            </div>

            {/* Description */}
            <div className="col-md-6">
              <label htmlFor="amenityDisc" className="form-label">
                Amenity Description <span className="text-danger">*</span>
              </label>
              <input
                id="amenityDisc"
                type="text"
                name="amenityDisc"
                value={form.amenityDisc}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter description"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="col-md-6">
              <label htmlFor="imagePath" className="form-label">
                Image <span className="text-danger">*</span>
              </label>
              <input
                id="imagePath"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control"
              />
              {uploading && <p className="text-primary mt-1">Uploading...</p>}

              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "80px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="col-12 text-end d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={handleReset}
              >
                Reset
              </button>
              <button type="submit" className="btn btn-dark px-4">
                {form.amenityId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Amenities List */}
      {amenitiesList.length > 0 && (
        <div className="card shadow mt-5 border-0 rounded-4">
          <div className="card-body p-4">
            <h5 className="text-center mb-4 fw-bold">Amenities Records</h5>
            <div className="table-responsive">
              <table className="table table-hover text-center align-middle">
                <thead className="bg-dark text-white">
                  <tr>
                    <th>Sl.No</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {amenitiesList.map((item, index) => (
                    <tr key={item.ID}>
                      <td>{index + 1}</td>
                      <td>{item.NAME}</td>
                      <td>{item.DESCRIPTION}</td>
                      <td>
                        {item.URL ? (
                          <img
                            src={`${IMAGE_BASE_URL}${item.URL}`}
                            alt="Amenity"
                            style={{
                              width: "60px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setSelectedImage(`${IMAGE_BASE_URL}${item.URL}`)
                            }
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td>{item.STATUS === "A" ? "Active" : "Inactive"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-dark me-2"
                          onClick={() => handleEdit(item)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{
                            backgroundColor:
                              item.STATUS === "A" ? "#6c757d" : "#2a5298",
                            color: "#fff",
                          }}
                          onClick={() =>
                            handleToggleStatus(item.ID, item.STATUS)
                          }
                        >
                          {item.STATUS === "A" ? "Deactivate" : "Activate"}
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

      {/* ✅ Image Preview Modal */}
      {selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
};

export default AmenityMaster;
