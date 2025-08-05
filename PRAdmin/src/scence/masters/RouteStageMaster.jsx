import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import { FaRoute } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import BASE_URL from "../../configAPI";
import Select from "react-select";

const RouteStageMaster = () => {
  const location = useLocation();
  const preSelected = location.state?.preSelected;

  const [activeTab, setActiveTab] = useState("route");
  const [form, setForm] = useState({
    routeCode: preSelected?.routeCode || "",
    startPlace: preSelected?.startPlace || "",
    endPlace: preSelected?.endPlace || "",
    viaPlace: preSelected?.viaPlace || "",
  });
  const [editIndex, setEditIndex] = useState(null);
const stageNoRef = useRef(null);

const [getRouteForm,setGetRouteForm]=useState({
  selectStartPlace:'',
  selectEndPlace:'',
});



  const [stageForm, setStageForm] = useState({
    stageNo: "",
    placeId: "",
    km: "",
    time: "",
    zoneId: "",
        effFromDate: new Date().toISOString().substring(0, 10),
    effToDate: "",
    status:"",
  });

  const [places, setPlaces] = useState([]);
  const [zones, setZones] = useState([]);
  const [stages, setStages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  useEffect(() => {
    fetchPlaces();
    fetchZones();
    if (form.routeCode) fetchStages(form.routeCode);
  }, [form.routeCode]);



  const [matchedRoutes, setMatchedRoutes] = useState([]);

const handleFindRoutes = async () => {
  try {
    console.log(getRouteForm.selectStartPlace," - ",getRouteForm.selectEndPlace);
    const res = await axios.post(
      `${BASE_URL}/routeMaster/searchRoutesByFromTo`,
      {
        startPlace: getRouteForm.selectStartPlace,
        endPlace: getRouteForm.selectEndPlace,
      },
      getAuthHeaders()
    );

    if (res?.data?.length > 0) {
      setMatchedRoutes(res.data);
      setMessage(`✅ Found ${res.data.length} route(s) between selected places.`);
    } else {
      setMatchedRoutes([]);
      setMessage("⚠️ No routes found between selected places.");
    }
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to fetch matching routes.");
  }
};

const handleEditStage = (index) => {
  const stageToEdit = stages[index];

  console.log("Editing stage:", stageToEdit); // Debug check

  setStageForm({
    stageNo: stageToEdit.stageNo ?? "",
    placeId: stageToEdit.placeId ?? "",
    zoneId: stageToEdit.zoneId ?? "",
    km: stageToEdit.km ?? "",
    time: stageToEdit.time ?? "",
    routePlaceId: stageToEdit.routePlaceId ?? "",
    effFromDate:stageToEdit.effFromDate ?? "",
    effToDate:stageToEdit.effToDate ?? "",
  });

  setEditIndex(index);
};


useEffect(() => {
  console.log("Form updated:", stageForm);
}, [stageForm]);
useEffect(() => {
  const handleButtonClick = (e) => {
    if (e.target.tagName === "BUTTON" ||
  e.target.tagName === "A" ||
  e.target.tagName === "INPUT") {
      setMessage("");
    }
  };
  

  document.addEventListener("click", handleButtonClick);

  return () => {
    document.removeEventListener("click", handleButtonClick);
  };
}, []);


useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }
}, [message]);


const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const [updatingId, setUpdatingId] = useState(null);

const toggleZoneStatus = async (routePlaceId, currentStatus) => {
  const newStatus = currentStatus === "A" ? "I" : "A";
  if (!window.confirm(`Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`)) return;

  setUpdatingId(routePlaceId); // show spinner/loading for this item
  try {
    const res = await axios.put(
      `${BASE_URL}/routeMaster/deleteRoutePlaces`,
      {
        routePlaceId,
        status: newStatus,
        modifiedBy: 1,
      },
      getAuthHeaders()
    );
    setMessage(res?.data?.data?.[0]?.RESULT || "Status toggled successfully");

    if (res?.data?.meta?.success) {
      await fetchZones(); // re-fetch updated data
       fetchStages(form.routeCode);
    }
  } catch (err) {
    console.error("Toggle error:", err);
    setMessage("❌ Failed to update status");
  } finally {
    setUpdatingId(null); // clear loading state
  }
};


  const fetchPlaces = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/routeMaster/places`, getAuthHeaders());
      setPlaces(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch places.");
    }
  };

  const fetchZones = async (placeId) => {
  if (!placeId) {
    setZones([]);
    return;
  }

  try {
    const res = await axios.get(
      `${BASE_URL}/zoneMaster/getZonePlacesDropdown`,
      getAuthHeaders()
    );
    setZones(res?.data?.data || []);
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to fetch zones.");
  }
};

const fetchStages = async (routeCode) => {

  console.log("hi");
  try {
    const res = await axios.post(
      `${BASE_URL}/routeMaster/routePlaceDetails`,
      { routeCode },
      getAuthHeaders()
    );

    console.log(JSON.stringify(res.data));

 if (res?.data?.meta?.success) {
  const formattedStages = res.data.data.map((stage) => ({
  stageNo: stage.STAGE,
  placeName: stage.ROUTEPLACE_NAME,
  zoneName: stage.ZONE,
  km: stage.KM,
  time: stage.DURATION,
  placeId: stage.RP_PLACEID,
  zoneId: stage.RP_ZONEID,
  routePlaceId: stage.RP_ID,
  effFromDate:stage.EFF_DATE,
  effToDate:stage.EFF_TO,
  status: stage.STATUS,
}));





  setStages(formattedStages);

      setStages(formattedStages);
    } else {
      setStages([]);
      setMessage("⚠️ " + (res.data?.meta?.message || "No stage data found."));
    }
  } catch (err) {
    console.error("Failed to fetch stage details:", err);
    setMessage("❌ Failed to fetch stage details.");
    setStages([]);
  }
};



  const handleRouteChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleStageChange = async (e) => {
  const { name, value } = e.target;

  setStageForm((prev) => ({
    ...prev,
    [name]: value,
    ...(name === "placeId" && { zoneId: "" }),
  }));

  if (name === "placeId") {
    try {
      const res = await axios.get(
        `${BASE_URL}/zoneMaster/getZonePlacesDropdown?placeId=${value}`,
        getAuthHeaders()
      );
      const zoneList = res?.data?.data;
      setZones(Array.isArray(zoneList) ? zoneList : []);
    } catch (err) {
      console.error("Failed to fetch zones", err);
      setZones([]); // fallback to empty array
    }
  }
};


  const handleGetDetails = async () => {
    if (!form.routeCode.trim()) {
      setMessage("⚠️ Please enter a Route Code.");
      return;
    }

    try {
      setLoading(true);
      const payload = { routeCode: form.routeCode.trim() };
      const res = await axios.post(`${BASE_URL}/routeMaster/getByRouteCode`, payload, getAuthHeaders());
      const data = res?.data?.data;

      if (data) {
        setForm({
          routeCode: form.routeCode.trim(),
          routeId:data.RM_ROUTEID.toString(),
          startPlace: data.RM_STARTPLACEID?.toString() || "",
          endPlace: data.RM_ENDPLACEID?.toString() || "",
          viaPlace: data.RM_VIAPLACEID?.toString() || "",
        });
       
      } else {
        setMessage("⚠️ No route found for this code.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch route details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();

    if (!form.routeCode || !form.startPlace || !form.endPlace ||!form.viaPlace) {
      setMessage("⚠️ All fields are required.");
      return;
    }

    if (form.startPlace === form.endPlace) {
      setMessage("⚠️ Start and End place cannot be the same.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        routeCode: form.routeCode.trim(),
        startPlace: parseInt(form.startPlace),
        endPlace: parseInt(form.endPlace),
        viaPlace: parseInt(form.viaPlace),
      };
      const res = await axios.post(`${BASE_URL}/routeMaster/insert`, payload, getAuthHeaders());
      const msg = res?.data?.meta?.message || "✅ Route inserted successfully.";
      setMessage(msg);
      if (res?.data?.meta?.success) {
        fetchStages(form.routeCode);
        setActiveTab("stage");
      }
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.meta?.message || "❌ Failed to insert route.");
    } finally {
      setLoading(false);
    }
  };

  
const handleStageSubmit = async (e) => {
  e.preventDefault();

  console.log(form.routeCode);
  console.log(stageForm);

const missingFields = [];

if (!form.routeCode) missingFields.push("Route Code");
if (!stageForm.stageNo) missingFields.push("Stage No");
if (stageForm.stageNo === '1') {
  setStageForm((prev) => ({ ...prev, stageNo: 0 }));
} else if (!stageForm.stageNo) {
  setMessage("❌ Stage No is required.");
  return;
}



if (!stageForm.time) missingFields.push("Travel Time");
if (!stageForm.effFromDate ) missingFields.push("Effective From Date");
if (!stageForm.effToDate) missingFields.push("Effective To Date");

if (missingFields.length > 0) {
  setMessage("❌ Please fill: " + missingFields.join(", "));
  return;
}


  try {
    const senddata = { routeCode: form.routeCode };
    const routeCodeIdRes = await axios.post(`${BASE_URL}/routeMaster/getByRouteCode`, senddata, getAuthHeaders());
    const routeId = routeCodeIdRes.data?.data?.RM_ROUTEID;

    if (!routeId) {
      setMessage("❌ Invalid Route Code");
      return;
    }

    const isEditMode = editIndex !== null && !!stageForm.routePlaceId;
   



    const payload = {
      routeId,
      placeId: stageForm.placeId,
      zoneId: stageForm.zoneId,
      stageNo: stageForm.stageNo,
      kms: stageForm.km,
      duration: stageForm.time,
      //routePlaceId: stageForm.placeId,
      routePlaceId: stageForm.routePlaceId,
      stageId:stageForm.stageNo,
      effFromDate:stageForm.effFromDate,
      effToDate:stageForm.effToDate,
    };

    
      var res;



      if(stageForm.routePlaceId){
        res=await axios.post(`${BASE_URL}/routeMaster/routePlacesUpdate`,payload,getAuthHeaders());
      }else{
        res=await axios.post(`${BASE_URL}/routeMaster/insertplaces`,payload,getAuthHeaders());
      }

    

    if (res.data?.meta?.success) {
      setMessage("✅ " + res.data.meta.message);
      setStageForm({ stageNo: "", placeId: "", km: "", time: "", zoneId: "", routePlaceId: "",effFromDate:"",effToDate:"" });
      setEditIndex(null);
      fetchStages(form.routeCode);
    } else {
      setMessage("⚠️ " + (res.data?.meta?.message || "Insertion/Update failed"));
    }
  } catch (err) {
    const message = err.response?.data?.meta?.message || "❌ Error occurred.";
    setMessage(message);
    console.error("Stage submission error:", err);
  }
};





  const getPlaceName = (id) => {
    const place = places.find((p) => p.ID === parseInt(id));
    return place?.NAME?.trim() || "Unknown";
  };

  const getFromToPairs = () => {
    const sorted = [...stages].sort((a, b) => a.STAGE_NO - b.STAGE_NO);
    const pairs = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      pairs.push({
        from: sorted[i].PLACE_NAME,
        to: sorted[i + 1].PLACE_NAME,
        km: sorted[i + 1].KM,
        stageNo: sorted[i + 1].STAGE_NO,
        time: sorted[i + 1].DURATION,
        
      });
    }
    return pairs;
  };
const placeOptions = places.map((p) => ({
  value: p.ID,
  label: p.NAME.trim(),
}));
  return (
    <div className="container my-4">
     <h4 className="text-center fw-bold text-black my-3">
  <FaRoute className="me-2 mb-1" />
  Route & Stage Master
</h4>


      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn ${activeTab === "route" ? "btn-dark" : "btn-outline-dark"} mx-2 px-4 py-2 rounded-pill`}
          onClick={() => setActiveTab("route")}
        >
          Route Master
        </button>
        <button
          className={`btn ${activeTab === "stage" ? "btn-dark" : "btn-outline-dark"} mx-2 px-4 py-2 rounded-pill`}
          onClick={() => setActiveTab("stage")}
          disabled={!form.routeCode}
        >
          Stage Master
        </button>
      </div>

      {message && (
        <div className="alert alert-info alert-dismissible fade show my-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}

      {/* ROUTE MASTER FORM */}
      {activeTab === "route" && (
        
       <form onSubmit={handleRouteSubmit} className="card p-4 shadow border-0 rounded-4 mb-4">
         <h4 className="mt-4 mb-3 text-center text-black fw-bold">
  Route Master
</h4>
  {/* First Row */}
  <div className="row g-3">
    <div className="col-md-6">
      <label className="form-label">Route Code *</label>
      <div className="input-group">
        <input
          type="text"
          name="routeCode"
          value={form.routeCode}
          onChange={handleRouteChange}
          className="form-control"
          required
        />
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={handleGetDetails}
        >
          Get Details
        </button>
      </div>
    </div>

    <div className="col-md-6">
      <label className="form-label">Via *</label>
      <select
        name="viaPlace"
        value={form.viaPlace}
        onChange={handleRouteChange}
        className="form-select"
        required
      >
        <option value="">-- Select Via Place --</option>
        {places.map((p) => (
          <option key={p.ID} value={p.ID}>{p.NAME.trim()}</option>
        ))}
      </select>
    </div>
  </div>

  {/* Second Row */}
  <div className="row g-3 mt-2">
    <div className="col-md-6">
      <label className="form-label">Start Place *</label>
      <select
        name="startPlace"
        value={form.startPlace}
        onChange={handleRouteChange}
        className="form-select"
        required
      >
        <option value="">-- Select Start Place --</option>
        {places.map((p) => (
          <option key={p.ID} value={p.ID}>{p.NAME.trim()}</option>
        ))}
      </select>
    </div>

    <div className="col-md-6">
      <label className="form-label">End Place *</label>
      <select
        name="endPlace"
        value={form.endPlace}
        onChange={handleRouteChange}
        className="form-select"
        required
      >
        <option value="">-- Select End Place --</option>
        {places.map((p) => (
          <option key={p.ID} value={p.ID}>{p.NAME.trim()}</option>
        ))}
      </select>
    </div>
  </div>

  {/* Submit Button */}
  <div className="text-end mt-4">
    <button type="submit" className="btn btn-dark px-4">
      {loading ? "Submitting..." : "Submit Route"}
    </button>
  </div>
</form>
    )}
   {activeTab === "route" && (
  <>

    {/* Route Finder by From & To */}
    <div className="card p-4 shadow border-0 rounded-4 my-4">
      <h5 className="text-center text-black fw-bold mb-3">Search Routes by From & To</h5>
      <div className="row g-3 align-items-end">
        <div className="col-md-5">
          <label className="form-label">From Place *</label>
          <select
            name="selectStartPlace"
            className="form-select"
            value={getRouteForm.selectStartPlace}
         onChange={(e) =>
    setGetRouteForm((prev) => ({ ...prev, selectStartPlace: e.target.value }))
  }
          >
            <option value="">-- Select From --</option>
            {places.map((p) => (
              <option key={p.ID} value={p.ID}>
                {p.NAME.trim()}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-5">
          <label className="form-label">To Place *</label>
          <select
            name="selectEndPlace"
            className="form-select"
            value={getRouteForm.selectEndPlace}
            onChange={(e) =>
    setGetRouteForm((prev) => ({ ...prev, selectEndPlace: e.target.value }))
  }
          >
            <option value="">-- Select To --</option>
            {places.map((p) => (
              <option key={p.ID} value={p.ID}>
                {p.NAME.trim()}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2 text-end">
          <button
            className="btn btn-dark w-100"
             onClick={() => handleFindRoutes()}
          >
            Find Routes
          </button>
        </div>
      </div>
    </div>

    {/* Matching Routes Table */}
    {matchedRoutes.length > 0 && (
      <div className="card p-3 shadow-sm border-0 rounded-4 mt-3">
        <h6 className="fw-bold text-black text-center mb-3">Matching Routes</h6>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Route Code</th>
                <th>Start Place</th>
                <th>End Place</th>
                <th>Via Place</th>
              </tr>
            </thead>
            <tbody>
              {matchedRoutes.map((route, index) => (
                <tr key={index}>
                  <td>{route.RM_ROUTECODE}</td>
                  <td>{route.FROMPLACE}</td>
                  <td>{route.TOPLACE}</td>
                  <td>{route.VIAPLACE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
)}



      {/* STAGE MASTER FORM */}
      {activeTab === "stage" && form.routeCode && (
        <>
          <h5 className="mt-4 mb-3 text-center text-black fw-bold">
  Stage Master
</h5>


<div className="bg-light p-3 rounded-3 shadow-sm border mb-4">
  <div className="row">
    <div className="col-md-6 mb-2 text-center">
      <strong className="text-secondary">Route Code:</strong> {form.routeCode}
    </div>
     <div className="col-md-6 text-center">
      <strong className="text-secondary">Via Place:</strong> {getPlaceName(form.viaPlace)}
    </div>
    <div className="col-md-6 mb-2 text-center">
      <strong className="text-secondary">Start Place:</strong> {getPlaceName(form.startPlace)}
    </div>
    <div className="col-md-6 mb-2 text-center">
      <strong className="text-secondary">End Place:</strong> {getPlaceName(form.endPlace)}
    </div>
   
  </div>
</div>


<form onSubmit={handleStageSubmit} className="card p-3 shadow-sm border border-dark rounded-4 mb-3 bg-white">
  <div className="row g-3">

    {/* Stage No */}
    <div className="col-md-3">
      <label className="form-label fw-semibold text-black small">Stage No <span className="text-danger">*</span></label>
      <input
        type="number"
        name="stageNo"
        value={stageForm.stageNo}
        onChange={handleStageChange}
        className="form-control form-control-sm border-dark text-black bg-white"
        required
        placeholder="e.g., 1"
      />
    </div>

    {/* Place */}
    <div className="col-md-3">
      <label className="form-label fw-semibold text-black small">Place <span className="text-danger">*</span></label>
        <Select
    options={placeOptions}
    value={placeOptions.find((opt) => opt.value === stageForm.placeId) || null}
    onChange={(selectedOption) =>
      setStageForm((prev) => ({ ...prev, placeId: selectedOption?.value || "" }))
    }
    placeholder="Type or select a place"
    isClearable
    classNamePrefix="react-select"
  />
    </div>

    {/* Zone */}
   <div className="col-md-3">
  <label className="form-label fw-semibold text-black small">Zone</label>
  <select
    name="zoneId"
    value={stageForm.zoneId}
    onChange={handleStageChange}
    className="form-select form-select-sm border-dark text-black bg-white"
  >
    <option value="">-- Select Zone --</option>
    {zones.map((z) => (
      <option key={z.ZONE_ID} value={z.ZONE_ID}>
        {z.ZONENAME?.trim()}
      </option>
    ))}
  </select>
</div>


    {/* KM */}
    <div className="col-md-3">
      <label className="form-label fw-semibold text-black small">Distance (KM) <span className="text-danger">*</span></label>
      <input
        type="number"
        name="km"
        value={stageForm.km}
        onChange={handleStageChange}
        className="form-control form-control-sm border-dark text-black bg-white"
        required
        step="0.1"
        placeholder="e.g., 12.5"
      />
    </div>

    {/* Time */}
    <div className="col-md-3">
      <label className="form-label fw-semibold text-black small">Travel Time <span className="text-danger">*</span></label>
      <input
        type="time"
        name="time"
        value={stageForm.time}
        onChange={handleStageChange}
        className="form-control form-control-sm border-dark text-black bg-white"
        required
      />
    </div>

    {/* From Date */}
    <div className="col-md-4">
      <label htmlFor="effFromDate" className="form-label fw-semibold text-black small">Effective From<span className="text-danger">*</span></label>
      <input
        type="date"
        id="effFromDate"
        name="effFromDate"
        value={stageForm.effFromDate}
        onChange={handleStageChange}
        className="form-control form-control-sm border-dark text-black bg-white"
      />
    </div>

    {/* To Date */}
   <div className="col-md-4">
  <label htmlFor="effToDate" className="form-label fw-semibold text-black small">
    Effective To <span className="text-danger">*</span>
  </label>
  <div className="input-group">
    <input
      type="date"
      id="effToDate"
      name="effToDate"
      value={stageForm.effToDate}
      onChange={handleStageChange}
      className="form-control form-control-sm border-dark text-black bg-white"
    />
    <button
      type="button"
      className={`btn btn-sm ${stageForm.effToDate === "2099-12-31" ? "btn-dark" : "btn-outline-dark"}`}
      onClick={() =>
        setStageForm((prev) => ({
          ...prev,
          effToDate: prev.effToDate === "2099-12-31" ? "" : "2099-12-31",
        }))
      }
      title="till last* 31-12-2099"
    >
      ✔️
    </button>
  </div>
</div>


    {/* Submit */}
    <div className="col-12 text-end mt-3">
      <button type="submit" className="btn btn-dark btn-sm px-4 shadow-sm rounded-pill">
        Add Stage
      </button>
    </div>
  </div>
</form>

         {stages.length > 0 ? (
  <div className="table-responsive">
    <table className="table table-bordered table-hover rounded-3 shadow-sm">
      <thead className="table-light">
        <tr>
         
          <th>Place Name</th>
          <th>Zone Name</th>
          <th>KM</th>
          <th>Stage No</th>
          <th>Duration</th>
          <th>eff from</th>
          <th>eff To</th>
        </tr>
      </thead>
     <tbody>
  {stages.map((stage, index) => (
    <tr key={index}>
      
      <td>{stage.placeName || stage.placeId}</td>
      <td>{stage.zoneName || stage.zoneId}</td>
      <td>{stage.km}</td>
      <td>{stage.stageNo}</td>
      <td>{stage.time || "—"}</td>
      <td>{stage.effFromDate}</td>
       <td>{stage.effToDate}</td>
      <td>
        <button
  className="btn btn-sm me-2"
  style={{ backgroundColor: "#1e1e2d", color: "#fff" }}
  onClick={() => handleEditStage(index)}
>
  Edit
</button>

       <button
  className="btn btn-sm"
  style={{
    backgroundColor: stage.status === "A" ? "#6c757d" : "#2a5298",
    color: "#fff",
    opacity: updatingId === stage.routePlaceId ? 0.6 : 1,
    pointerEvents: updatingId === stage.routePlaceId ? "none" : "auto",
  }}
  onClick={() => toggleZoneStatus(stage.routePlaceId, stage.status)}
>
  {updatingId === stage.routePlaceId ? "Updating..." :
    stage.status === "A" ? "Deactivate" : "Activate"}
</button>

        
      </td>
    </tr>
  ))}
</tbody>

    </table>
  </div>
) : (
  <p className="text-muted">No stages found for this route.</p>
)}


          
        </>
      )}
    </div>
  );
};

export default RouteStageMaster;