import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import { FaRoute } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import BASE_URL from "../../configAPI";

const RouteStageMaster = () => {
  const location = useLocation();
  const preSelected = location.state?.preSelected;

  const [activeTab, setActiveTab] = useState("route");
  const [form, setForm] = useState({
    routeCode: preSelected?.routeCode || "",
    startPlace: preSelected?.startPlace || "",
    endPlace: preSelected?.endPlace || "",
  });
  const [editIndex, setEditIndex] = useState(null);
const stageNoRef = useRef(null);


  const [stageForm, setStageForm] = useState({
    stageNo: "",
    placeId: "",
    km: "",
    time: "",
    zoneId: "",
  });

  const [places, setPlaces] = useState([]);
  const [zones, setZones] = useState([]);
  const [stages, setStages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchPlaces();
    fetchZones();
    if (form.routeCode) fetchStages(form.routeCode);
  }, [form.routeCode]);
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
  });

  setEditIndex(index);
};


useEffect(() => {
  console.log("Form updated:", stageForm);
}, [stageForm]);




const handleDeleteStage = async (index) => {
  const stageToDelete = stages[index];

  try {
    const res = await axios.post(
      `${BASE_URL}/routeMaster/deleteRouteStage`,
      {
        routeCode: form.routeCode,
        stageNo: stageToDelete.stageNo,
      },
      authHeaders
    );

    if (res?.data?.meta?.success) {
      const updatedStages = [...stages];
      updatedStages.splice(index, 1);
      setStages(updatedStages);
    } else {
      alert("Failed to delete stage: " + res.data?.meta?.message);
    }
  } catch (err) {
    console.error("❌ Error deleting stage:", err);
    alert("Server error while deleting stage");
  }
};


  const fetchPlaces = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/routeMaster/places`, authHeaders);
      setPlaces(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch places.");
    }
  };

  const fetchZones = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/zoneMaster/getZonePlacesDropdown`, authHeaders);
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
      authHeaders
    );

    console.log(JSON.stringify(res.data));

 if (res?.data?.meta?.success) {
  const formattedStages = res.data.data.map((stage) => ({
  stageNo: stage.STAGE,
  placeName: stage.ROUTEPLACE_NAME,
  zoneName: stage.ZONE,
  km: stage.KM,
  time: stage.DURATION,
  placeId: stage.PLACEID,
  zoneId: stage.ZONEID,
  routePlaceId: stage.ROUTEPLACE_ID,
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

  const handleStageChange = (e) => {
    const { name, value } = e.target;
    setStageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetDetails = async () => {
    if (!form.routeCode.trim()) {
      setMessage("⚠️ Please enter a Route Code.");
      return;
    }

    try {
      setLoading(true);
      const payload = { routeCode: form.routeCode.trim() };
      const res = await axios.post(`${BASE_URL}/routeMaster/getByRouteCode`, payload, authHeaders);
      const data = res?.data?.data;

      if (data) {
        setForm({
          routeCode: form.routeCode.trim(),
          routeId:data.RM_ROUTEID.toString(),
          startPlace: data.RM_STARTPLACEID?.toString() || "",
          endPlace: data.RM_ENDPLACEID?.toString() || "",
        });
       // setMessage("✅ Route details fetched successfully.");
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

    if (!form.routeCode || !form.startPlace || !form.endPlace) {
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
      };
      const res = await axios.post(`${BASE_URL}/routeMaster/insert`, payload, authHeaders);
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

  if (!form.routeCode || !stageForm.zoneId || !stageForm.stageNo || !stageForm.km || !stageForm.time) {
    setMessage("❌ Please fill all required fields.");
    return;
  }

  try {
    const senddata = { routeCode: form.routeCode };
    const routeCodeIdRes = await axios.post(`${BASE_URL}/routeMaster/getByRouteCode`, senddata, authHeaders);
    const routeId = routeCodeIdRes.data?.data?.RM_ROUTEID;

    if (!routeId) {
      setMessage("❌ Invalid Route Code");
      return;
    }

    const placeIdForStage = stageForm.stageNo === 1 ? form.startPlace : stageForm.placeId;

    if (!placeIdForStage) {
      setMessage("❌ Place is missing for this stage.");
      return;
    }

    const payload = {
      routeId: routeId,
      placeId: placeIdForStage,
      zoneId: stageForm.zoneId,
      stageNo: stageForm.stageNo,
      kms: stageForm.km,
      duration: stageForm.time,
    };

    if (editIndex !== null && stageForm.routePlaceId) {
  payload.routePlaceId = stageForm.routePlaceId;
}
   

    const endpoint =
      editIndex !== null && stageForm.routePlaceId
        ? `${BASE_URL}/routeMaster/routePlacesUpdate`
        : `${BASE_URL}/routeMaster/insertplaces`;

    const res = await axios.post(endpoint, payload, authHeaders);

    if (res.data?.meta?.success) {
      setMessage("✅ " + res.data.meta.message);
      setStageForm({ stageNo: "", placeId: "", km: "", time: "", zoneId: "", routePlaceId: "" });
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

  return (
    <div className="container my-4">
      <h4><FaRoute className="me-2" />Route & Stage Master</h4>

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
          <div className="row g-3">
            <div className="col-md-4">
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
            <div className="col-md-4">
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
            <div className="col-md-4">
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
            <div className="col-12 text-end mt-3">   
              <button type="submit" className="btn btn-dark px-4">
                {loading ? "Submitting..." : "Submit Route"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STAGE MASTER FORM */}
      {activeTab === "stage" && form.routeCode && (
        <>
          <h5 className="mt-4 mb-2">Stage Master</h5>
          <p>
            <strong>Route Code:</strong> {form.routeCode} &nbsp;&nbsp;
            <strong>Start:</strong> {getPlaceName(form.startPlace)} &nbsp;&nbsp;
            <strong>End:</strong> {getPlaceName(form.endPlace)}
          </p>

          <form onSubmit={handleStageSubmit} className="card p-4 shadow-sm border-0 rounded-4 mb-4">
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Stage No *</label>
                <input
                  type="number"
                  name="stageNo"
                  value={stageForm.stageNo}
                  onChange={handleStageChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Place *</label>
               <select
  name="placeId"
  value={stageForm.placeId}
  onChange={handleStageChange}
  className="form-select"
  required
>
  <option value="">-- Select Place --</option>
  {places.map((p) => (
    <option key={p.ID} value={p.ID}>
      {p.NAME.trim()}
    </option>
  ))}
</select>


                
              </div>

              <div className="col-md-3">
                <label className="form-label">Zone *</label>
                <select
  name="zoneId"
  value={stageForm.zoneId}
  onChange={handleStageChange}
  className="form-select"
  required
>
  <option value="">-- Select Zone --</option>
  {zones.map((z) => (
    <option key={z.ZONE_ID} value={z.ZONE_ID}>
      {z.ZONENAME?.trim()}
    </option>
  ))}
</select>


              </div>

              <div className="col-md-2">
                <label className="form-label">KM *</label>
                <input
                  type="number"
                  name="km"
                  value={stageForm.km}
                  onChange={handleStageChange}
                  className="form-control"
                  required
                  step="0.1"
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Time *</label>
                <input
                  type="time"
                  name="time"
                  value={stageForm.time}
                  onChange={handleStageChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-12 text-end mt-3">
                <button type="submit" className="btn btn-success px-4">
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
          <th>#</th>
          <th>Place Name</th>
          <th>Zone Name</th>
          <th>KM</th>
          <th>Stage No</th>
          <th>Duration</th>
        </tr>
      </thead>
     <tbody>
  {stages.map((stage, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{stage.placeName || stage.placeId}</td>
      <td>{stage.zoneName || stage.zoneId}</td>
      <td>{stage.km}</td>
      <td>{stage.stageNo}</td>
      <td>{stage.time || "—"}</td>
      <td>
        <button
          className="btn btn-sm btn-primary me-2"
          onClick={() => handleEditStage(index)}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleDeleteStage(index)}
        >
          Delete
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
