import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import  BASE_URL  from "../../configAPI";

const PickUpPointMaster = () => {
  const [form, setForm] = useState({
    placeId: "",
    zoneId: "",
    zoneName: "",
    pickUpPointName: "",
    landMark: "",
    createdBy: 1,
    pickUpPointId: null,
    status: "A",
    placeLabel: "",
    remarks:"",
    contactNo:"",
  });

  const [states, setStates] = useState([]);
  const [filters, setFilters] = useState({ stateId: "" });
  const [places, setPlaces] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickupPoints, setPickupPoints] = useState([]);
  const placeInputRef = useRef(null);
  const placeInputFilterRef = useRef(null);
  const [zone, setZone] = useState([]);


  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

    useEffect(() => {
    fetchZone();
  }, []);

    const fetchZone = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/routeMaster/getZonePlacesDropdown`, getAuthHeaders());
      console.log("Zone data:", JSON.stringify(res.data));
      if (res.data.meta.success) setZone(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOptions = async (inputValue) => {
    if (inputValue.length < 3) return [];
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/dropdown/getPlaces",
        { place: inputValue, stateId: filters.stateId || undefined },
        getAuthHeaders() 
      );
      return response.data.data.map((point) => ({
        value: point.PM_PLACEID,
        label: point.PM_PLACENAME,
      }));
    } catch (error) {
      console.error("Error fetching places:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

 const handleEdit = (point) => {
    setForm({
      placeLabel: point.PLACENAME,
      placeId: point.PLACE_ID,
      zoneId: point.ZONE_ID,
      zoneName: point.ZONENAME,
      pickUpPointName: point.PICKUP_POINT_NAME,
      landMark: point.LANDMARK,
      pickUpPointId: point.PICKUP_POINT_ID,
      status: point.STATUS,
      createdBy: 1,
      remarks:point.REMARK,
      contactNo:point.CONTACT_NO,
    });
    setMessage(`Editing Place: ${point.PLACENAME}`);
    setTimeout(() => placeInputRef.current?.focus(), 0);
  };
  
const fetchPickupPoints = async (placeId) => {
  if (!placeId) return;

  const payload = { placeId };
  console.log("Fetching pickup points for placeId:", payload);

  try {
    const res = await axios.post(
      `http://localhost:5000/api/pickup/view`,payload,
      getAuthHeaders()
    );


    console.log("Pickup points response:", res.data);
    setMessage(res.data.meta.message || "Fetched pickup points successfully.");

    if (res.data.meta.success) {
      setPickupPoints(res.data.data);
    } else {
      setPickupPoints([]);
    }
  } catch (err) {
    console.error("Error fetching pickup points:", err);
    setPickupPoints([]);
  }
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
    const { placeId, zoneId, zoneName, pickUpPointName, landMark } = form;
if (!form.placeId || !form.pickUpPointName || !form.landMark) {
  setMessage("Please fill in all mandatory fields.");
  return;
}

const payload = {
  pickPointId: form.pickUpPointId || null,
  placeId: form.placeId,
  zoneId: form.zoneId,
  zoneName: form.zoneName,
  pickPointName: form.pickUpPointName, // match form state key
  landMark: form.landMark,
  status: form.status,
  remarks:form.remarks,
  contactNo:form.contactNo,
};

    try {
      var res;
      if (form.pickUpPointId) {
        console.log("upadte");
        console.log("Updating pickup point with payload:", payload);

         res = await axios.put(
          "http://localhost:5000/api/pickup/update",
          payload,
          getAuthHeaders()
        );

      }else {
        console.log("insert");
       res = await axios.post(
        "http://localhost:5000/api/pickup/insert",
        payload,
        getAuthHeaders()
      );
    }
      const { success, message } = res.data.meta;
      setMessage(message || "Saved successfully.");

      if (success) {
        setForm({
          placeId: "",
          zoneId: "",
          zoneName: "",
          pickUpPointName: "",
          landMark: "",
          pickUpPointId: null,
          status: "A",
          placeLabel: "",
          remarks:"",
          contactNo:"",
        });
        setPickupPoints([]); // Clear table after submission
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Error saving record.");
    }
  };

  const handleToggleStatus = async (pickPointId, currentStatus) => {
  const newStatus = currentStatus === "A" ? "I" : "A";
  const confirmMsg = `Change pickup point status to ${newStatus === "A" ? "Active" : "Inactive"}?`;
  if (!window.confirm(confirmMsg)) return;

  const payload = {
    pickPointId,
    status: newStatus,
  };
  console.log("Payload to send:", payload);

  try {
    const res = await axios.put(
      "http://localhost:5000/api/pickup/toggleStatus",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()?.headers,
        },
      }
    );

    const msg = res?.data?.meta?.message || "Status updated successfully";
    setMessage(msg);

    if (res.data?.meta?.success) {
      fetchPickupPoints(form.placeId); // refresh pickup points list for the current place
    }
  } catch (err) {
    console.error("Toggle pickup point status error:", err);
    const msg = err?.response?.data?.meta?.message || "Failed to toggle pickup point status.";
    setMessage(msg);
  }
};


const onFilterChange = async (selectedOption, { name }) => {
  const placeId = selectedOption ? selectedOption.value : "";
  const placeLabel = selectedOption ? selectedOption.label : "";

  setForm((prev) => ({
    ...prev,
    [name]: placeId,
    placeLabel,
  }));

  if (placeId) {
    await fetchPickupPoints(placeId); // Fetch pickup points
  } else {
    setPickupPoints([]); // Clear table
  }
};




  return (
    <div className="container my-5">
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

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">Pick-up Point Master</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <label htmlFor="placeId" className="form-label">
                Place <span className="text-danger">*</span>
              </label>
              <AsyncSelect
                id="placeId"
                name="placeId"
                ref={placeInputRef}
                loadOptions={loadOptions}
                value={
                  form.placeId
                    ? { value: form.placeId, label: form.placeLabel || "" }
                    : null
                }
                onChange={(selectedOption, meta) =>
                  onFilterChange(selectedOption, meta)
                }
                isClearable
                placeholder="Start typing (≥3 letters)..."
                loadingMessage={() => "Loading places..."}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length >= 3
                    ? `No places found for "${inputValue}"`
                    : "Type at least 3 characters"
                }
              />
            </div>
             <div className="col-md-6">
              <label htmlFor="pickUpPointName" className="form-label">
                Zone  
              </label>
        <select
                id="zoneId"
                name="zoneId"
                value={form.zoneId}
                onChange={handleChange}
                className="form-select"
               
              >
                <option value="">-- Select Zone --</option>
                {zone.map((s) => (
                  <option key={s.ZONE_ID} value={s.ZONE_ID}>
                    {s.ZONENAME}
                  </option>
                ))}
              </select>  
            </div>
            <div className="col-md-6">
              <label htmlFor="pickUpPointName" className="form-label">
                Pickup Point <span className="text-danger">*</span>
              </label>
              <input
                id="pickUpPointName"
                type="text"
                name="pickUpPointName"
                value={form.pickUpPointName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter pickup point name"
                required
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="landMark" className="form-label">
                Land Mark <span className="text-danger">*</span>
              </label>
              <input
                id="landMark"
                type="text"
                name="landMark"
                value={form.landMark}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Land Mark"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="contactNo" className="form-label">
                Agent Phone No
              </label>
              <input
                id="contactNo"
                type="text"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Phone no"
                maxLength={10} 
  onInput={(e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10); 
  }}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="remarks" className="form-label">
                Remarks
              </label>
              <input
                id="remarks"
                type="text"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter Land Mark"
                
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
                  id="active"
                  value="A"
                  checked={form.status === "A"}
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
                  name="status"
                  id="inactive"
                  value="I"
                  checked={form.status === "I"}
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
                  backgroundColor: "#1e1e2d",
                  color: "#fff",
                  border: "none",
                }}
              >
                {form.pickUpPointId ? "Update" : "Submit"}
              </button>
            </div>
          </form>

          {/* 🔍 Filter Section */}
          <div className="card shadow border-0 rounded-4 my-4">
            <div className="card-body bg-light p-4">
              <h5 className="mb-3">Filter By Place Name</h5>
              <AsyncSelect
                id="placeId"
                name="placeId"
                ref={placeInputFilterRef}
                loadOptions={loadOptions}
                value={
                  form.placeId
                    ? { value: form.placeId, label: form.placeLabel || "" }
                    : null
                }
                onChange={(selectedOption, meta) =>
                  onFilterChange(selectedOption, meta)
                }
                isClearable
                placeholder="Start typing (≥3 letters)..."
                loadingMessage={() => "Loading places..."}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length >= 3
                    ? `No places found for "${inputValue}"`
                    : "Type at least 3 characters"
                }
              />
            </div>
          </div>

          {/* 🧾 Pickup Records Table */}
          <div
            className="card shadow mt-5 border-0 rounded-4"
            style={{ backgroundColor: "#ffff" }}
          >
            <div className="card-body p-4">
              <h5
                className="text-center mb-4 fw-bold"
                style={{ color: "#1e1e2d" }}
              >
                Pick-up Records
              </h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle text-center">
                  <thead
                    style={{ backgroundColor: "#1e1e2d", color: "#ffff" }}
                  >
                    <tr>
                      <th>Place</th>
                      <th>Zone</th>
                      <th>Pick-up Point</th>
                      <th>Landmark</th>
                      <th>Remarks</th>
                      <th>Phone No</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
  {pickupPoints.length > 0 ? (
    pickupPoints.map((point, index) => (
      <tr key={index}>
        <td>{point.PLACENAME}</td>
        <td>{point.ZONE_NAME}</td>
        <td>{point.PICKUP_POINT_NAME}</td>
        <td>{point.LANDMARK}</td>
        <td>{point.CONTACT_NO}</td>
        <td>{point.REMARK}</td>
        <td>{point.STATUS=== "A" ? "Active" : "Inactive"}</td>
         <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: "#1e1e2d",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => handleEdit(point)}
                          >
                            ✏️ Edit
                          </button>

                           
                     
                        </div>
                      </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5">No pickup points found.</td>
    </tr>
  )}
</tbody>

                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PickUpPointMaster;
