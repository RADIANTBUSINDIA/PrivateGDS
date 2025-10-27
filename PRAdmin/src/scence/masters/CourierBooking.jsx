import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const CourierBooking = () => {
  const [placeList, setPlaceList] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
   const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [bookingList, setBookingList] = useState([]);

  const [form, setForm] = useState({
    courierReferanceId: "",
    createdBy: 1,
    modifiedBy: 1,
    consignmentNo : "",
    status: "Active",
    fromPlaceId: "",
    toPlaceId: "",
    senderName: "",
    receiverName: "",
    receiverMobileNo: "",
    senderMobileNo: "",
    senderAddress: "",
    receiverAddress: "",
    courierCategory: "",
    bookingMode: "",
    quantityKgs: "",
    quantityNumber: "",
    totalFare: "",
    distanceKms: "",
    quantity: "",
    imagePath: "",
    toPincode: "",
    fromPincode: "",
    journeyDate: new Date().toISOString().substring(0, 10),
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchPlaceList();
    fetchBookingList();
  }, []);

  useEffect(() => {
    if (form.bookingMode === "Kms" && form.fromPlaceId && form.toPlaceId) {
      fetchGetDistanceFare();
    } else if (form.bookingMode === "Kgs" && form.quantityKgs) {
      fetchGetKgsFare();
    } else {
      setForm((prev) => ({
        ...prev,
        distanceKms: "",
        totalFare: "",
      }));
    }
  }, [form.bookingMode, form.fromPlaceId, form.toPlaceId, form.quantityKgs]);

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

  const fetchGetDistanceFare = async () => { 
    try {
      const payload = {
        startPlaceId: form.fromPlaceId,
        endPlaceId: form.toPlaceId,
      };
      const res = await axios.post(
        `${BASE_URL}/parcelCounter/courier/getFareByKm`,
        payload,
        getAuthHeaders()
      );

      if (res.data?.data?.length > 0) {
        const distanceKms = res.data.data[0].Distance_KM;
        const totalFare = res.data.data[0].Fare;
        setForm((prev) => ({
          ...prev,
          distanceKms,
          totalFare,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          distanceKms: "",
          totalFare: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching distance fare:", error);
      alert("Failed to fetch fare.");
    }
  };

  const fetchGetKgsFare = async () => {
    try {
      const payload = { kg: form.quantityKgs };
      const res = await axios.post(
        `${BASE_URL}/parcelCounter/courier/getFareByKg`,
        payload,
        getAuthHeaders()
      );
      if (res.data?.data?.length > 0) {
        const totalFare = res.data.data[0].RDM_TOTAL_FARE;
        setForm((prev) => ({ ...prev, totalFare }));
      } else {
        setForm((prev) => ({ ...prev, totalFare: "" }));
      }
    } catch (error) {
      console.error("Error fetching kg-based fare:", error);
      alert("Failed to fetch fare.");
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploading(true);
      const response = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.imagePath || "";
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      setMessage("Image upload failed. Please try again.");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bookingMode") {
      setForm((prev) => ({
        ...prev,
        bookingMode: value,
        quantityKgs: "",
        quantityNumber: "",
        quantity: "",
        totalFare: "",
        distanceKms: "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      courierReferanceId: "",
      createdBy: 1,
      modifiedBy: 1,
      status: "Active",
      fromPlaceId: "",
      toPlaceId: "",
      senderName: "",
      receiverName: "",
      receiverMobileNo: "",
      senderMobileNo: "",
      senderAddress: "",
      receiverAddress: "",
      courierCategory: "",
      bookingMode: "",
      quantityKgs: "",
      quantityNumber: "",
      totalFare: "",
      distanceKms: "",
      quantity: "",
      imagePath: "",
      toPincode: "",
      fromPincode: "",
      journeyDate: new Date().toISOString().substring(0, 10),
    });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    if (
      !form.senderName ||
      !form.receiverName ||
      !form.senderMobileNo ||
      !form.receiverMobileNo ||
      !form.senderAddress ||
      !form.receiverAddress ||
      !form.courierCategory ||
      !form.bookingMode
    ) {
      setMessage("Please fill all required fields.");
      setSubmitting(false);
      return;
    }

    if (form.bookingMode === "Kms" && (!form.fromPlaceId || !form.toPlaceId)) {
      setMessage("From and To Place are required for Kms mode.");
      setSubmitting(false);
      return;
    }

    if (form.bookingMode === "Kgs" && !form.quantityKgs) {
      setMessage("Quantity in Kgs is required for Kgs mode.");
      setSubmitting(false);
      return;
    }

    if (form.bookingMode === "quantity" && !form.quantityNumber) {
      setMessage("Quantity number is required for Quantity mode.");
      setSubmitting(false);
      return;
    }

    try {
      let uploadedImagePath = form.imagePath;
      if (file) {
        uploadedImagePath = await uploadFile(file);
        if (!uploadedImagePath) {
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        fromPlace: form.fromPlaceId,
        toPlace: form.toPlaceId,
        distance: form.distanceKms || 0,
        fromAdress: form.senderAddress,
        toAddress: form.receiverAddress,
        fromPincode: form.fromPincode,
        toPincode: form.toPincode,
        bookingMode: form.bookingMode,
        qantities: form.quantityNumber || 0,
        actualKg: form.quantityKgs || 0,
        fromSenderName: form.senderName,
        toReciverName: form.receiverName,
        senderMobNo: form.senderMobileNo,
        reciverModNo: form.receiverMobileNo,
        invoiceNo: uploadedImagePath,
        courierCategory: form.courierCategory,
        totalFare: form.totalFare || 0,
        createdBy: form.createdBy,
      };

      const res = await axios.post(
        `${BASE_URL}/parcelCounter/courier/insertcourierBooking`,
        payload,
        { headers: getAuthHeaders().headers }
      );

      const msg = res?.data?.meta?.message;
     
      setMessage(msg);
      if (res.data.meta.success) fetchBookingList()
         resetForm();
    } catch (err) {
      console.error("Submit error:", err);
      setMessage(err.response?.data?.meta?.message || "Error booking courier");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBookingList = async () => {
  setLoading(true);
  try {
    const payload = { userId: form.createdBy || 1 };  // Pass actual userId dynamically if needed

    const res = await axios.post(
      `${BASE_URL}/parcelCounter/courier/getTodayCourierBookingList`,
      payload,
      getAuthHeaders()
    );

    const rows = res?.data?.data || [];

    const mappedBookings = rows.map((r) => ({
      rateId: r.ID,
      consignmentNo: r.CONSIGNMENT_NO || "",
      fromPlaceId: r.FROM_PLACE || "",
      toPlaceId: r.TO_PLACE || "",
      fromAddress: r.FROM_ADDRESS || "",
      toAddress: r.TO_ADDRESS || "",
      bookingMode: r.BOOKING_MODE || "",
      senderName: r.SENDERNAME || "",
      receiverName: r.RECIVER_NAME || "",
      senderMobileNo: r.SENDER_MOBILENAME || "",
      receiverMobileNo: r.RECIVER_MOBIL_NAME || "",
      courierCategory: r.COURIER_CATAGORY || "",
      totalFare: r.TOTAL_FARE || "",
      bookedDate: r.BOOKED_DATE || "",
      bookedTime: r.BOOKED_TIME || "",
    }));

    setBookingList(mappedBookings);
  } catch (err) {
    console.error("❌ Error fetching courier booking list:", err);
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="container my-5">
      <div
        className="card shadow-sm border-0 rounded-4 mb-4"
        style={{ backgroundColor: "#1e1e2d", color: "white" }}
      >
        <div className="card-body py-3 px-4 d-flex justify-content-center align-items-center">
          <h4 className="mb-0 text-center">Courier Booking</h4>
        </div>
      </div>

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
        <div className="card-body p-4 bg-light">
          <form onSubmit={handleSubmit} className="row g-3">
            {/* Sender & Receiver */}
            <div className="col-md-6">
              <label className="form-label">Sender Name</label>
              <input
                type="text"
                name="senderName"
                value={form.senderName}
                onChange={handleChange}
                className="form-control border-primary"
                maxLength="50"
                placeholder="Enter Sender Name"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Receiver Name</label>
              <input
                type="text"
                name="receiverName"
                value={form.receiverName}
                onChange={handleChange}
                className="form-control border-primary"
                placeholder="Enter Receiver Name"
                required
              />
            </div>

            {/* Sender & Receiver Mobile */}
            <div className="col-md-6">
              <label className="form-label">Sender Mobile No</label>
              <input
                type="text"
                name="senderMobileNo"
                value={form.senderMobileNo}
                onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                  setForm((prev) => ({ ...prev, senderMobileNo: value }));
                }}
                 className="form-control border-primary"
                maxLength="13"
                placeholder="Enter Sender Mobile No"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Receiver Mobile No</label>
              <input
                type="text"
                name="receiverMobileNo"
                value={form.receiverMobileNo}
                onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                  setForm((prev) => ({ ...prev, receiverMobileNo: value }));
                }}
                className="form-control border-primary"
                maxLength="13"
                placeholder="Enter Receiver Mobile No"
                required
              />
            </div>

            {/* Addresses & Pincodes */}
            <div className="col-md-6">
              <label className="form-label">Sender Address</label>
              <textarea
                name="senderAddress"
                value={form.senderAddress}
                onChange={handleChange}
                className="form-control border-primary"
                maxLength="200"
                rows="3"
                placeholder="Enter Sender Address"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Receiver Address</label>
              <textarea
                name="receiverAddress"
                value={form.receiverAddress}
                onChange={handleChange}
                className="form-control border-primary"
                maxLength="200"
                rows="3"
                placeholder="Enter Receiver Address"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">From Pincode</label>
              <input
                type="text"
                name="fromPincode"
                value={form.fromPincode}
                onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                  setForm((prev) => ({ ...prev, fromPincode: value }));
                }}
                className="form-control border-primary"
                maxLength="7"
                placeholder="Enter From Pincode"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">To Pincode</label>
              <input
                type="text"
                name="toPincode"
                value={form.toPincode}
                onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                  setForm((prev) => ({ ...prev, toPincode: value }));
                }}
                className="form-control border-primary"
                maxLength="7"
                placeholder="Enter To Pincode"
              />
            </div>

            {/* Places */}
            <div className="col-md-6">
              <label className="form-label">From Place</label>
              <select
                name="fromPlaceId"
                value={form.fromPlaceId}
                onChange={handleChange}
                className="form-select border-primary"
                required={form.bookingMode === "Kms"}
              >
                <option value="">-- Select --</option>
                {placeList.map((p) => (
                  <option key={p.ID} value={p.ID}>
                    {p.NAME}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">To Place</label>
              <select
                name="toPlaceId"
                value={form.toPlaceId}
                onChange={handleChange}
                className="form-select border-primary"
                required={form.bookingMode === "Kms"}
              >
                <option value="">-- Select --</option>
                {placeList.map((p) => (
                  <option key={p.ID} value={p.ID}>
                    {p.NAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Courier Category & Invoice */}
            <div className="col-md-6">
              <label className="form-label">Courier Category</label>
              <select
                name="courierCategory"
                value={form.courierCategory}
                onChange={handleChange}
                className="form-select border-primary"
                required
              >
                <option value="">-- Select --</option>
                <option value="Documents">Documents</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food Items">Food Items</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Fragile Items">Fragile Items</option>
                <option value="Heavy Goods">Heavy Goods</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Upload Invoice (JPG only)</label>
              <input
                type="file"
                name="imagePath"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="form-control border-primary"
                ref={fileInputRef}
              />
            </div>

            {/* Booking Mode */}
            <div className="col-md-6">
              <label className="form-label">Booking Mode</label>
              <select
                name="bookingMode"
                value={form.bookingMode}
                onChange={handleChange}
                className="form-select border-primary"
                required
              >
                <option value="">-- Select --</option>
                <option value="Kms">Kms</option>
                <option value="Kgs">Kgs</option>
                <option value="quantity">Quantity</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {form.bookingMode === "Kms" && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Distance (KM)</label>
                  <input
                    type="text"
                    name="distanceKms"
                    value={form.distanceKms || ""}
                    readOnly
                    className="form-control border-primary"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fare</label>
                  <input
                    type="text"
                    name="totalFare"
                    value={form.totalFare || ""}
                    readOnly
                    className="form-control border-primary"
                  />
                </div>
              </>
            )}

            {form.bookingMode === "Kgs" && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Quantity (Kgs)</label>
                  <input
                    type="number"
                    name="quantityKgs"
                    value={form.quantityKgs || ""}
                    onChange={handleChange}
                    className="form-control border-primary"
                    placeholder="Enter Quantity (Kgs)"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fare</label>
                  <input
                    type="text"
                    name="totalFare"
                    value={form.totalFare || ""}
                    readOnly
                    className="form-control border-primary"
                  />
                </div>
              </>
            )}

            {form.bookingMode === "quantity" && (
              <>
                <div className="col-md-6">
                  <label className="form-label">No. Quantity</label>
                  <input
                    type="number"
                    name="quantityNumber"
                    value={form.quantityNumber || ""}
                    onChange={handleChange}
                    className="form-control border-primary"
                    placeholder="Enter Quantity"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fare</label>
                  <input
                    type="number"
                    name="totalFare"
                    value={form.totalFare || ""}
                    onChange={handleChange}
                    className="form-control border-primary"
                    placeholder="Enter Fare"
                    maxLength={10}
                  />
                </div>
              </>
            )}

            {form.bookingMode === "Others" && (
              <div className="col-md-6">
                <label className="form-label">Fare</label>
                <input
                  type="text"
                  name="totalFare"
                  value={form.totalFare || ""}
                  onChange={handleChange}
                  className="form-control border-primary"
                  placeholder="Enter Fare"
                  maxLength={10}
                />
              </div>
            )}

            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn px-4"
                style={{ backgroundColor: "#161718ff", color: "#fff" }}
                disabled={submitting}
              >
                {submitting ? "Booking..." : "Book"}
              </button>
               <button
              type="button"
              className="btn btn-secondary px-4"
              style={{ backgroundColor: "#161718ff", color: "#fff" }}
              onClick={resetForm}
            >
              Reset
            </button>
            </div>
          </form>
        </div>
      </div>
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-light">
          <h5 className="mb-3">Booking List</h5>
          <div className="table-responsive">
            { (
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                  <tr>
                    <th>Sl.No</th>
                    <th>Consignment Number</th>
                    <th>Sender Name</th>
                    <th>Receiver Name</th>
                    <th>Sender Mobile No</th>
                    <th>Receiver Mobile No</th>
                    <th>Sender Address</th>
                    <th>Receiver Address</th>
                    <th>From Place</th>
                    <th>To Place</th>
                    <th>Courier Category</th>
                    <th>Booking Mode</th>
                    <th>Total Fare</th>
                  </tr>
                </thead>
                <tbody>
                {bookingList.length > 0 ? (
                  bookingList.map((r, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{r.consignmentNo}</td>
                      <td>{r.senderName}</td>
                      <td>{r.receiverName}</td>
                      <td>{r.senderMobileNo}</td>
                      <td>{r.receiverMobileNo}</td>
                      <td>{r.fromAddress}</td>
                      <td>{r.toAddress}</td>
                      <td>{r.fromPlaceId}</td>
                      <td>{r.toPlaceId}</td>
                      <td>{r.courierCategory}</td>
                      <td>{r.bookingMode}</td>
                      <td>{r.totalFare}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center text-muted">
                      No data found
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

export default CourierBooking;
