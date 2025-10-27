import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const AssignCouriersToTrips = () => {
  const today = new Date().toISOString().split("T")[0];
  const [placeList, setPlaceList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [courierList, setCourierList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    assignmentId: null,
    tripConsignId: null,
    fromDate: today,
    toDate: today,
    vehicleRegNo: "",
    fromPlace: "",
    toPlace: "",
    mobileNo: "",
    quantities: 0,
    createdBy: 1,
    modifiedBy: 1,
    status: "Active",
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  // Fetch places
  const fetchPlaceList = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/parcelCounter/courier/getPlacesLists`,
        getAuthHeaders()
      );
      setPlaceList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching place list:", err);
    }
  };

  // Fetch vehicles
  const fetchVehicleList = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/parcelCounter/courier/getVehicleList`,
        getAuthHeaders()
      );
      setVehicleList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching vehicle list:", err);
    }
  };

  // Fetch unassigned couriers
  const fetchNotAssignedCouriers = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await axios.post(
        `${BASE_URL}/parcelCounter/courier/getNotAssignedCourier`,
        {
          fromDate: form.fromDate,
          toDate: form.toDate,
        },
        getAuthHeaders()
      );

      if (res?.data?.meta?.success) {
        setCourierList(res.data.data || []);
        if (!res.data.data?.length) {
          setMessage("No unassigned couriers found.");
        }
      } else {
        setCourierList([]);
        setMessage("No unassigned couriers found.");
      }
    } catch (err) {
      console.error("Error fetching couriers:", err);
      setMessage("Failed to load couriers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotAssignedCouriers();
    fetchPlaceList();
    fetchVehicleList();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let newForm = { ...prev, [name]: value };

      // Date validation
      if (name === "fromDate" && newForm.toDate < value) {
        setError("From Date cannot be greater than To Date");
        newForm.toDate = value;
      } else if (name === "toDate" && value < newForm.fromDate) {
        setError("To Date cannot be less than From Date");
        newForm.fromDate = value;
      } else {
        setError("");
      }

      return newForm;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotAssignedCouriers();
  };

  const toggleCheckbox = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === courierList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(courierList.map((c) => c.ID));
    }
  };

  // Generate Courier Booking
  const handleGenerateInvoice = async () => {
      if (!form.vehicleRegNo) {
        alert("Please select a vehicle.");
        return;
      }
      if (!form.fromPlace) {
        alert("Please select From Place.");
        return;
      }
      if (!form.toPlace) {
        alert("Please select To Place.");
        return;
      }
      if (!form.mobileNo) {
        alert("Please enter Mobile No.");
        return;
      }
      if (selectedIds.length === 0) {
        alert("Please select at least one courier.");
        return;
      }

  setLoading(true);

  try {
    // 1️⃣ Call first API once
    const firstPayload = {
      fleetId: form.vehicleRegNo,
      fromPlaceId: form.fromPlace,
      toPlaceId: form.toPlace,
      contactNo: form.mobileNo,
      quantities: selectedIds.length,
    };

    const firstRes = await axios.post(
      `${BASE_URL}/parcelCounter/courier/insertCourierBookingTransport`,
      firstPayload,
      getAuthHeaders()
    );

    if (!firstRes.data.meta.success) {
      alert(firstRes.data.meta.message || "Step 1 failed.");
      return;
    }

    // 2️⃣ Call second API only for selected couriers
    for (let courierId of selectedIds) {
      const courier = courierList.find((c) => c.ID === courierId);
      const secondPayload = {
        tripConsignId: form.tripConsignId || "53", // or use dynamic value
        consignId: courierId,
        fromPlace: form.fromPlace,
        toPlace: form.toPlace,
        fare: courier?.TOTAL_FARE || 0,
      };

      const secondRes = await axios.post(
        `${BASE_URL}/parcelCounter/courier/insertCourierBookingTransportDetails`,
        secondPayload,
        getAuthHeaders()
      );

      if (!secondRes.data.meta.success) {
        alert(
          `Failed to insert transport details for courier ID ${courierId}`
        );
        return;
      }
    }

    alert("Courier booking transport details inserted successfully!");
    setSelectedIds([]);
    fetchNotAssignedCouriers();
  } catch (err) {
    console.error("Error in courier workflow:", err);
    alert("An error occurred while processing the courier booking.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="card shadow border-0 rounded-4 mb-4">
        <div
          className="card-body py-3 px-4 text-center"
          style={{ backgroundColor: "#120f0fed", color: "white" }}
        >
          <h3 className="mb-0">📦 Courier Assignment</h3>
        </div>
      </div>

      {/* Filters */}
      <form
        className="row g-3 align-items-end bg-light p-3 rounded-3 shadow-sm mb-4"
        onSubmit={handleSearch}
      >
        <div className="col-md-6">
          <label>From Place</label>
          <select
            name="fromPlace"
            value={form.fromPlace}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select From Place</option>
            {placeList.map((place) => (
              <option key={place.ID} value={place.ID}>
                {place.NAME}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label>To Place</label>
          <select
            name="toPlace"
            value={form.toPlace}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select To Place</option>
            {placeList.map((place) => (
              <option key={place.ID} value={place.ID}>
                {place.NAME}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label>Bus No</label>
          <select
            name="vehicleRegNo"
            value={form.vehicleRegNo}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select Vehicle</option>
            {vehicleList.map((vehicle) => (
              <option key={vehicle.FLM_FLEETID} value={vehicle.FLM_FLEETID}>
                {vehicle.FLM_VEHICLENUMBER}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label>Mobile No</label>
          <input
            type="text"
            name="mobileNo"
            placeholder="Enter the mobile No"
            value={form.mobileNo}
            onChange={handleChange}
            className="form-control"
            maxLength={11}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-bold">From Date</label>
          <input
            type="date"
            name="fromDate"
            className="form-control shadow-sm"
            value={form.fromDate}
            max={today}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold">To Date</label>
          <input
            type="date"
            name="toDate"
            className="form-control shadow-sm"
            value={form.toDate}
            min={form.fromDate}
            max={today}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4 d-flex">
          <button
            type="submit"
            className="btn flex-fill shadow-sm"
            style={{ backgroundColor: "#120f0fed", color: "#fff" }}
            disabled={loading}
          >
            {loading ? "Searching..." : "🔍 Search"}
          </button>
        </div>
      </form>

      {/* Error & Messages */}
      {error && (
        <div className="alert alert-danger text-center fw-bold">{error}</div>
      )}
      {message && (
        <div className="alert alert-warning text-center fw-bold">{message}</div>
      )}

      {/* Table */}
      {courierList.length > 0 && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead
                  style={{
                    backgroundColor: "#120f0fed",
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          courierList.length > 0 &&
                          selectedIds.length === courierList.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Consignment No</th>
                    <th>From Place</th>
                    <th>To Place</th>
                    <th>From Address</th>
                    <th>To Address</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Sender Mobile No</th>
                    <th>Receiver Mobile No</th>
                    <th>Category</th>
                    <th>Total Fare</th>
                  </tr>
                </thead>
                <tbody>
                  {courierList.map((c) => (
                    <tr key={c.ID}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.ID)}
                          onChange={() => toggleCheckbox(c.ID)}
                        />
                      </td>
                      <td className="fw-bold">{c.CONSINMENT_NO}</td>
                      <td>{c.FROM_PLACE_NAME}</td>
                      <td>{c.TO_PLACENAME}</td>
                      <td>{c.FROM_ADDRESS}</td>
                      <td>{c.TO_ADDRESS}</td>
                      <td>{c.SENDER_NAME}</td>
                      <td>{c.RECIVER_NAME}</td>
                      <td>{c.SENDERMOBILE_NO}</td>
                      <td>{c.RECIVER_MOBIL_NO}</td>
                      <td>
                        <span className="badge bg-primary">{c.CATEGORY}</span>
                      </td>
                      <td className="fw-bold text-success">₹{c.TOTAL_FARE || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Selected Count + Generate */}
      {selectedIds.length > 0 && (
        <div className="d-flex flex-column align-items-center mt-4">
          <input
            type="text"
            name="quantities"
            className="form-control text-center shadow-sm mb-3"
            value={`${selectedIds.length} courier(s) selected`}
            readOnly
            style={{
              backgroundColor: "#120f0fed",
              color: "#fff",
              fontWeight: "500",
              fontSize: "1rem",
              width: "250px",
              border: "none",
              borderRadius: "30px",
            }}
          />

          <button
            className="btn btn-warning shadow px-4 fw-bold"
            onClick={handleGenerateInvoice}
            disabled={loading}
          >
            🧾 Generate
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignCouriersToTrips;
