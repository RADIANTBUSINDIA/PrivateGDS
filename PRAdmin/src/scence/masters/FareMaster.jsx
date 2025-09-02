import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";
import Select from 'react-select';



const FareMaster = () => {
  const [currentPage, setCurrentPage] = useState("route");

  const [fareForm, setFareForm] = useState({
    fareId: null,
    routeCode: "",
    classId: "",
    seatType: "",
    effFromDate: "",
    effToDate: "",
  });
  

  const [routes, setRoutes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [seatTypes] = useState([
    { id: 1, name: "SEATER" },
    { id: 2, name: "SLEEPER" },
    { id: 3, name: "SLEEPER WITH SEATER" },
  ]);

  const [routeStops, setRouteStops] = useState([]);
  const [stagePairs, setStagePairs] = useState([]);
  const [message, setMessage] = useState("");

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchRoutes();
    fetchClasses();

    const today = new Date().toISOString().split("T")[0];
    setFareForm((prev) => ({
      ...prev,
      effFromDate: today,
      effToDate: today,
    }));
  }, []);

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchRoutes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fareMaster/getRouteCodeDropdown`, getAuthHeaders());
      const routesData = res.data.data.map((r) => ({
        routeId: r.ROUTEID,
        routeCode: r.ROUTECODE,
      }));
      setRoutes(routesData);
    } catch (err) {
      console.error("❌ Failed to fetch routes:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fareMaster/getClassDropDN`, getAuthHeaders());
      const formattedClasses = res.data.data.map((c) => ({
        classId: c.CLASSID,
        className: c.CLASSNAME,
      }));
      setClasses(formattedClasses);
    } catch (err) {
      console.error("❌ Failed to fetch classes:", err);
    }
  };

  const fetchRouteStops = async (routeCode = "") => {
    if (!routeCode) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/routeMaster/routePlaceDetails`,
        { routeCode },
        getAuthHeaders()
      );
      setRouteStops(res.data?.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch route stops:", err);
      setRouteStops([]);
    }
  };

const fetchStagePairsFromDB = async (routeCode) => {
  const selectedRoute = routes.find((r) => r.routeCode === routeCode);
  if (!selectedRoute) return;

  try {
    const res = await axios.post(
      `${BASE_URL}/fareMaster/fromandToplaceCombns`,
      {
        routeId: selectedRoute.routeId,
        classId: fareForm.classId,
        effFromDate: fareForm.effFromDate,
        effToDate: fareForm.effToDate
      },
      getAuthHeaders()
    );

    const stagePairsFromDB = res.data.data.map((pair) => ({
      fromPlaceId: pair.FROM_PLACEID,
      toPlaceId: pair.TO_PLACEID,
      fromPlaceName: pair.FROM_PLACE_NAME,
      toPlaceName: pair.TO_PLACE_NAME,
      className: pair.CLASSNAME,

      seaterFare: pair.SEATER_FARE ?? 0,
      singleSleeperLowerFare: pair.SL_SLEEPER_LOWER ?? 0,
      singleSleeperUpperFare: pair.SL_SLEEPER_UPPER ?? 0,
      doubleSleeperLowerFare: pair.DL_SLEEPER_LOWER ?? 0,
      doubleSleeperUpperFare: pair.DL_SLEEPER_UPPER ?? 0,

      lastSeaterFare: pair.LAST_SEATER_FARE ?? 0,
      lastSleeperLowerFare: pair.LAST_SL_SLEEPER_LOWER ?? 0,
      lastSleeperUpperFare: pair.LAST_SL_SLEEPER_UPPER ?? 0,

      // festivalWeekendSeaterFare: pair.FEST_SEATER_FARE ?? 0,
      // festivalWeekendSleeperLowerFare: pair.FEST_SLEEPER_LOWER ?? 0,
      // festivalWeekendSleeperUpperFare: pair.FEST_SLEEPER_UPPER ?? 0,

      fareId: pair.FARE_ID ?? null,
      effFromDate: pair.FM_EFFECTIVE_FROM,
      effToDate: pair.FM_EFFECTIVE_TO,
      status: pair.FM_STATUS,
    }));

    setStagePairs(stagePairsFromDB);
  } catch (err) {
    console.error("❌ Failed to fetch stage combinations with fare data:", err);
    setStagePairs([]);
  }
};

const formatDateDMY = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};



const handleSave = async () => {
  setMessage("");

  const selectedRoute = routes.find(r => r.routeCode === fareForm.routeCode);
  if (!selectedRoute) {
    setMessage("❗ Route not found.");
    return;
  }

  const commonData = {
    routeId: selectedRoute.routeId,
    classId: fareForm.classId,
    effFromDate: fareForm.effFromDate,
    effToDate: fareForm.effToDate,
  };

  const resultMessages = [];
  let insertCount = 0;
  let updateCount = 0;
  let errorMessages = [];

  try {
    for (const row of stagePairs) {
      const isUpdate = !!row.fareId;

      const payload = {
        ...commonData,
        seaterFare: row.seaterFare ?? 0,
        singleSleeperLowerFare: row.singleSleeperLowerFare ?? 0,
        singleSleeperUpperFare: row.singleSleeperUpperFare ?? 0,
        doubleSleeperLowerFare: row.doubleSleeperLowerFare ?? 0,
        doubleSleeperUpperFare: row.doubleSleeperUpperFare ?? 0,
        lastSeaterFare: row.lastSeaterFare ?? 0,
        lastSleeperLowerFare: row.lastSleeperLowerFare ?? 0,
        lastSleeperUpperFare: row.lastSleeperUpperFare ?? 0,
        // festivalWeekendSeaterFare: row.festivalWeekendSeaterFare ?? 0,
        // festivalWeekendSleeperLowerFare: row.festivalWeekendSleeperLowerFare ?? 0,
        // festivalWeekendSleeperUpperFare: row.festivalWeekendSleeperUpperFare ?? 0,
      };

      try {
        if (isUpdate) {
          payload.fareId = row.fareId;

          await axios.post(`${BASE_URL}/fareMaster/fareUpdate`, payload, getAuthHeaders());
          updateCount++;
        } else {
          payload.fromPlaceId = row.fromPlaceId;
          payload.toPlaceId = row.toPlaceId;

          await axios.post(`${BASE_URL}/fareMaster/fareInsert`, payload, getAuthHeaders());
          insertCount++;
        }
      } catch (innerErr) {
        console.error(`❌ Failed to process fare from ${row.fromPlaceName} to ${row.toPlaceName}:`, innerErr);
        errorMessages.push(`❌ Failed fare: ${row.fromPlaceName} → ${row.toPlaceName}`);
      }
    }

    // Add summary messages once
    if (updateCount > 0) resultMessages.push(`✅  FARE UPDATED SUCCEFULLY`);
    if (insertCount > 0) resultMessages.push(`✅  FARE INSERTED SUCCEFULLY.`);
    if (errorMessages.length > 0) resultMessages.push(...errorMessages);
    if (updateCount === 0 && insertCount === 0 && errorMessages.length === 0) {
      resultMessages.push("ℹ️ No changes were made.");
    }

    setMessage(resultMessages.join("\n"));
    await fetchStagePairsFromDB(fareForm.routeCode);
  } catch (error) {
    console.error("❌ Error saving fare records:", error.response?.data || error.message, error);
    setMessage("❌ An unexpected error occurred while saving fare records.");
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFareForm((prev) => ({ ...prev, [name]: value }));
    if (name === "routeCode") fetchRouteStops(value);
    setMessage(""); // Clear message on field change
  };

  const handleRouteClick = () => {
    setMessage(""); // Clear message

    const { routeCode, seatType, classId, effFromDate, effToDate } = fareForm;

    if (!routeCode || !seatType || !classId || !effFromDate || !effToDate) {
      setMessage("PLEASE SELECT ALL REQUIRED DATA ");
      return;
    }

    if (effFromDate > effToDate) {
      setMessage("❗ Effective From Date cannot be later than Effective To Date");
      return;
    }

    fetchStagePairsFromDB(routeCode);
    setCurrentPage("view");
  };

  const handleTopNavigation = (page) => {
    setMessage(""); // Clear message
    if (page === "view") handleRouteClick();
    else setCurrentPage("route");
  };

  const routeOptions = routes.map((r) => ({
  value: r.routeCode,
  label: r.routeCode
}));

  return (
    <div className="container my-4">
      <div className="card border-0 rounded-4 shadow mb-4">
        <div className="card-body">
          <h1 className="text-center mb-4"> Fare Master</h1>

          <div className="d-flex justify-content-center mb-4">
            <button
              className={`btn ${currentPage === "route" ? "btn-dark" : "btn-outline-dark"} mx-2 px-4 py-2 rounded-pill`}
              onClick={() => handleTopNavigation("route")}
            >
              Route
            </button>
            <button
              className={`btn ${currentPage === "view" ? "btn-dark" : "btn-outline-dark"} mx-2 px-4 py-2 rounded-pill`}
              onClick={() => handleTopNavigation("view")}
            >
              View
            </button>
          </div>

          {/* Alert Message */}
          {message && (
            <div className="alert alert-warning alert-dismissible fade show text-center" role="alert">
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {currentPage === "route" && (
            <form className="row g-3">
              <div className="col-md-4">
  <label htmlFor="routeCode" className="form-label">Route Code</label>
  <Select
    id="routeCode"
    name="routeCode"
    options={routeOptions}
    value={routeOptions.find(option => option.value === fareForm.routeCode)}
    onChange={(selectedOption) =>
      handleChange({ target: { name: 'routeCode', value: selectedOption?.value || '' } })
    }
    className="basic-single"
    classNamePrefix="select"
    isClearable
    placeholder="-- Select Route --"
  />
</div>

              <div className="col-md-4">
                <label htmlFor="classId" className="form-label">Class</label>
                <select
                  name="classId"
                  value={fareForm.classId}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="seatType" className="form-label">Seat Type</label>
                <select
                  name="seatType"
                  value={fareForm.seatType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select Seat Type --</option>
                  {seatTypes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="effFromDate" className="form-label small text-black fw-semibold">
                  Effective From <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="effFromDate"
                  name="effFromDate"
                  value={fareForm.effFromDate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="effToDate" className="form-label small text-black fw-semibold">
                  Effective To <span className="text-danger">*</span>
                </label>

                <div className="d-flex align-items-center">
                  <input
                    type="date"
                    id="effToDate"
                    name="effToDate"
                    value={fareForm.effToDate}
                    onChange={handleChange}
                    className="form-control"
                  />
                  <button
                    type="button"
                    className={`btn btn-sm ms-2 ${fareForm.effToDate === "2099-12-31" ? "btn-dark" : "btn-outline-dark"}`}
                    onClick={() =>
                      setFareForm((prev) => ({
                        ...prev,
                        effToDate: prev.effToDate === "2099-12-31" ? "" : "2099-12-31",
                      }))
                    }
                    title="Till Last Date: 31-12-2099"
                  >
                    ✔️
                  </button>
                </div>
              </div>

              {routeStops.length > 0 && (
                <div className="col-12">
                  <div className="table-responsive mt-3">
                    <table className="table table-bordered text-center">
                      <thead className="table-light">
                        <tr>
                          <th>Stage</th>
                          <th>Place</th>
                          <th>KM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routeStops.map((stop, index) => (
                          <tr key={index}>
                            <td>{stop.STAGE}</td>
                            <td>{stop.ROUTEPLACE_NAME}</td>
                            <td>{stop.KM}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </form>
          )}

          {currentPage === "view" && (
            <>
              <h3 className="mt-3 d-flex justify-content-center">Fare Matrix</h3>

              <div className="mb-2 border p-3 rounded bg-light">
  <div className="row">
    <div className="col-md-4"><strong>Route Code:</strong> {fareForm.routeCode}</div>
<div className="col-md-4">
  <strong>Class:</strong>{" "}
  {classes.find(c => c.classId.toString() === fareForm.classId)?.className || ""}
</div>

    <div className="col-md-4">
      <strong>Seat Type:</strong> {seatTypes.find(s => s.id.toString() === fareForm.seatType)?.name || fareForm.seatType}
    </div>
    <div className="col-md-4">
      <strong>Effective From:</strong> {fareForm.effFromDate}
    </div>
    <div className="col-md-4 mt-2">
      <strong>Effective To:</strong> {fareForm.effToDate}
    </div>
  </div>
</div>


              <div className="table-responsive mt-3">
                <table className="table table-bordered text-center">
                  <thead className="table-light">
  <tr>
    <th>From</th>
    <th>To</th>
    <th>EffectiveFrom date</th>
    <th>EffectiveTo date</th>
    <th>ClassOfService </th>
    {fareForm.seatType === "1" && (
      <>
        <th>Seater Fare</th>
        <th>Last Row Seater Fare</th>
      </>
    )}
    {fareForm.seatType === "2" && (
      <>
        <th>Sleeper Lower</th>
        <th>Sleeper Upper</th>
        <th>Double Sleeper Lower</th>
        <th>Double Sleeper Upper</th>
        <th>Last Sleeper Lower</th>
        <th>Last Sleeper Upper</th>
      </>
    )}
    {fareForm.seatType === "3" && (
      <>
        <th>Seater Fare</th>
        <th>Last Row Seater Fare</th>
        <th>Sleeper Lower</th>
        <th>Sleeper Upper</th>
        <th>Double Sleeper Lower</th>
        <th>Double Sleeper Upper</th>
        <th>Last Sleeper Lower</th>
        <th>Last Sleeper Upper</th>
      </>
    )}
  </tr>
</thead>

   <tbody>
  {stagePairs.map((pair, idx) => (
    <tr key={idx}>
      <td>{pair.fromPlaceName}</td>
      <td>{pair.toPlaceName}</td>
      <td>{formatDateDMY(pair.effFromDate)}</td>
      <td>{formatDateDMY(pair.effToDate)}</td>
      <td>{pair.className}</td>

      {(fareForm.seatType === "1" || fareForm.seatType === "3") && (
        <>
          <td>
            <input
              type="text"
              className="form-control form-control-sm no-spinner"
              value={pair.seaterFare ?? ""}
              onChange={(e) => {
                const input = e.target.value;
      if (/^\d*$/.test(input)) {
                const updated = [...stagePairs];
                updated[idx].seaterFare = input;
                setStagePairs(updated);
      }
              }}
            />
          </td>
          <td>
            <input
              type="text"
              className="form-control form-control-sm"
              value={pair.lastSeaterFare ?? ""}
              onChange={(e) => {
                const input = e.target.value;
      if (/^\d*$/.test(input)) {
                const updated = [...stagePairs];
                updated[idx].lastSeaterFare = input;
                setStagePairs(updated);
      }
              }}
            />
          </td>
        </>
      )}

      {(fareForm.seatType === "2" || fareForm.seatType === "3") && (
        <>
          <td>
            <input
              type="text"
              className="form-control form-control-sm"
              value={pair.singleSleeperLowerFare ?? ""}
              onChange={(e) => {
                const input = e.target.value;
      if (/^\d*$/.test(input)) {
                const updated = [...stagePairs];
                updated[idx].singleSleeperLowerFare =input;
                setStagePairs(updated);
      }
              }}
            />
          </td>
          <td>
            <input
              type="text"
              className="form-control form-control-sm"
              value={pair.singleSleeperUpperFare ?? ""}
              onChange={(e) => {
                const input = e.target.value;
      if (/^\d*$/.test(input)) {
                const updated = [...stagePairs];
                updated[idx].singleSleeperUpperFare = input;
                setStagePairs(updated);
      }
              }}
            />
          </td>
          <td>
            <input
              type="text"
              className="form-control form-control-sm"
              value={pair.doubleSleeperLowerFare ?? ""}
              onChange={(e) => {
                const input = e.target.value;
      if (/^\d*$/.test(input)) {
                const updated = [...stagePairs];
                updated[idx].doubleSleeperLowerFare = input;
                setStagePairs(updated);
      }
              }}
            />
          </td>
          <td>
            <input
              type="text"
              className="form-control form-control-sm"
              value={pair.doubleSleeperUpperFare ?? ""}
              onChange={(e) => {
                const input = e.target.value;
      if (/^\d*$/.test(input)) {
                const updated = [...stagePairs];
                updated[idx].doubleSleeperUpperFare = input;
                setStagePairs(updated);
      }
              }}
            />
          </td>
          <td>
  <input
    type="text"
    className="form-control form-control-sm"
    value={pair.lastSleeperLowerFare ?? ""}
    onChange={(e) => {
      const input = e.target.value;
      if (/^\d*$/.test(input)) { 
        const updated = [...stagePairs];
        updated[idx].lastSleeperLowerFare = input;
        setStagePairs(updated);
      }
    }}
  />
</td>

          <td>
            <input
              type="text"
              className="form-control form-control-sm"
              value={pair.lastSleeperUpperFare ?? ""}
              onChange={(e) => {
                const input = e.target.value;
      if (/^\d*$/.test(input)) { 
                const updated = [...stagePairs];
                updated[idx].lastSleeperUpperFare = input;
                setStagePairs(updated);
      }
              }}
            />
          </td>
        </>
      )}
    </tr>
  ))}
</tbody>

                </table>
              </div>

              <div className="text-end mt-3 d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setMessage("");
                    setCurrentPage("route");
                  }}
                >
                  ⬅ Back
                </button>
                <button
  className="btn btn-secondary"
  onClick={handleSave}
>
  💾 Insert/Update
</button>


              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FareMaster;
