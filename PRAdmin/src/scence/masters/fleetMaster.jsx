import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const FleetMaster = () => {
  const [fleets, setFleets] = useState([]);
  const [classList, setclassList] = useState([]);
  const [layoutList, setLayoutList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fleetId: null,
    busName: "",
    vehicleNumber: "",
    modelType: "",
    classId: null,
    layoutId: null,
    gpsEnabled: "Y",
    cctvEnabled: "Y",
    amenities: "",
    busRating: null,
    yearOfManufacture: "",
    seatConfig: "",
    gpsDeviceId: "",
    lastServiceDate: new Date().toISOString().substring(0, 10),
    insuranceExpiryDate: new Date().toISOString().substring(0, 10),
    pollutionExpiryDate: new Date().toISOString().substring(0, 10),
    createdBy: 1,
    modifiedBy: 1,
    status: "Active",
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchClassList();
    fetchLayoutList();
    fetchFleetList();
  }, []);

  const fetchClassList = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/getClassListDropDown`,
        getAuthHeaders()
      );
      setclassList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching Class List:", err);
    }
  };

  const fetchLayoutList = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/getLayoutListDropDown`,
        getAuthHeaders()
      );
      setLayoutList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching Layout List:", err);
    }
  };

  const fetchFleetList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/fleetMaster/getFleetList`,
        getAuthHeaders()
      );
      //alert(res);
      const rows = res?.data?.data || [];
      // alert(res);

      const mappedFleet = rows.map((u) => ({
        fleetId: u.ID,
        busName: u.BUSNAME || "",
        vehicleNumber: u.VEHICLENUMBER || "",
        modelType: u.MODELTYPE || "",
        classId: u.CLASSID || "",
        layoutId: u.LAYOUTID || "",
        gpsEnabled: u.GPS_ENABLED || "N",
        cctvEnabled: u.CCTV_ENABLED || "N",
        amenities: u.AMENITIES || "",
        busRating: u.BUSRATING ?? 0.0,
        yearOfManufacture: u.YEAR_OF_MANUFACTURE || "",
        seatConfig: u.SEATCONFIGURE || "",
        gpsDeviceId: u.GPS_DEVICEID || "",
        lastServiceDate: u.LAST_SERVICE_DATE
          ? String(u.LAST_SERVICE_DATE).substring(0, 10)
          : "",
        insuranceExpiryDate: u.INSURANCE_EXPIRY_DATE
          ? String(u.INSURANCE_EXPIRY_DATE).substring(0, 10)
          : "",
        pollutionExpiryDate: u.POLLUTION_EXPIRY_DATE
          ? String(u.POLLUTION_EXPIRY_DATE).substring(0, 10)
          : "",
        status: u.STATUS === "A" ? "Active" : "Inactive",
      }));

      setFleets(mappedFleet);
    } catch (err) {
      console.error(
        "❌ Error fetching fleet list:",
        err.response?.data || err.message
      );
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
      fleetId: null,
      busName: "",
      vehicleNumber: "",
      modelType: "",
      classId: "",
      layoutId: "",
      gpsEnabled: "Y",
      cctvEnabled: "Y",
      amenities: "",
      busRating: 0.0,
      yearOfManufacture: "",
      seatConfig: "",
      gpsDeviceId: "",
      lastServiceDate: new Date().toISOString().substring(0, 10),
      insuranceExpiryDate: new Date().toISOString().substring(0, 10),
      pollutionExpiryDate: new Date().toISOString().substring(0, 10),
      createdBy: 1,
      modifiedBy: 1,
      status: "Active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const errors = {};
    if (!form.busName || form.busName.trim() === "") {
      errors.busName = "Bus Name is required";
    }

    if (!form.vehicleNumber || !/^[A-Z0-9 -]+$/.test(form.vehicleNumber)) {
      errors.vehicleNumber = "Valid Vehicle Number is required";
    }

    if (!form.modelType || form.modelType.trim() === "") {
      errors.modelType = "Model Type is required";
    }

    if (!form.classId || isNaN(form.classId)) {
      errors.classId = "Valid Class ID is required";
    }

    if (!form.layoutId || isNaN(form.layoutId)) {
      errors.layoutId = "Valid Layout ID is required";
    }

    if (!["Y", "N"].includes(form.gpsEnabled)) {
      errors.gpsEnabled = "GPS Enabled must be Y or N";
    }

    if (!["Y", "N"].includes(form.cctvEnabled)) {
      errors.cctvEnabled = "CCTV Enabled must be Y or N";
    }

    if (!form.amenities || form.amenities.trim() === "") {
      errors.amenities = "Amenities must not be empty";
    }

    if (!form.busRating || !/^\d{1}(\.\d)?$/.test(form.busRating)) {
      errors.busRating = "Bus rating must be a decimal like 4.5 or 3.0";
    }

    if (!form.yearOfManufacture || !/^\d{4}$/.test(form.yearOfManufacture)) {
      errors.yearOfManufacture = "Year of Manufacture must be a 4-digit year";
    }

    if (!form.seatConfig || form.seatConfig.trim() === "") {
      errors.seatConfig = "Seat Config is required";
    }

    if (!form.gpsDeviceId || form.gpsDeviceId.trim() === "") {
      errors.gpsDeviceId = "GPS Device ID is required";
    }

    const today = new Date().toISOString().split("T")[0];

    if (!form.lastServiceDate || form.lastServiceDate > today) {
      errors.lastServiceDate = "Last Service Date must be today or earlier";
    }

    if (!form.insuranceExpiryDate || form.insuranceExpiryDate < today) {
      errors.insuranceExpiryDate =
        "Insurance Expiry must be today or in the future";
    }

    if (!form.pollutionExpiryDate || form.pollutionExpiryDate < today) {
      errors.pollutionExpiryDate =
        "Pollution Expiry must be today or in the future";
    }

    setSubmitting(true);

    try {
      const endpoint = form.fleetId ? "update" : "insert";

      const payload = form.fleetId
        ? {
            fleetId: form.fleetId, // ✅ Include fleetId when updating
            busName: form.busName,
            vehicleNumber: form.vehicleNumber,
            modelType: form.modelType,
            classId: form.classId,
            layoutId: form.layoutId,
            gpsEnabled: form.gpsEnabled,
            cctvEnabled: form.cctvEnabled,
            amenities: form.amenities,
            busRating: form.busRating,
            yearOfManufacture: form.yearOfManufacture,
            seatConfig: form.seatConfig,
            gpsDeviceId: form.gpsDeviceId,
            lastServiceDate: form.lastServiceDate,
            insuranceExpiryDate: form.insuranceExpiryDate,
            pollutionExpiryDate: form.pollutionExpiryDate,
            modifiedBy: form.modifiedBy, // if you're tracking who updated
          }
        : {
            busName: form.busName,
            vehicleNumber: form.vehicleNumber,
            modelType: form.modelType,
            classId: form.classId,
            layoutId: form.layoutId,
            gpsEnabled: form.gpsEnabled,
            cctvEnabled: form.cctvEnabled,
            amenities: form.amenities,
            busRating: form.busRating,
            yearOfManufacture: form.yearOfManufacture,
            seatConfig: form.seatConfig,
            gpsDeviceId: form.gpsDeviceId,
            lastServiceDate: form.lastServiceDate,
            insuranceExpiryDate: form.insuranceExpiryDate,
            pollutionExpiryDate: form.pollutionExpiryDate,
            createdBy: form.createdBy, // optional: who created
          };

      let res;
      if (endpoint === "insert") {
        res = await axios.post(
          `${BASE_URL}/fleetMaster/${endpoint}`,
          payload,
          getAuthHeaders()
        );
        //console.error(res);
      } else {
        //alert(payload);
        res = await axios.put(
          `${BASE_URL}/fleetMaster/${endpoint}`,
          payload,
          getAuthHeaders()
        );
        // alert(res);
      }

      const msg = res?.data?.meta?.message || "Saved successfully";
      setMessage(msg);
      if (res.data.meta.success) {
        resetForm();
        fetchFleetList();
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage(err.response?.data?.meta?.message || "Error saving Fleet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (u) => {
    // const payload = form.userId
    alert(" inside edit" + u);
    setForm({
      fleetId: u.fleetId,
      busName: u.busName,
      vehicleNumber: u.vehicleNumber,
      modelType: u.modelType,
      classId: u.classId,
      layoutId: u.layoutId,
      gpsEnabled: u.gpsEnabled,
      cctvEnabled: u.cctvEnabled,
      amenities: u.amenities,
      busRating: u.busRating,
      yearOfManufacture: u.yearOfManufacture,
      seatConfig: u.seatConfig,
      gpsDeviceId: u.gpsDeviceId,
      lastServiceDate: u.lastServiceDate,
      insuranceExpiryDate: u.insuranceExpiryDate,
      pollutionExpiryDate: u.pollutionExpiryDate,
    });
  };

  const toggleStatus = async (fleetId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "I" : "A";
    const displayStatus = newStatus === "I" ? "Inactive" : "Active";

    //alert(newStatus);
    const confirmChange = window.confirm(`Change status to ${displayStatus}?`);
    if (!confirmChange) return;

    try {
      const res = await axios.delete(`${BASE_URL}/fleetMaster/toggleStatus`, {
        data: {
          fleetId,
          status: newStatus,
        },
        ...getAuthHeaders(),
      });

      const msg = res?.data?.meta?.message || "Status updated";
      // alert(msg);
      setMessage(msg);

      if (res.data?.meta?.success) fetchFleetList();
    } catch (err) {
      console.error("❌ Status toggle error:", err);
      setMessage("Status update failed");
    }
  };

  const filteredFleet = fleets.filter(
    (u) =>
      u.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-5">
      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("fail")
              ? "alert-warning"
              : "alert-success"
          } text-center px-3 py-2 shadow`}
          style={{
            borderRadius: "12px",
            fontWeight: 500,
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {message}
        </div>
      )}

      <div className="card shadow border-0 rounded-4 mb-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4">Fleet Master Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-6">
              <input
                type="text"
                name="busName"
                value={form.busName}
                onChange={handleChange}
                className="form-control"
                placeholder="Bus Name"
                maxLength="100"
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
                className="form-control"
                placeholder="Vehicle Number"
                maxLength="20"
              />
            </div>

            <div className="col-md-6">
              <select
                name="classId"
                value={form.classId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Class</option>
                {classList.map((c) => (
                  <option key={c.CLASSID} value={c.CLASSID}>
                    {c.CLASSNAME}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <select
                name="layoutId"
                value={form.layoutId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Layout</option>
                {layoutList.map((l) => (
                  <option key={l.LAYOUTID} value={l.LAYOUTID}>
                    {l.LAYOUTNAME}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="modelType"
                value={form.modelType}
                onChange={handleChange}
                className="form-control"
                placeholder="Model Type"
                maxLength="50"
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                className="form-control"
                placeholder="Amenities"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="gpsEnabled" className="form-label">
                &nbsp;&nbsp;&nbsp;GPS Enable&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </label>
              <label>
                <input
                  type="radio"
                  name="gpsEnabled"
                  value="Y"
                  checked={form.gpsEnabled === "Y"}
                  onChange={handleChange}
                />{" "}
                Yes &nbsp;&nbsp;&nbsp;
                <input
                  type="radio"
                  name="gpsEnabled"
                  value="N"
                  checked={form.gpsEnabled === "N"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>

            <div className="col-md-6">
              <label htmlFor="cctvEnabled" className="form-label">
                &nbsp;&nbsp;&nbsp;CC TV Enable &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </label>
              <label>
                <input
                  type="radio"
                  name="cctvEnabled"
                  value="Y"
                  checked={form.cctvEnabled === "Y"}
                  onChange={handleChange}
                />{" "}
                Yes&nbsp;&nbsp;&nbsp;
                <input
                  type="radio"
                  name="cctvEnabled"
                  value="N"
                  checked={form.cctvEnabled === "N"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="busRating"
                value={form.busRating}
                onChange={handleChange}
                className="form-control"
                placeholder="Bus Rating(Ex: 3.5)"
                maxLength="3"
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="seatConfig"
                value={form.seatConfig}
                onChange={handleChange}
                className="form-control"
                placeholder="Seat Config"
                maxLength="50"
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="yearOfManufacture"
                value={form.yearOfManufacture}
                onChange={handleChange}
                className="form-control"
                placeholder="Year Of Manufacture(Ex:2025)"
                maxLength="4"
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                name="gpsDeviceId"
                value={form.gpsDeviceId}
                onChange={handleChange}
                className="form-control"
                placeholder="GPS Device Id"
                maxLength="50"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="insuranceExpiryDate" className="form-label">
                Insurance Expiry Date
              </label>
              <input
                type="date"
                id="insuranceExpiryDate"
                name="insuranceExpiryDate"
                value={form.insuranceExpiryDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="pollutionExpiryDate" className="form-label">
                Pollution Expiry Date
              </label>
              <input
                type="date"
                id="pollutionExpiryDate"
                name="pollutionExpiryDate"
                value={form.pollutionExpiryDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="lastServiceDate" className="form-label">
                Last Service Date
              </label>
              <input
                type="date"
                id="lastServiceDate"
                name="lastServiceDate"
                value={form.lastServiceDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn px-4"
                style={{ backgroundColor: "#1e1e2d", color: "#fff" }}
                disabled={submitting}
              >
                {submitting ? "Saving..." : form.fleetId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-light">
          <h5 className="mb-3">User List</h5>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div
            className="table-responsive"
            style={{ overflowX: "auto", whiteSpace: "nowrap" }}
          >
            {loading ? (
              <div className="text-center py-4">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
              </div>
            ) : (
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                  <tr>
                    <th>SL.NO</th>
                    <th>Bus Name</th>
                    <th>Vehicle Number</th>
                    <th>Model Type</th>
                    <th>Class</th>
                    <th>Layout</th>
                    <th>GPS Enabled</th>
                    <th>CCTV Enabled</th>
                    <th>Amenities</th>
                    <th>Bus Rating</th>
                    <th>Year of Manufacture</th>
                    <th>Seat Configuration</th>
                    <th>GPS Device ID</th>
                    <th>Last Service Date</th>
                    <th>Insurance Expiry Date</th>
                    <th>Pollution Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFleet.length > 0 ? (
                    filteredFleet.map((u, index) => (
                      <tr key={u.fleetId}>
                        <td>{index + 1}</td>
                        <td>{u.busName}</td>
                        <td>{u.vehicleNumber}</td>
                        <td>{u.modelType}</td>
                        <td>
                          {" "}
                          {classList?.find((r) => r.CLASSID === u.classId)
                            ?.CLASSNAME || "-"}
                        </td>
                        <td>
                          {layoutList?.find((r) => r.LAYOUTID === u.layoutId)
                            ?.LAYOUTNAME || "-"}
                        </td>
                        <td>{u.gpsEnabled}</td>
                        <td>{u.cctvEnabled}</td>
                        <td>{u.amenities}</td>
                        <td>{u.busRating}</td>
                        <td>{u.yearOfManufacture}</td>
                        <td>{u.seatConfig}</td>
                        <td>{u.gpsDeviceId}</td>
                        <td>{u.lastServiceDate}</td>
                        <td>{u.insuranceExpiryDate}</td>
                        <td>{u.pollutionExpiryDate}</td>
                        <td>{u.status}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm rounded-pill px-3"
                              style={{
                                backgroundColor: "#1e1e2d",
                                color: "#fff",
                              }}
                              onClick={() => handleEdit(u)}
                              aria-label="Edit Fleet"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="btn btn-sm rounded-pill px-3"
                              style={{
                                backgroundColor:
                                  u.status === "Active" ? "#6c757d" : "#2a5298",
                                color: "#fff",
                              }}
                              onClick={() => toggleStatus(u.fleetId, u.status)}
                              aria-label="Toggle Status"
                            >
                              {u.status === "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="19" className="text-center text-muted">
                        No fleet data found
                      </td>
                    </tr>
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

export default FleetMaster;
