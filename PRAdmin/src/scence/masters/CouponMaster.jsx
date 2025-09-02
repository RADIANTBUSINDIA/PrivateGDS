import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";
import { FaTicketAlt } from "react-icons/fa";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';


const CouponScreen = () => {
  const [activeTab, setActiveTab] = useState("master"); // master | applicability

  // Coupon Master State
  const [form, setForm] = useState({
    couponId: "",
    couponCode: "",
    couponName: "",
    cashBackFlag: "N",
  });

  const couponCodeInputRef = useRef();         // Applicability (readonly) focus
  const couponCodeRef = useRef(null);          // Master (edit) focus
  const [couponList, setCouponList] = useState([]);
  const [message, setMessage] = useState("");

  // Pagination (Master)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ----------------------------
  // Applicability: state & helpers
  // ----------------------------
  const [applicabilityForm, setApplicabilityForm] = useState({
    caId: "",
    couponId: "", // filled from Master on select/edit
    routeId: "",
    fromPlaceId: "",
    toPlaceId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    discountType: "",
    discountAmount: "",
    maxDiscountLimit: "",
  });

  const [routeList, setRouteList] = useState([]);
  const [fromPlaces, setFromPlaces] = useState([]);
  const [toPlaces, setToPlaces] = useState([]);

  // Applicability LIST + pagination
  const [applicabilityList, setApplicabilityList] = useState([]);
  const [currentApplicabilityPage, setCurrentApplicabilityPage] = useState(1);
  const itemsPerPageApplicability = 10;
  const totalApplicabilityPages = Math.ceil(applicabilityList.length);
  const paginatedApplicabilities = applicabilityList.slice(
    (currentApplicabilityPage - 1) * itemsPerPageApplicability,
    currentApplicabilityPage * itemsPerPageApplicability
  );

  // ----------------------------
  // Effects
  // ----------------------------
  useEffect(() => {
    if (activeTab === "master") {
      fetchCoupons();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRouteCodes();
  }, []);

  useEffect(() => {
    if (activeTab === "applicability") {
      fetchApplicabilityList();
    }
  }, [activeTab]);

  // ----------------------------
  // Helpers
  // ----------------------------
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const ensureTimeSeconds = (timeStr) => {
    if (!timeStr) return null;
    if (timeStr.split(":").length === 3) return timeStr;
    return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  };

  const formatDateToDDMMYYYY = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yyyy, mm, dd] = value.split("-");
      return `${dd}-${mm}-${yyyy}`;
    }
    return value;
  };

  // ----------------------------
  // API Calls (unchanged endpoints)
  // ----------------------------
  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/couponMaster/couponList`, getAuthHeaders());
      setCouponList(res.data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setCouponList([]);
    }
  };

  const handleToggleStatus = async (couponId, status) => {
    const newStatus = status === "A" ? "I" : "A";
    const confirmMsg = `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`;
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/updateCouponMaster/couponStatus`,
        { couponId: couponId, status: newStatus },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message || "Status updated");
      if (res.data.meta.success) {
        fetchCoupons();
      }
    } catch (err) {
      console.error("Toggle Error:", err);
      const msg = err?.response?.data?.meta?.message || "Failed to toggle status.";
      setMessage(msg);
    }
  };

  const handleApplicableToggleStatus = async (couponId, status) => {
    const newStatus = status === "A" ? "I" : "A";
    const confirmMsg = `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`;
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/couponApplicableStatus/changeStatus`,
        { couponId: couponId, status: newStatus }, // ← keeps your original body
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message || "Status updated");
      if (res.data.meta.success) {
        // add braces so both refresh only on success
        fetchCoupons();
        fetchApplicabilityList();
      }
    } catch (err) {
      console.error("Toggle Error:", err);
      const msg = err?.response?.data?.meta?.message || "Failed to toggle status.";
      setMessage(msg);
    }
  };

  const APPLICABILITY_ENDPOINT = `${BASE_URL}/couponApplicability/insertApplicableCoupon`;
  const APPLICABILITY_ENDPOINT_update = `${BASE_URL}/updateCouponApplicable/CouponFields`;

  // const handleApplicabilitySubmit = async (e) => {
  //   e.preventDefault();

  //   const couponIdToSend = applicabilityForm.couponId || form.couponId;
  //   if (!couponIdToSend) {
  //     setMessage("⚠️ Please select a coupon from Coupon Master first.");
  //     return;
  //   }
  //   if (!applicabilityForm.routeId || !applicabilityForm.fromPlaceId || !applicabilityForm.toPlaceId) {
  //     setMessage("⚠️ Please fill in Route, From, and To places.");
  //     return;
  //   }

  //   const payload = {
  //     caId: applicabilityForm.caId,
  //     CouponId: parseInt(couponIdToSend, 10),
  //     RouteId: parseInt(applicabilityForm.routeId, 10),
  //     FromPlaceId: parseInt(applicabilityForm.fromPlaceId, 10),
  //     ToPlaceId: parseInt(applicabilityForm.toPlaceId, 10),
  //     StartDate: applicabilityForm.startDate || null,
  //     EndDate: applicabilityForm.endDate || null,
  //     StartTime: ensureTimeSeconds(applicabilityForm.startTime),
  //     EndTime: ensureTimeSeconds(applicabilityForm.endTime),
  //     DiscountType: applicabilityForm.discountType || null,
  //     DiscountAmount: applicabilityForm.discountAmount ? parseFloat(applicabilityForm.discountAmount) : 0,
  //     MaxDiscountLimit: applicabilityForm.maxDiscountLimit ? parseFloat(applicabilityForm.maxDiscountLimit) : 0,
  //   };

  //   try {
  //     let res;
  //     if (applicabilityForm.caId) {
  //       res = await axios.put(APPLICABILITY_ENDPOINT_update, payload, getAuthHeaders());
  //     } else {
  //       res = await axios.post(APPLICABILITY_ENDPOINT, payload, getAuthHeaders());
  //     }

  //     const resultMsg = res?.data?.meta?.message || "✅ Applicability saved.";
  //     setMessage(resultMsg);

  //     if (res.data?.meta?.success) {
  //       setApplicabilityForm((prev) => ({
  //         ...prev,
  //         caId: "",
  //         routeId: "",
  //         fromPlaceId: "",
  //         toPlaceId: "",
  //         startDate: "",
  //         endDate: "",
  //         startTime: "",
  //         endTime: "",
  //         discountType: "",
  //         discountAmount: "",
  //         maxDiscountLimit: "",
  //       }));
  //       fetchApplicabilityList();
  //     }
  //   } catch (err) {
  //     console.error("Save Applicability Error:", err.response?.data || err.message || err);
  //     const errorMsg =
  //       err?.response?.data?.meta?.message ||
  //       err?.response?.data?.message ||
  //       err.message ||
  //       "❌ Error saving applicability.";
  //     setMessage(errorMsg);
  //   }
  // };


  const handleApplicabilitySubmit = async (e) => {
  e.preventDefault();

  const couponIdToSend = applicabilityForm.couponId || form.couponId;
  if (!couponIdToSend) {
    setMessage("⚠️ Please select a coupon from Coupon Master first.");
    return;
  }
  if (!applicabilityForm.routeId || !applicabilityForm.fromPlaceId || !applicabilityForm.toPlaceId) {
    setMessage("⚠️ Please fill in Route, From, and To places.");
    return;
  }

  const payload = {
    caId: applicabilityForm.caId,
    CouponId: parseInt(couponIdToSend, 10),
    RouteId: parseInt(applicabilityForm.routeId, 10),
    FromPlaceId: parseInt(applicabilityForm.fromPlaceId, 10),
    ToPlaceId: parseInt(applicabilityForm.toPlaceId, 10),
    StartDate: applicabilityForm.startDate || null,
    EndDate: applicabilityForm.endDate || null,
    StartTime: ensureTimeSeconds(applicabilityForm.startTime),
    EndTime: ensureTimeSeconds(applicabilityForm.endTime),
    DiscountType: applicabilityForm.discountType || null,
    DiscountAmount: applicabilityForm.discountAmount ? parseFloat(applicabilityForm.discountAmount) : 0,
    MaxDiscountLimit: applicabilityForm.maxDiscountLimit ? parseFloat(applicabilityForm.maxDiscountLimit) : 0,
  };

  try {
    let res;
    if (applicabilityForm.caId) {
      res = await axios.put(APPLICABILITY_ENDPOINT_update, payload, getAuthHeaders());
    } else {
      res = await axios.post(APPLICABILITY_ENDPOINT, payload, getAuthHeaders());
    }

    const resultMsg = res?.data?.meta?.message || "✅ Applicability saved.";
    setMessage(resultMsg);

    if (res.data?.meta?.success) {
      // ✅ Reset form after success
      setApplicabilityForm({
        caId: "",
        couponId: "",
        routeId: "",
        fromPlaceId: "",
        toPlaceId: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        discountType: "",
        discountAmount: "",
        maxDiscountLimit: "",
      });

      // ✅ Refresh only the table instead of full page reload
      await fetchApplicabilityList();

      // (Optional) ✅ If you still want hard reload after save, uncomment below
      // window.location.reload();
    }
  } catch (err) {
    console.error("Save Applicability Error:", err.response?.data || err.message || err);
    const errorMsg =
      err?.response?.data?.meta?.message ||
      err?.response?.data?.message ||
      err.message ||
      "❌ Error saving applicability.";
    setMessage(errorMsg);
  }
};


  const fetchRouteCodes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fareMaster/getRouteCodeDropdown`, getAuthHeaders());
      const routes = res.data?.data || [];
      setRouteList(routes);
    } catch (err) {
      console.error("Error loading route codes:", err);
      setRouteList([]);
    }
  };

  const handleRouteChange = async (e) => {
    const routeIdOrCode = e.target.value;
    
    
    setApplicabilityForm((prev) => ({ ...prev, routeId: routeIdOrCode, fromPlaceId:routeIdOrCode === "0" ? "0" : prev.fromPlaceId, toPlaceId: routeIdOrCode === "0" ? "0" : prev.toPlaceId, }));
    setFromPlaces([]);
    setToPlaces([]);

    if (!routeIdOrCode) return;

    const selected = routeList.find(
      (r) => String(r.ROUTEID) === String(routeIdOrCode) || String(r.ROUTECODE) === String(routeIdOrCode)
    );
    const routeCode = selected?.ROUTECODE;

    const postBody = {};
    if (selected?.ROUTEID) postBody.routeId = parseInt(selected.ROUTEID, 10);
    if (routeCode) postBody.routeCode = routeCode;

    try {
      const res = await axios.post(`${BASE_URL}/routeMaster/routePlaceDetails`, postBody, getAuthHeaders());
      const places = res.data?.data || [];
      setFromPlaces(places);
      setToPlaces(places);
    } catch (err) {
      console.error("Error fetching route places:", err);
      setFromPlaces([]);
      setToPlaces([]);
    }
  };

  const fetchApplicabilityList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/couponMasterList/fetchCoupons`, getAuthHeaders());
      const list = res.data?.data ?? res.data ?? [];
      setApplicabilityList(list);
    } catch (err) {
      console.error("Error fetching applicability list", err);
      setApplicabilityList([]);
    }
  };

  // ----------------------------
  // UI Handlers
  // ----------------------------
  const handleEdit = (item) => {
    setForm({
      couponId: item.CM_ID,
      couponCode: item.CM_COUPONCODE,
      couponName: item.CM_COUPONNAME,
      cashBackFlag: item.CM_CASHBACK_FLAG,
    });
    setApplicabilityForm((prev) => ({ ...prev, couponId: item.CM_ID }));
    setMessage(`Editing Coupon: ${item.CM_COUPONCODE}`);
    setTimeout(() => {
      couponCodeRef.current?.focus();
    }, 0);
  };

  const handleEditApplicability = async (item) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/routeMaster/routePlaceDetails`,
        { routeCode: item.ROUTECODE },
        getAuthHeaders()
      );

      const places = res.data?.data || [];
      setFromPlaces(places);
      setToPlaces(places);

      const fromPlace = places.find((p) => p.ROUTEPLACE_NAME === item.FROM_PLACE_ID);
      const toPlace = places.find((p) => p.ROUTEPLACE_NAME === item.TO_PLACE_ID);

      setApplicabilityForm((prev) => ({
        ...prev,
        caId: item.CA_ID,
        couponCode: item.COUPON_CODE,
        couponId: item.COUPON_ID,
        routeId: item.ROUTE_ID,
        fromPlaceId: fromPlace ? fromPlace.RP_PLACEID ?? fromPlace.RP_ROUTEID : "",
        toPlaceId: toPlace ? toPlace.RP_PLACEID ?? toPlace.RP_ROUTEID : "",
        startDate: item.START_DATE,
        endDate: item.END_DATE,
        startTime: item.START_TIME,
        endTime: item.END_TIME,
        discountType: item.DISCOUNT_TYPE,
        discountAmount: item.DISCOUNT_AMOUNT,
        maxDiscountLimit: item.MAX_DISCOUNT_LIMIT,
      }));

      setForm((prev) => ({
        ...prev,
        couponCode: item.COUPON_CODE,
      }));

      setTimeout(() => {
        couponCodeInputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error("Error fetching route place details:", error);
    }
  };

  const handleUseForApplicability = (coupon) => {
    setForm({
      couponId: coupon.CM_ID,
      couponCode: coupon.CM_COUPONCODE,
      couponName: coupon.CM_COUPONNAME,
      cashBackFlag: coupon.CM_CASHBACK_FLAG,
    });
    setApplicabilityForm((prev) => ({ ...prev, couponId: coupon.CM_ID }));
    setActiveTab("applicability");
  };

  const handleApplicabilityChange = (e) => {
    const { name, value } = e.target;
    setApplicabilityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (checked ? "Y" : "N") : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.couponCode || !form.couponName) {
      setMessage("⚠️ Please fill in all mandatory fields.");
      return;
    }

    const payload = {
      couponCode: form.couponCode,
      couponName: form.couponName,
      cashBackFlag: form.cashBackFlag,
    };

    const updatePayload = {
      CouponId: form.couponId,
      CouponCode: form.couponCode,
      CouponName: form.couponName,
      CashBackFlag: form.cashBackFlag,
    };

    try {
      let res;
      if (form.couponId) {
        res = await axios.put(`${BASE_URL}/couponMaster/UpdateFields`, updatePayload, getAuthHeaders());
      } else {
        res = await axios.post(`${BASE_URL}/createCouponMaster/insertCoupon`, payload, getAuthHeaders());
      }

      const resultMsg = res?.data?.meta?.message || "✅ Saved successfully.";
      setMessage(resultMsg);

      if (res.data?.meta?.success) {
        setForm({ couponId: "", couponCode: "", couponName: "", cashBackFlag: "N" });
        fetchCoupons();
      }
    } catch (err) {
      console.error("Save Error:", err);
      const errorMsg =
        err?.response?.data?.meta?.message ||
        err?.response?.data?.message ||
        "❌ Error saving coupon.";
      setMessage(errorMsg);
    }
  };

  // Pagination slices for Master
  const paginatedCoupons = couponList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(couponList.length / itemsPerPage);

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="container my-5">
      {/* Header with Icon */}
      <div className="text-center mb-3">
        <h4 className="fw-bold text-black m-0">
          <FaTicketAlt className="me-2 mb-1" style={{ color: "#000" }} />
          Coupon Management
        </h4>
      </div>

      {/* Tabs (pill style) */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        <button
          className={`btn ${activeTab === "master" ? "btn-dark" : "btn-outline-dark"} rounded-pill px-4`}
          onClick={() => setActiveTab("master")}
        >
          Coupon Master
        </button>

        {/* Popular name shown, logic key unchanged */}
        <button
          className={`btn ${activeTab === "applicability" ? "btn-dark" : "btn-outline-dark"} rounded-pill px-4`}
          onClick={() => setActiveTab("applicability")}
        >
          Coupon Usage
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div className="alert alert-info alert-dismissible fade show text-center fw-semibold shadow-sm rounded-pill px-4 py-2">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}

      {/* Coupon Master UI */}
      {activeTab === "master" && (
        <>
          <h5 className="text-center fw-bold text-dark mb-3">🎫 Coupon Master</h5>

          {/* Entry Form */}
          <div className="card shadow border-0 rounded-4 mb-5">
            <div className="card-body p-4 bg-white">
              <form onSubmit={handleSubmit} className="row g-4">
                <div className="col-lg-6">
                  <label htmlFor="couponCode" className="form-label fs-6 text-dark">
                    Coupon Code <span className="text-danger">*</span>
                  </label>
                  <input
                    id="couponCode"
                    type="text"
                    name="couponCode"
                    value={form.couponCode}
                    onChange={handleChange}
                    className="form-control form-control-lg"
                    placeholder="Enter coupon code"
                    ref={couponCodeRef}
                  />
                </div>

                <div className="col-lg-6">
                  <label htmlFor="couponName" className="form-label fs-6 text-dark">
                    Coupon Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="couponName"
                    type="text"
                    name="couponName"
                    value={form.couponName}
                    onChange={handleChange}
                    className="form-control form-control-lg"
                    placeholder="Enter coupon name"
                  />
                </div>

                <div className="col-lg-6 d-flex align-items-center">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input fs-5"
                      id="cashBackFlag"
                      name="cashBackFlag"
                      checked={form.cashBackFlag === "Y"}
                      onChange={handleChange}
                    />
                    <label htmlFor="cashBackFlag" className="form-check-label ms-2 text-dark fs-6">
                      Cashback Applicable
                    </label>
                  </div>
                </div>

                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-dark btn-lg px-5 shadow-sm rounded-pill">
                    {form.couponId ? "Update" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Coupon List Table */}
          {couponList.length > 0 && (
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 bg-white">
                <h6 className="text-center mb-3 fw-bold text-dark">Coupon List</h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr className="text-center">
                        <th>Sl.No</th>
                        <th>Coupon Code</th>
                        <th>Coupon Name</th>
                        <th>Cashback</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCoupons.map((coupon, index) => (
                        <tr key={coupon.CM_ID}>
                          <td className="text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="fw-semibold">{coupon.CM_COUPONCODE}</td>
                          <td>{coupon.CM_COUPONNAME}</td>
                          <td className="text-center">
                            <span className={`badge ${coupon.CM_CASHBACK_FLAG === "Y" ? "bg-success" : "bg-secondary"}`}>
                              {coupon.CM_CASHBACK_FLAG === "Y" ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${coupon.CM_STATUS === "A" ? "bg-success" : "bg-secondary"}`}>
                              {coupon.CM_STATUS === "A" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                          <div className="d-flex flex-wrap justify-content-center gap-2">
                          <button
                          className="btn btn-sm rounded-pill px-3"
                          style={{ backgroundColor: "#1e1e2d", color: "#f8ededff", border: "none" }}
                          onClick={() => handleEdit(coupon)}
                          >
                          ✏️ Edit
                          </button>

                          <button
                          className="btn btn-sm rounded-pill px-3"
                          style={{
                          backgroundColor: coupon.CM_STATUS === "A" ? "#1e1e2d" : "#6c757d",
                          color: "#fff",
                          border: "none",
                          cursor: coupon.CM_STATUS === "A" ? "pointer" : "not-allowed",
                          }}
                          onClick={() => handleUseForApplicability(coupon)}
                          disabled={coupon.CM_STATUS !== "A"}
                          >
                          ➡️ Use for Route
                          </button>

                          <button
                          className="btn btn-sm rounded-pill px-3"
                          style={{
                          backgroundColor: coupon.CM_STATUS === "A" ? "#6c757d" : "#2a5298",
                          color: "#fff",
                          border: "none",
                          }}
                          onClick={(e) => {
                          e.preventDefault();
                          handleToggleStatus(coupon.CM_ID, coupon.CM_STATUS);
                          }}
                          >
                          {coupon.CM_STATUS === "A" ? "Deactivate" : "Activate"}
                          </button>
                          </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Buttons */}
                <div className="d-flex justify-content-center mt-3">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm mx-1 ${currentPage === i + 1 ? "btn-dark" : "btn-outline-dark"} rounded-pill`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Coupon Applicability (renamed visually to Coupon Usage) */}
      {activeTab === "applicability" && (
        <div className="card shadow border-0 rounded-4 p-4">
          <h5 className="fw-bold text-center mb-4 text-dark">📌 Coupon Usage</h5>

          <form className="row g-4" onSubmit={handleApplicabilitySubmit}>
            {/* Coupon Code (readonly) */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                Coupon Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={form.couponCode || ""}
                readOnly
                ref={couponCodeInputRef}
              />
            </div>

            {/* Route No */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                Route No <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-lg"
                name="routeId"
                value={applicabilityForm.routeId}
                onChange={handleRouteChange}
              >
                <option value="">-- Select Route --</option>
                <option value="0">ALL</option>
                {routeList.map((route) => (
                  <option
                    key={route.ROUTEID ?? route.ROUTECODE}
                    value={route.ROUTEID ?? route.ROUTECODE}
                  >
                    {route.ROUTECODE ?? `Route ${route.ROUTEID}`}
                  </option>
                ))}
              </select>
            </div>

            {/* From Place */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                From Place <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-lg"
                name="fromPlaceId"
                value={applicabilityForm.fromPlaceId}
                onChange={handleApplicabilityChange}
              >
                <option value="">-- Select --</option>
                <option value="0">ALL</option>
                {fromPlaces.map((place) => (
                  <option
                    key={place.RP_PLACEID ?? place.RP_ROUTEID}
                    value={place.RP_PLACEID ?? place.RP_ROUTEID}
                  >
                    {place.ROUTEPLACE_NAME}
                  </option>
                ))}
              </select>
            </div>

            {/* To Place */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                To Place <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-lg"
                name="toPlaceId"
                value={applicabilityForm.toPlaceId}
                onChange={handleApplicabilityChange}
              >
                <option value="">-- Select --</option>
                <option value="0">ALL</option>
                {toPlaces.map((place) => (
                  <option
                    key={place.RP_PLACEID ?? place.RP_ROUTEID}
                    value={place.RP_PLACEID ?? place.RP_ROUTEID}
                  >
                    {place.ROUTEPLACE_NAME}
                  </option>
                ))}
              </select>
            </div>

            {/* Start/End Date */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control form-control-lg"
                name="startDate"
                value={applicabilityForm.startDate}
                onChange={handleApplicabilityChange}
              />
            </div>
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                End Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control form-control-lg"
                name="endDate"
                value={applicabilityForm.endDate}
                onChange={handleApplicabilityChange}
              />
            </div>

            {/* Start/End Time */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                Start Time <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                className="form-control form-control-lg"
                name="startTime"
                value={applicabilityForm.startTime}
                onChange={handleApplicabilityChange}
              />
            </div>
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                End Time <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                className="form-control form-control-lg"
                name="endTime"
                value={applicabilityForm.endTime}
                onChange={handleApplicabilityChange}
              />
            </div>

            {/* Discount Type */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                Discount Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-control form-control-lg"
                name="discountType"
                value={applicabilityForm.discountType}
                onChange={handleApplicabilityChange}
              >
                <option value="">Select Discount Type</option>
                <option value="PERCENTAGE">PERCENTAGE</option>
                <option value="LUMPSUM">LUMPSUM</option>
              </select>
            </div>

            {/* Discount Amount */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                Discount Amount <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="discountAmount"
                value={applicabilityForm.discountAmount}
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) handleApplicabilityChange(e);
                }}
              />
            </div>

            {/* Max Discount Limit */}
            <div className="col-lg-6">
              <label className="form-label fs-6 text-dark">
                Max Discount Limit <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="maxDiscountLimit"
                value={applicabilityForm.maxDiscountLimit}
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) handleApplicabilityChange(e);
                }}
              />
            </div>

            {/* Submit */}
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-dark btn-lg px-5 shadow-sm rounded-pill">
                {applicabilityForm.caId ? "Update Applicability" : "Save Applicability"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Applicability LIST */}
      {activeTab === "applicability" && applicabilityList.length > 0 && (
        <div className="card shadow border-0 rounded-4 mt-4">
          <div className="card-body p-4 bg-white">
            <h6 className="text-center mb-3 fw-bold text-dark">Coupon Usage List</h6>
            <div className="table-responsive" style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr className="text-center">
                    <th>Sl.No</th>
                    <th>Coupon Code</th>
                    <th>Coupon Name</th>
                    <th>Cashback</th>
                    <th>Route No</th>
                    <th>From Place</th>
                    <th>To Place</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Discount Type</th>
                    <th>Discount Amount</th>
                    <th>Max Discount Limit</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApplicabilities.map((item, index) => (
                    <tr key={item.CA_ID}>
                      <td className="text-center">
                        {(currentApplicabilityPage - 1) * itemsPerPageApplicability + index + 1}
                      </td>
                      <td className="fw-semibold">{item.COUPON_CODE}</td>
                      <td>{item.COUPON_NAME}</td>
                      <td className="text-center">
                        <span className={`badge ${item.CASHBACK_FLAG === "Y" ? "bg-success" : "bg-secondary"}`}>
                          {item.CASHBACK_FLAG === "Y" ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="text-center">
                        {routeList.find((r) => String(r.ROUTEID) === String(item.ROUTE_ID))?.ROUTECODE ||
                          item.ROUTE_ID}
                      </td>
                      <td>{item.FROM_PLACE_ID}</td>
                      <td>{item.TO_PLACE_ID}</td>
                      <td>{formatDateToDDMMYYYY(item.START_DATE)}</td>
                      <td>{formatDateToDDMMYYYY(item.END_DATE)}</td>
                      <td>{item.START_TIME}</td>
                      <td>{item.END_TIME}</td>
                      <td>{item.DISCOUNT_TYPE}</td>
                      <td>{item.DISCOUNT_AMOUNT}</td>
                      <td>{item.MAX_DISCOUNT_LIMIT}</td>
                      <td className="text-center">
                        <span className={`badge ${item.APPLICABILITY_STATUS === "A" ? "bg-success" : "bg-secondary"}`}>
                          {item.APPLICABILITY_STATUS === "A" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{ backgroundColor: "#1e1e2d", color: "#fff", border: "none" }}
                            onClick={() => handleEditApplicability(item)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: item.APPLICABILITY_STATUS === "A" ? "#6c757d" : "#2a5298",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => handleApplicableToggleStatus(item.CA_ID, item.APPLICABILITY_STATUS)}
                          >
                            {item.APPLICABILITY_STATUS === "A" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Buttons */}
            <div className="d-flex justify-content-center mt-3">
              {Array.from({ length: totalApplicabilityPages }, (_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm mx-1 ${currentApplicabilityPage === i + 1 ? "btn-dark" : "btn-outline-dark"} rounded-pill`}
                  onClick={() => setCurrentApplicabilityPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponScreen;
