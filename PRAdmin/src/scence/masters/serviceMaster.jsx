import axios from "axios";
import Select from "react-select";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../configAPI";

const ServiceMaster = () => {
  const [activeScreen, setActiveScreen] = useState("serviceMaster");

  const screens = [
    "serviceMaster",
    "serviceEnroute",
    "pickupPoints",
    "searchTrips",
  ];

  const toggleScreen = () => {
    setActiveScreen((prev) => {
      const currentIndex = screens.indexOf(prev);
      const nextIndex = (currentIndex + 1) % screens.length;
      return screens[nextIndex];
    });
  };

  const [form, setForm] = useState({
    serviceId: "",
    tripCode: "",
    routeId: "",
    fromPlaceId: "",
    toPlaceId: "",
    viaPlace: "",
    arivalDay: "",
    departureTime: "",
    arivalTime: "",
    fleetId: "",
    layoutId: "",
    journeyHour: "",
    serviceType: "",
    operationdays: "",
    classId: "",
    introductionDate: "",
    withdrawalDate: "",
    totalJourneyDistance: "",
    seatFareEnble:"",
    spId:"",
  });

  const [message, setMessage] = useState("");
  const tirpCodeInput = useRef(null);
  const servicePickupInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [fleetList, setFleetList] = useState([]);
  const [layoutList, setLayoutList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [routeList, setRouteList] = useState([]);
  const [placeList, setPlaceList] = useState([]);
  const [spList, setSpList] = useState([]);
  const [searchPlaceList, setSearchPlaceList] = useState([]);
  const [serviceEnrouteList, setServiceEnrouteList] = useState([]);
  const [searchTripList, setSearchTripList] = useState([]);
  const [insertedServiceEnrouteList, setInsertedServiceEnrouteList] = useState(
    []
  );
  const skipPlaceSetRef = useRef(true);
  const navigate = useNavigate();
  const [servicePlace, setServicePlace] = useState([]);
  const [serviceZone, setServiceZone] = useState([]);
  const [servicePickup, setServicePickup] = useState([]);
  const [servicePickupPoints, setServicePickupPoints] = useState([]);
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "routeId") {
      setForm((prev) => ({ ...prev, routeId: value }));
      return;
    }

    if (name === "departureTime" || name === "arivalTime") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 4) {
        const hours = parseInt(digitsOnly.slice(0, 2), 10);
        const minutes = parseInt(digitsOnly.slice(2, 4), 10);
        if (hours > 23 || minutes > 59) {
          setMessage(
            "Invalid time. Please enter time in 24-hour format (HHMM)."
          );
          return;
        }
        updatedValue = `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2, 4)}`;
      } else {
        updatedValue = digitsOnly;
      }
    }

    if (name === "operationdays") {
      updatedValue = value.toUpperCase().replace(/[^YN]/gi, "").slice(0, 7);
    }

    setForm((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    const { departureTime, arivalTime, arivalDay } = updatedForm;

    if (departureTime && arivalTime && arivalDay !== "") {
      const [depH, depM] = departureTime.split(":").map(Number);
      const [arrH, arrM] = arivalTime.split(":").map(Number);

      const depInMin = depH * 60 + depM;
      const arrInMin = arrH * 60 + arrM + parseInt(arivalDay) * 24 * 60;

      const duration = arrInMin - depInMin;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      updatedForm.journeyHour = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
    } else {
      updatedForm.journeyHour = "";
    }

    setForm(updatedForm);
  };

  useEffect(() => {
    routeDropDown();
    fetchSPList();

    classNameDropDown();
    layoutDropDown();
    if (form.classId && form.layoutId) {
      fleetDropDown();
    }
    if (form.routeId) {
      getPlaceList();
    }
    if(form.routeId && form.fromPlaceId && form.toPlaceId){
    getKMSbyFromTo();
    }
  }, [form.classId, form.layoutId, form.routeId,form.fromPlaceId , form.toPlaceId]);

  const getPlaceList = async () => {
    if (!form.routeId) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/dropdown/routePlacesDropDown`,
        { routeId: form.routeId },
        getAuthHeaders()
      );

      const places = res.data.data || [];
      setPlaceList(places);

      if (skipPlaceSetRef.current && places.length > 0) {
        const fromPlace = places[0];
        const toPlace = places[places.length - 1];
        const viaPlaceObj = places.find(
          (p) => p.PLACE_NAME === fromPlace.VIAPLACE
        );

        setForm((prevForm) => ({
          ...prevForm,
          fromPlaceId: fromPlace.PLACEID,
          toPlaceId: toPlace.PLACEID,
          viaPlace: viaPlaceObj ? viaPlaceObj.PLACEID : "",
        }));
      }
    } catch (err) {
      console.error("Place Fetch Error:", err);
    }
  };

  const getKMSbyFromTo=async()=>{
    if (!form.routeId || !form.fromPlaceId ||!form.toPlaceId) return;

    const payload={
      routeId:form.routeId,
      fromPlace:form.fromPlaceId,
      toPlace:form.toPlaceId,
    };
    try{
      const res=await axios.post(`${BASE_URL}/dropDown/getKMSbyFromTo`,payload,getAuthHeaders());
   const kmArray = res.data.data; // e.g., [{ distance_between: null }] or [{ distance_between: 500 }]

const validKmObj = kmArray.find(item => item.distance_between !== null && item.distance_between !== undefined);

const validKm = validKmObj ? validKmObj.distance_between : "";


setForm(prevForm => ({
  ...prevForm,
  totalJourneyDistance: validKm
}));
     } catch (err) {
      console.error("Place Fetch Error:", err);
    }


  };

  const routeDropDown = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/routeNameDropDown`,
        getAuthHeaders()
      );

      setRouteList(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };
  const fetchSPList = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/dropDown/getSPDropDown`,
          getAuthHeaders()
        );
        setSpList(res.data.data || []);
      } catch (err) {
        console.error("Error fetching Class List:", err);
      }
    };
  const classNameDropDown = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/classNameDropDown`,
        getAuthHeaders()
      );

      setClassList(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const layoutDropDown = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/layoutNameDropDown`,
        getAuthHeaders()
      );

      setLayoutList(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const fleetDropDown = async () => {
    const payload = {
      classId: form.classId,
      layoutId: form.layoutId,
    };

    try {
      const res = await axios.post(
        `${BASE_URL}/dropdown/getFleetDropDown`,
        payload,
        getAuthHeaders()
      );
      console.log(JSON.stringify(res.data.data));
      setFleetList(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { name: "tripCode", label: "Trip Code" },
      { name: "routeId", label: "Route" },
      { name: "serviceType", label: "Service Type" },
      { name: "departureTime", label: "Departure Time" },
      { name: "arivalTime", label: "Arrival Time" },
      { name: "arivalDay", label: "Arrival Day" },
      { name: "layoutId", label: "Layout" },
      { name: "classId", label: "Class Name" },
      { name: "fleetId", label: "Fleet" },
      { name: "operationdays", label: "Operation Days" },
    ];

    for (let field of requiredFields) {
      if (!form[field.name]) {
        setMessage(`Please fill in ${field.label}.`);
        const el = document.querySelector(`[name="${field.name}"]`);
        if (el) el.focus();
        return;
      }
    }

    const payload = {
      serviceId: form.serviceId,
      tripCode: form.tripCode,
      fromPlaceId: form.fromPlaceId,
      toPlaceId: form.toPlaceId,
      viaPlace: form.viaPlace,
      classId: form.classId,
      layoutId: form.layoutId,
      fleetId: form.fleetId,
      routeId: form.routeId,
      departureTime: form.departureTime,
      destinationArrivalTime: form.arivalTime,
      arrivalDay: form.arivalDay,
      journeyHours: form.journeyHour,
      totalJourneyDistance: form.totalJourneyDistance,
      serviceType: form.serviceType,
      introductionDate: form.introductionDate,
      withdrawalDate: form.withdrawalDate,
      operatingDays: form.operationdays,
      seatFareEnble:form.seatFareEnble,
      spId:form.spId,
    };
    var res;
    try {
      if (form.serviceId) {
        res = await axios.put(
          `${BASE_URL}/serviceMaster/update`,
          payload,
          getAuthHeaders()
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/serviceMaster/insert`,
          payload,
          getAuthHeaders()
        );
      }
      const resultMsg = res?.data?.meta?.message;

      setMessage(resultMsg);
      if (res.data.meta.success) {
        setActiveScreen("serviceEnroute");

        if (form.tripCode) {
          await getEnrouteDetails(form.tripCode);
          await getInsertedEnroutes(form.tripCode);
        }
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.meta?.message || "Error saving record.";
      setMessage(errorMsg);
    }
  };

  const getEnrouteDetails = async (tripcode) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/serviceEnroute/view`,
        { tripcode },
        getAuthHeaders()
      );

      console.log("brrrr",JSON.stringify(res.data.data));
      setServiceEnrouteList(res.data.data || []);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.meta?.message || "Error saving record.";
      setMessage(errorMsg);
    }
  };

  const getInsertedEnroutes = async (tripCode) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/serviceEnroute/insertedView`,
        { tripcode: tripCode },
        getAuthHeaders()
      );

      console.log("en", res.data.data);

      setInsertedServiceEnrouteList(res.data.data || []);
      const serviceList = Array.isArray(res.data?.data) ? res.data.data : [];

      if (serviceList.length > 0) {
        setPickupForm((prev) => ({
          ...prev,
          serviceId: serviceList[0].SERVICEID,
        }));
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.meta?.message || "Error fetching records.";
      setMessage(errorMsg);
    }
  };

  const handleReset = () => {
    setForm({
      serviceId: "",
      tripCode: "",
      routeId: "",
      fromPlaceId: "",
      toPlaceId: "",
      viaPlace: "",
      arivalDay: "",
      departureTime: "",
      arivalTime: "",
      fleetId: "",
      layoutId: "",
      journeyHour: "",
      serviceType: "",
      operationdays: "",
      classId: "",
      introductionDate: "",
      withdrawalDate: "",
      totalJourneyDistance: "",
    });

    setInsertedServiceEnrouteList([]);
    setServiceEnrouteList([]);
    setServicePickupPoints([]);
    setPickupForm({
      serviceId: "",
      servicePickupId: "",
      placeId: "",
      zoneId: "",
      pickupPointId: "",
      arrivalDay: "",
      arrivalTime: "",
      status: "",
    });

    setMessage("");
    setTimeout(() => {
      tirpCodeInput.current?.focus();
    }, 0);
  };

  const getServiceByTripcode = async (tripCode) => {
    skipPlaceSetRef.current = true;

    if (!tripCode) {
      setMessage("Please enter Tripcode");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/serviceMaster/view`,
        { tripCode },
        getAuthHeaders()
      );

      const serviceData = res.data?.data?.[0];
      if (!serviceData) {
        setMessage("No record found for this Tripcode.");
        skipPlaceSetRef.current = false;
        return;
      }

      if (serviceData.RouteID) {
        const placeRes = await axios.post(
          `${BASE_URL}/dropdown/routePlacesDropDown`,
          { routeId: serviceData.RouteID },
          getAuthHeaders()
        );

        const places = placeRes.data?.data || [];
        setPlaceList(places);
      }

      setForm({
        serviceId: serviceData.ServiceID || "",
        tripCode: serviceData.TripCode || "",
        fromPlaceId: serviceData.FROMPLACEID || "",
        toPlaceId: serviceData.TOPLACEID || "",
        viaPlace: serviceData.ViaPlace || "",
        arivalDay: serviceData.ArrivalDay,
        departureTime: serviceData.DepartureTime
          ? serviceData.DepartureTime.slice(0, 5)
          : "",
        arivalTime: serviceData.DestinationArrivalTime
          ? serviceData.DestinationArrivalTime.slice(0, 5)
          : "",
        fleetId: serviceData.FleetID || "",
        layoutId: serviceData.LayoutID || "",
        journeyHour: serviceData.JourneyHours
          ? serviceData.JourneyHours.slice(0, 5)
          : "",
        serviceType: serviceData.ServiceType || "",
        operationdays: serviceData.OperatingDays || "",
        classId: serviceData.ClassID || "",
        introductionDate: serviceData.IntroductionDate || "",
        withdrawalDate: serviceData.WithdrawalDate || "",
        totalJourneyDistance: serviceData.TotalJourneyDistance || "",
        routeId: serviceData.RouteID || "",
      });

      if (serviceData.TripCode) {
        await getEnrouteDetails(serviceData.TripCode);
        await getInsertedEnroutes(serviceData.TripCode);
      }

      setMessage("");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.meta?.message || "Error fetching service details.";
      setMessage(errorMsg);
    } finally {
      skipPlaceSetRef.current = false;
    }
  };

  const [selectedEnroutes, setSelectedEnroutes] = useState([]);

  const toggleEnroute = async (id, currentStatus, tripCode) => {
    const newStatus = currentStatus === "Y" ? "N" : "Y";
    if (
      !window.confirm(
        `Change status to ${newStatus === "Y" ? "Active" : "Inactive"}?`
      )
    )
      return;

    try {
      const res = await axios.put(
        `${BASE_URL}/serviceEnroute/toggleStatus`,
        { id: id, status: newStatus },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message || "Status updated");

      if (res.data.meta.success) {
        await getInsertedEnroutes(tripCode);
      }
    } catch (err) {
      console.error("Toggle Error:", err);
      const msg =
        err?.response?.data?.meta?.message || "Failed to toggle status.";
      setMessage(msg);
    }
  };

  const handleEnrouteSubmit = async () => {
    try {
      // 1️⃣ Split DB into active and inactive
      const dbActive = insertedServiceEnrouteList.filter(
        (db) => db.SER_STATUS === "Y"
      );
      const dbInactive = insertedServiceEnrouteList.filter(
        (db) => db.SER_STATUS === "N"
      );

      // 2️⃣ Find new rows (checked in UI but not in DB at all)
      const newSelections = selectedEnroutes.filter(
        (sel) =>
          !dbActive.some(
            (db) => db.TRIPCODE === sel.tripcode && db.PLACEID === sel.placeId
          ) &&
          !dbInactive.some(
            (db) => db.TRIPCODE === sel.tripcode && db.PLACEID === sel.placeId
          )
      );

      // 3️⃣ Find reactivations (checked in UI but inactive in DB)
      const reactivations = selectedEnroutes.filter((sel) =>
        dbInactive.some(
          (db) => db.TRIPCODE === sel.tripcode && db.PLACEID === sel.placeId
        )
      );

      // 4️⃣ Insert new records
      for (const row of newSelections) {
        await axios.post(
          `${BASE_URL}/serviceEnroute/insert`,
          row,
          getAuthHeaders()
        );
      }

      // 5️⃣ Reactivate inactive ones
      for (const row of reactivations) {
        const dbRow = dbInactive.find(
          (db) => db.TRIPCODE === row.tripcode && db.PLACEID === row.placeId
        );
        if (dbRow) {
          await axios.put(
            `${BASE_URL}/serviceEnroute/toggleStatus`,
            {
              id: dbRow.SER_ID, // or SERVICEID depending on API
              status: "Y",
            },
            getAuthHeaders()
          );
        }
      }

      // 6️⃣ Find unchecked active ones → deactivate
      const unchecked = dbActive.filter(
        (db) =>
          !selectedEnroutes.some(
            (sel) => sel.tripcode === db.TRIPCODE && sel.placeId === db.PLACEID
          )
      );

      for (const row of unchecked) {
        await axios.put(
          `${BASE_URL}/serviceEnroute/toggleStatus`,
          {
            id: row.SER_ID, // or SERVICEID depending on API
            status: "N",
          },
          getAuthHeaders()
        );
      }

      // 7️⃣ Done
      setMessage("Enroutes updated successfully!");

      if (selectedEnroutes[0]?.tripcode) {
        await getInsertedEnroutes(selectedEnroutes[0].tripcode);
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.meta?.message || "Error updating records.";
      setMessage(errorMsg);
    }
  };

  useEffect(() => {
    const activeFromDB = insertedServiceEnrouteList
      .filter((item) => item.SER_STATUS === "Y") // only active
      .map((item) => ({
        serviceId: item.SERVICEID || "",
        tripcode: item.TRIPCODE || "",
        routeId: item.ROUTEID || "",
        routeCode: item.ROUTECODE || "",
        placeId: item.PLACEID || "",
        placeName: item.PLACE_NAME || "",
        status: "Y",
        effeFromDate:item.SER_EFF_FROM,
        effeToDate:item.SER_EFF_TO,
      }));

    setSelectedEnroutes(activeFromDB);
  }, [insertedServiceEnrouteList]);

  // 2. isChecked now only checks against selectedEnroutes
  const isChecked = (item) => {
    return selectedEnroutes.some(
      (selected) =>
        selected.tripcode === item.TRIP_CODE &&
        selected.placeName === item.PLACENAME
    );
  };

const handleCheckboxChange = (action, payload) => {
  if (action === "checkbox") {
    const { item, checked } = payload;

    if (checked) {
      setSelectedEnroutes((prev) => [
        ...prev,
        {
          SM_ID: item.SM_ID, // add this so date updates work
          serviceId: item.SERVICE_ID,
          tripcode: item.TRIP_CODE,
          routeId: item.ROUTE_ID,
          routeCode: item.ROUTE_CODE,
          placeId: item.PLACE_ID,
          placeName: item.PLACENAME,
          status: "Y",
          effeFromDate:item.SM_INTRODUCTIONDATE,
        effeToDate:item.SM_INTRODUCTIONDATE,

        },
      ]);
    } else {
      setSelectedEnroutes((prev) =>
        prev.filter(
          (row) =>
            !(
              row.tripcode === item.TRIP_CODE &&
              row.placeName === item.PLACENAME
            )
        )
      );
    }
  }

  if (action === "date") {
    const { e, id, field } = payload;
    const newValue = e.target.value;

    setSelectedEnroutes((prev) =>
      prev.map((row) =>
        row.SM_ID === id ? { ...row, [field]: newValue } : row
      )
    );
  }
};



  //-pickup

  const [pickupForm, setPickupForm] = useState({
    serviceId: "",
    servicePickupId: "",
    placeId: "",
    zoneId: "",
    pickupPointId: "",
    arrivalDay: "",
    arrivalTime: "",
    status: "",
  });
  const handlePickupChange = (e) => {
    const { name, value } = e.target;

    if (name === "arrivalTime") {
      let digits = value.replace(/\D/g, "");

      if (digits.length > 4) digits = digits.slice(0, 4);

      if (digits.length >= 3) {
        digits = digits.slice(0, 2) + ":" + digits.slice(2);
      }

      setPickupForm((prev) => ({
        ...prev,
        [name]: digits,
      }));
    } else {
      setPickupForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    servicePlaceDropDown();
    serviceZoneDropDown();
    servicePickupDropDown();
    getPickupPointsList();
    getPlaceLists();
  }, [pickupForm.serviceId, pickupForm.placeId, pickupForm.zoneId]);

  const servicePlaceDropDown = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/dropdwon/servicePlaceDropDoown`,
        { serviceId: pickupForm.serviceId },
        getAuthHeaders()
      );
      console.log("place", JSON.stringify(res.data.data));
      setServicePlace(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const serviceZoneDropDown = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/dropdwon/serviceZoneDropDoown`,
        { placeId: pickupForm.placeId },
        getAuthHeaders()
      );
      console.log("Zone", JSON.stringify(res.data.data));
      setServiceZone(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };
const servicePickupDropDown = async () => {
  try {
    let requestData = {};

    if (pickupForm.zoneId) {
      requestData = { zoneId: pickupForm.zoneId, placeId: null };
    } else if (pickupForm.placeId) {
      requestData = { zoneId: null, placeId: pickupForm.placeId };
    } else {
      console.warn("No Zone ID or Place ID provided for pickup dropdown.");
      setServicePickup([]);
      return;
    }

    const res = await axios.post(
      `${BASE_URL}/dropdwon/servicePickupDropDoown`,
      requestData,
      getAuthHeaders()
    );

    console.log("Pickup Points:", JSON.stringify(res.data.data));
    setServicePickup(res.data.data || []);
  } catch (err) {
    console.error("Error fetching pickup dropdown:", err);
  }
};


 const handlePickupPoinstSubmit = async (e) => {
  e.preventDefault();
  alert(pickupForm.serviceId,"--",pickupForm.placeId);

  if (!pickupForm.serviceId || !pickupForm.placeId) {
    setMessage("Please fill in all mandatory fields.");
    return;
  }

  try {
    if (pickupForm.pickupPointId === "all") {
      // Find the selected place data
      const selectedPlace = servicePlace.find(p => p.PLACEID === parseInt(pickupForm.placeId));
      if (!selectedPlace) {
        setMessage("Selected place not found.");
        return;
      }

      // Start time and day from calculated arrival time and day offset
      let currentTime = selectedPlace.CALCULATED_ARRIVALTIME;
      let currentDay = selectedPlace.DAY_OFFSET;

      for (let i = 0; i < servicePickup.length; i++) {
        const point = servicePickup[i];

        const payload = {
          id: "",
          serviceId: pickupForm.serviceId,
          zoneId: pickupForm.zoneId,
          pickupPointId: point.PP_PICKUPID,
          pickupPointTime: currentTime,
          pickupPointDay: currentDay
        };

        alert(JSON.stringify(payload));

        await axios.post(`${BASE_URL}/servicePickupPoints/insert`, payload, getAuthHeaders());

        // Add 10 minutes for next pickup point
        const [hh, mm] = currentTime.split(":").map(Number);
        let totalMinutes = hh * 60 + mm + 10; // add 10 min
        if (totalMinutes >= 1440) { // next day
          totalMinutes -= 1440;
          currentDay += 1;
        }
        const newH = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const newM = String(totalMinutes % 60).padStart(2, "0");
        currentTime = `${newH}:${newM}`;
      }

      setMessage("All pickup points inserted successfully.");
    } else {
      // Insert single record (existing logic)
      const payload = {
        id: pickupForm.servicePickupId,
        serviceId: pickupForm.serviceId,
        zoneId: pickupForm.zoneId,
        pickupPointId: pickupForm.pickupPointId,
        pickupPointTime: pickupForm.arrivalTime,
        pickupPointDay: pickupForm.arrivalDay
      };

      let res;
      if (pickupForm.servicePickupId) {
        res = await axios.put(`${BASE_URL}/servicePickupPoints/update`, payload, getAuthHeaders());
      } else {
        res = await axios.post(`${BASE_URL}/servicePickupPoints/insert`, payload, getAuthHeaders());
      }

      setMessage(res.data.data);
    }

    // Reset form and refresh list
    setPickupForm(prev => ({
  ...prev,
  servicePickupId: "",
  zoneId: "",
  pickupPointId: "",
  arrivalDay: "",
  arrivalTime: "",
  status: ""
}));

    getPickupPointsList();

  } catch (err) {
    console.error("Error:", err);
    const errorMsg = err?.response?.data?.meta?.message || "Error saving record.";
    setMessage(errorMsg);
  }
};


  const getPickupPointsList = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/servicePickupPoints/view`,
        { serviceId: pickupForm.serviceId },
        getAuthHeaders()
      );
      console.log("Pik", JSON.stringify(res.data.data));
      setServicePickupPoints(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const handlePickupPointsEdit = async (item) => {
    setPickupForm({
      serviceId: item.SPP_SERVICEID,
      servicePickupId: item.SPP_ID,
      placeId: item.PLACEID,
      zoneId: item.ZONEID,
      pickupPointId: item.PICKUPPOINTSID,
      arrivalDay: item.DAY,
      arrivalTime: item.TIME,
      status: item.SPP_STATUS,
    });

    setTimeout(() => {
      servicePickupInputRef.current?.focus();
    }, 0);
  };

  const handlePickupPointsToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (
      !window.confirm(
        `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`
      )
    )
      return;

    try {
      const res = await axios.put(
        `${BASE_URL}/servicePickupPoints/toggleStatus`,
        { id: id, status: newStatus },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.status || "Status updated");
      if (res.data.meta.success) getPickupPointsList();
    } catch (err) {
      console.error("Toggle Error:", err);
      const msg =
        err?.response?.data?.meta?.message || "Failed to toggle status.";
      setMessage(msg);
    }
  };

  const handlePickupReset = async () => {
    setPickupForm((prevForm) => ({
      ...prevForm,
      servicePickupId: "",
      placeId: "",
      zoneId: "",
      pickupPointId: "",
      arrivalDay: "",
      arrivalTime: "",
      status: "",
    }));
    getPickupPointsList();
  };

  //serach Availability

  const [searchForm, setSearchForm] = useState({
    serachFromplaceId: "",
    serachToPlaceId: "",
    searchDate: "",
  });
  const handleSearchAvailability = async (e) => {
    e.preventDefault();

    console.log(searchForm.serachToPlaceId);
    console.log(searchForm.searchDate);
    console.log(searchForm.serachFromplaceId);

    if (
      !searchForm.serachFromplaceId ||
      !searchForm.serachToPlaceId ||
      !searchForm.searchDate
    ) {
      setMessage("Please fill in all mandatory fields.");
      return;
    }

    const payload = {
      fromPlace: searchForm.serachFromplaceId,
      toPlace: searchForm.serachToPlaceId,
      date: searchForm.searchDate,
    };

    try {
      const res = await axios.post(
        `${BASE_URL}/serviceAvailability/view`,
        payload,
        getAuthHeaders()
      );
      console.log("pp", JSON.stringify(res.data.data));
      setSearchTripList(res.data.data || []);
     // handleSearchReset();
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchReset =  () => {
    setSearchForm({
      serachFromplaceId: "",
      serachToPlaceId: "",
      searchDate: "",
    });
    setMessage("");
    setSearchTripList([]);
    handleReset();
  };

  const getPlaceLists = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dropdown/getPlacesLists`,
        getAuthHeaders()
      );
      setSearchPlaceList(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  const placeOptions = searchPlaceList.map((place) => {
    return {
      value: place.ID,
      label: place.NAME,
    };
  });

const handleTripCodeClick = (tripCode) => {
  setActiveScreen("serviceMaster");
  getServiceByTripcode(tripCode);
};


  return (
    <div className="container my-5">
      {message && (
        <div
          className={`alert ${
            message.includes("ALREADY") ? "alert-warning" : "alert-success"
          } text-center`}
        >
          {message}
        </div>
      )}
      <div className="mb-4 text-center">
        {screens.map((screen) => (
          <button
            key={screen}
            className={`btn ${
              activeScreen === screen ? "btn-dark" : "btn-outline-dark"
            } mx-2 px-4 py-2 rounded-pill`}
            onClick={() => setActiveScreen(screen)}
          >
            {screen
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}{" "}
            {/* Capitalize */}
          </button>
        ))}
      </div>

      {activeScreen === "serviceMaster" && (
        <div className="card shadow border-0 rounded-4">
          <div className="card-body p-4 bg-white">
            <h4 className="text-center mb-4">Service Master Form</h4>
            <form onSubmit={handleSubmit} className="row g-4">
              <div className="col-md-4">
                <label htmlFor="tripCode" className="form-label">
                  Trip Code <span className="text-danger">*</span>
                </label>
                <input
                  id="tripCode"
                  type="text"
                  name="tripCode"
                  value={form.tripCode}
                  onChange={handleChange}
                  className="form-control"
                  required
                  ref={tirpCodeInput}
                />
                <button
                  type="button"
                  className="btn btn-dark px-4"
                  onClick={() => getServiceByTripcode(form.tripCode)}
                >
                  Get Details
                </button>
              </div>
              <div className="col-md-4">
                <label htmlFor="routeId" className="form-label">
                  Route <span className="text-danger">*</span>
                </label>
                <select
                  id="routeId"
                  name="routeId"
                  value={form.routeId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value=""> Select Route </option>
                  {routeList.map((s) => (
                    <option key={s.RM_ROUTEID} value={s.RM_ROUTEID}>
                      {s.RM_ROUTECODE}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="totalJourneyDistance" className="form-label">
                  Total Distence(KM) <span className="text-danger">*</span>
                </label>
                <input
                  id="totalJourneyDistance"
                  type="text"
                  name="totalJourneyDistance"
                  value={form.totalJourneyDistance}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="classId" className="form-label">
                  Class Name <span className="text-danger">*</span>
                </label>
                <select
                  id="classId"
                  name="classId"
                  value={form.classId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value=""> Select Class </option>
                  {classList.map((s) => (
                    <option key={s.CLM_CLASSID} value={s.CLM_CLASSID}>
                      {s.CLM_CLASSNAME}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="layoutId" className="form-label">
                  Layout <span className="text-danger">*</span>
                </label>
                <select
                  id="layoutId"
                  name="layoutId"
                  value={form.layoutId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value=""> Select Layout </option>
                  {layoutList.map((s) => (
                    <option key={s.LAM_LAYOUTID} value={s.LAM_LAYOUTID}>
                      {s.LAM_LAYOUTCODE}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="fleetId" className="form-label">
                  Fleet <span className="text-danger">*</span>
                </label>
                <select
                  id="fleetId"
                  name="fleetId"
                  value={form.fleetId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value=""> Select Fleet </option>
                  {fleetList.map((s) => (
                    <option key={s.FLM_FLEETID} value={s.FLM_FLEETID}>
                      {s.FLM_VEHICLENUMBER}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="fromPlaceId" className="form-label">
                  From Place
                </label>
                <select
                  id="fromPlaceId"
                  name="fromPlaceId"
                  className="form-select"
                  value={form.fromPlaceId}
                  onChange={handleChange}
                  required
                >
                  <option value=""> Select from place </option>
                  {placeList.map((s) => (
                    <option key={s.PLACEID} value={s.PLACEID}>
                      {s.PLACE_NAME}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="toPlaceId" className="form-label">
                  To Place
                </label>
                <select
                  id="toPlaceId"
                  name="toPlaceId"
                  className="form-select"
                  value={form.toPlaceId}
                  onChange={handleChange}
                  required
                >
                  <option value=""> Select to place </option>
                  {placeList.map((s) => (
                    <option key={s.PLACEID} value={s.PLACEID}>
                      {s.PLACE_NAME}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="viaPlace" className="form-label">
                  Via
                </label>
                <input
                  type="text"
                  id="viaPlace"
                  name="viaPlace"
                  className="form-control"
                  value={form.viaPlace}
                  onChange={handleChange}
                  readOnly={(() => {
                    const selectedRoute = routeList.find(
                      (r) => r.ROUTEID === parseInt(form.routeId)
                    );
                    return (
                      selectedRoute &&
                      selectedRoute.VIAPLACE !== "0" &&
                      selectedRoute.VIAPLACE !== ""
                    );
                  })()}
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="departureTime" className="form-label">
                  Departure Time <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="departureTime"
                  className="form-control"
                  value={form.departureTime}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="HHMM (24-hour format)"
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="arivalTime" className="form-label">
                  Arrival Time <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="arivalTime"
                  className="form-control"
                  value={form.arivalTime}
                  onChange={handleChange}
                  maxLength={5}
                  placeholder="HHMM (24-hour format)"
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="arivalDay" className="form-label">
                  Arrival Day <span className="text-danger">*</span>
                </label>
                <select
                  id="arivalDay"
                  name="arivalDay"
                  value={form.arivalDay}
                  onChange={handleTimeChange}
                  className="form-select"
                  required
                >
                  <option value=""> Select Arrival Day </option>
                  <option value="0">Same Day</option>
                  <option value="1">Next Day</option>
                  <option value="2">Two Days Later</option>
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="journeyHour" className="form-label">
                  Journey Duration
                </label>
                <input
                  type="text"
                  id="journeyHour"
                  name="journeyHour"
                  className="form-control"
                  value={form.journeyHour}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="operationdays" className="form-label">
                  Operation Day's (Mon–Sun)<span className="text-danger">*</span>
                </label>
                <input
                  id="operationdays"
                  type="text"
                  name="operationdays"
                  value={form.operationdays}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter like YYYYYYY / NNNNNNN"
                  required
                  maxLength={7}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="serviceType" className="form-label">
                  Service Type <span className="text-danger">*</span>
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value=""> Select Service Type </option>
                  <option value="D">Day</option>
                  <option value="N">Night</option>
                </select>
              </div>

               <div className="col-md-4">
              <label htmlFor="spId" className="form-label">
                 Service Provider <span className="text-danger">*</span>
              </label>
              <select
                name="spId"
                value={form.spId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Service Provider</option>
                {spList.map((c) => (
                  <option key={c.ID} value={c.ID}>
                    {c.SERVICEPROVIDERNAME}
                  </option>
                ))}
              </select>
            </div>
              <div className="col-md-4">
                <label htmlFor="introductionDate" className="form-label">
                  Introduction Date
                </label>
                <input
                  id="introductionDate"
                  type="date"
                  name="introductionDate"
                  value={form.introductionDate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="withdrawalDate" className="form-label">
                  Withdrawal Date
                </label>
                <input
                  id="withdrawalDate"
                  type="date"
                  name="withdrawalDate"
                  value={form.withdrawalDate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

     
    <div className="col-md-4">
              <label className="form-label d-block">
                Seat Fare Enable <span className="text-danger">*</span>
              </label>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="seatFareEnble"
                  id="active"
                  value="Y"
                  checked={form.seatFareEnble === "Y"}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label htmlFor="active" className="form-check-label">
                  Yes
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="seatFareEnble"
                  id="inactive"
                  value="N"
                  checked={form.seatFareEnble === "N"}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label htmlFor="inactive" className="form-check-label">
                  No
                </label>
              </div>
            </div>

              <div className="col-12 text-end d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button type="submit" className="btn btn-dark px-4">
                  {form.serviceId ? "Update" : "Submit"}
                </button>
              </div>



            </form>
          </div>
        </div>
      )}
      {activeScreen === "serviceEnroute" && (
        <div>
          <h3>Service Enroute Form</h3>
          <div
            className="card shadow mt-5 border-0 rounded-4"
            style={{ backgroundColor: "#ffff" }}
          >
            <div className="card-body p-4">
              <h5
                className="text-center mb-4 fw-bold"
                style={{ color: "#1e1e2d" }}
              >
                Service Enroute
              </h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle text-center">
                  <thead style={{ backgroundColor: "#1e1e2d", color: "#ffff" }}>
                    <tr>
                      <th>Sl.No</th>
                      <th>Tricode</th>
                      <th>RouteCode</th>
                      <th>PlaceName</th>
                      <th>Effe. From Date</th>
                      <th>Effe. To Date</th>
                      <th style={{ minWidth: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceEnrouteList.map((item, index) => (
                      <tr key={item.LOOKUPID}>
                        <td>{index + 1}</td>
                        <td>{item.TRIP_CODE}</td>
                        <td>{item.ROUTE_CODE}</td>
                        <td>{item.PLACENAME}</td>
                       <td>
  <input
    type="date"
    value={item.SM_INTRODUCTIONDATE || ""}
    onChange={(e) =>
      handleCheckboxChange("date", {
        e,
        id: item.SM_ID,
        field: "SM_INTRODUCTIONDATE",
      })
    }
    className="form-control"
  />
</td>

<td>
  <input
    type="date"
    value={item.SM_WITHDRAWALDATE || ""}
    onChange={(e) =>
      handleCheckboxChange("date", {
        e,
        id: item.SM_ID,
        field: "SM_WITHDRAWALDATE",
      })
    }
    className="form-control"
  />
</td>

<td>
  <style>
    {`
      .form-check-input:checked {
        background-color: #1e1e2d !important;
        border-color: #1e1e2d !important;
      }
    `}
  </style>
  <div className="d-flex justify-content-center">
    <input
      type="checkbox"
      className="form-check-input"
      checked={isChecked(item)}
      onChange={(e) =>
        handleCheckboxChange("checkbox", {
          item,
          checked: e.target.checked,
        })
      }
    />
  </div>
</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-end mt-3">
                <button
                  className="btn px-4 rounded-pill"
                  style={{ backgroundColor: "#1e1e2d", color: "#fff" }}
                  onClick={handleEnrouteSubmit}
                  disabled={selectedEnroutes.length === 0}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {insertedServiceEnrouteList.length > 0 && (
            <div
              className="card shadow mt-5 border-0 rounded-4"
              style={{ backgroundColor: "#ffff" }}
            >
              <div className="card-body p-4">
                <h5
                  className="text-center mb-4 fw-bold"
                  style={{ color: "#1e1e2d" }}
                >
                  Service Enroute Records
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center">
                    <thead
                      style={{ backgroundColor: "#1e1e2d", color: "#ffff" }}
                    >
                      <tr>
                        <th>Sl.No</th>
                        <th>TripCode</th>
                        <th>Routecode</th>
                        <th>Place Name</th>
                        <th>Effe From Date</th>
                        <th>Effe To Date</th>
                        

                        <th>Status</th>
                        <th style={{ minWidth: "180px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insertedServiceEnrouteList.map((item, index) => (
                        <tr key={item.SER_ID}>
                          <td>{index + 1}</td>
                          <td>{item.TRIPCODE}</td>
                          <td>{item.ROUTECODE}</td>
                          <td>{item.PLACE_NAME}</td>
                          <td>{item.SER_EFF_FROM}</td>
                          <td>{item.SER_EFF_TO}</td>
                          <td>
                            {item.SER_STATUS === "Y" ? "Active" : "Inactive"}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-sm rounded-pill px-3"
                                style={{
                                  backgroundColor:
                                    item.SER_STATUS === "Y"
                                      ? "#6c757d"
                                      : "#2a5298",
                                  color: "#fff",
                                  border: "none",
                                }}
                                onClick={() =>
                                  toggleEnroute(
                                    item.SER_ID,
                                    item.SER_STATUS,
                                    item.TRIPCODE
                                  )
                                }
                              >
                                {item.SER_STATUS === "Y"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeScreen === "pickupPoints" && (
        <div>
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4 bg-white">
              <h4 className="text-center mb-4">Service Pickup Points Form</h4>
              <form onSubmit={handlePickupPoinstSubmit} className="row g-4">
                <div className="col-md-4">
                  <label htmlFor="placeId" className="form-label">
                    Place Name <span className="text-danger">*</span>
                  </label>
                  <select
                    id="placeId"
                    name="placeId"
                    value={pickupForm.placeId}
                    onChange={handlePickupChange}
                    className="form-control"
                    required
                    ref={servicePickupInputRef}
                  >
                    <option value="">-- Select Place --</option>
                    {servicePlace.map((place) => (
                      <option key={place.PLACEID} value={place.PLACEID}>
                        {place.PLACENAME}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="zoneId" className="form-label">
                    Zone Name <span className="text-danger">*</span>
                  </label>
                  <select
                    id="zoneId"
                    name="zoneId"
                    value={pickupForm.zoneId}
                    onChange={handlePickupChange}
                    className="form-control"
                   
                  >
                    <option value="">-- Select Zone --</option>
                    {serviceZone.map((zone) => (
                      <option key={zone.ZM_ZONEID} value={zone.ZM_ZONEID}>
                        {zone.ZM_ZONENAME}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="pickupPointId" className="form-label">
                    Pickup Point <span className="text-danger">*</span>
                  </label>
                  <select
                    id="pickupPointId"
                    name="pickupPointId"
                    value={pickupForm.pickupPointId}
                    onChange={handlePickupChange}
                    className="form-control"
                    required
                  >
                    <option value="">-- Select Pickup Point --</option>
                    <option value="all">ALL</option>
                    {servicePickup.map((point) => (
                      <option key={point.PP_PICKUPID} value={point.PP_PICKUPID}>
                        {point.PP_PICKUPPOINTNAME}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="arrivalTime" className="form-label">
                    Arrival Time <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="arrivalTime"
                    name="arrivalTime"
                    className="form-control"
                    value={pickupForm.arrivalTime}
                    onChange={handlePickupChange}
                    maxLength={5}
                    placeholder="HH:MM (24-hour format)"
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="arrivalDay" className="form-label">
                    Arrival Day <span className="text-danger">*</span>
                  </label>
                  <select
                    id="arrivalDay"
                    name="arrivalDay"
                    value={pickupForm.arrivalDay}
                    onChange={handlePickupChange}
                    className="form-control"
                    
                  >
                    <option value="">-- Select Arrival Day --</option>
                    <option value="0">Same Day</option>
                    <option value="1">Next Day</option>
                    <option value="2">Two Days Later</option>
                  </select>
                </div>

                <div className="col-12 text-end d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn px-4"
                    style={{
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                    }}
                    onClick={handlePickupReset}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn px-4"
                    style={{
                      backgroundColor: "#1e1e2d",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {pickupForm.servicePickupId ? "Update" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          {servicePickupPoints.length > 0 && (
            <div
              className="card shadow mt-5 border-0 rounded-4"
              style={{ backgroundColor: "#ffff" }}
            >
              <div className="card-body p-4">
                <h5
                  className="text-center mb-4 fw-bold"
                  style={{ color: "#1e1e2d" }}
                >
                  Pickup Points Records
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center">
                    <thead
                      style={{ backgroundColor: "#1e1e2d", color: "#ffff" }}
                    >
                      <tr>
                        <th>Sl.No</th>
                        <th>Place Name</th>
                        <th>Zone Name</th>
                        <th>Pickup Point Name</th>
                        <th>Time</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th style={{ minWidth: "180px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicePickupPoints.map((item, index) => (
                        <tr key={item.SPP_ID}>
                          <td>{index + 1}</td>
                          <td>{item.PLACENAME}</td>
                          <td>{item.ZONENAME}</td>
                          <td>{item.PICKUPPOINTSNAME}</td>
                          <td>{item.TIME}</td>
                          <td>
                            {item.DAY === 0
                              ? "Same day"
                              : item.DAY === 1
                              ? "Next day"
                              : item.DAY === 2
                              ? "Two days later"
                              : ""}
                          </td>
                          <td>
                            {item.SPP_STATUS === "A" ? "Active" : "Inactive"}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-sm rounded-pill px-3"
                                style={{
                                  backgroundColor: "#1e1e2d",
                                  color: "#fff",
                                  border: "none",
                                }}
                                onClick={() => handlePickupPointsEdit(item)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-sm rounded-pill px-3"
                                style={{
                                  backgroundColor:
                                    item.SPP_STATUS === "A"
                                      ? "#6c757d"
                                      : "#2a5298",
                                  color: "#fff",
                                  border: "none",
                                }}
                                onClick={() =>
                                  handlePickupPointsToggleStatus(
                                    item.SPP_ID,
                                    item.SPP_STATUS
                                  )
                                }
                              >
                                {item.SPP_STATUS === "A"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeScreen === "searchTrips" && (
        <div>
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4 bg-white">
              <h4 className="text-center mb-4">Service Availability Form</h4>
              <form onSubmit={handleSearchAvailability} className="row g-4">
                <div className="col-md-4">
                  <label className="form-label">
                    From Place Name <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={placeOptions}
                    value={
                      searchForm.serachFromplaceId
                        ? placeOptions.find(
                            (option) =>
                              option.value ===
                              String(searchForm.serachFromplaceId)
                          )
                        : null
                    }
                    onChange={(selected) =>
                      handleSearchChange({
                        target: {
                          name: "serachFromplaceId",
                          value: selected?.value || null,
                        },
                      })
                    }
                    placeholder="-- Select From Place --"
                    isClearable
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    To Place Name <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={placeOptions}
                    value={
                      searchForm.serachToPlaceId
                        ? placeOptions.find(
                            (option) =>
                              option.value ===
                              String(searchForm.serachToPlaceId)
                          )
                        : null
                    }
                    onChange={(selected) =>
                      handleSearchChange({
                        target: {
                          name: "serachToPlaceId",
                          value: selected?.value || null,
                        },
                      })
                    }
                    placeholder="-- Select To Place --"
                    isClearable
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="searchDate" className="form-label">
                    Date
                  </label>
                  <input
                    id="searchDate"
                    type="date"
                    name="searchDate"
                    value={searchForm.searchDate || ""}
                    onChange={(e) =>
                      setSearchForm((prev) => ({
                        ...prev,
                        searchDate: e.target.value,
                      }))
                    }
                    className="form-control"
                  />
                </div>

                <div className="col-12 text-end d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn px-4"
                    style={{
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                    }}
                    onClick={handleSearchReset}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn px-4"
                    style={{
                      backgroundColor: "#1e1e2d",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
          {searchTripList.length > 0 && (
            <div
              className="card shadow mt-5 border-0 rounded-4"
              style={{ backgroundColor: "#ffff" }}
            >
              <div className="card-body p-4">
                <h5
                  className="text-center mb-4 fw-bold"
                  style={{ color: "#1e1e2d" }}
                >
                  Pickup Points Records
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center">
                    <thead
                      style={{ backgroundColor: "#1e1e2d", color: "#ffff" }}
                    >
                      <tr>
                        <th>Sl.No</th>
                        <th>Trip Code</th>
                        <th>Route Code</th>
                        <th>From Place</th>
                        <th>To Place</th>
                        <th>Via</th>
                        <th>Class Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchTripList.map((item, index) => (
                        <tr key={item.SPP_ID}>
                          <td>{index + 1}</td>
                          <td
  style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
  onClick={() => handleTripCodeClick(item.TRIP_CODE)}
>
  {item.TRIP_CODE}
</td>

                          <td>{item.ROUTE_CODE}</td>
                          <td>{item.FROMPLACE}</td>
                          <td>{item.TO_PLACENAME}</td>
                          <td>{item.VIA_PLACE}</td>
                          <td>{item.CLASSNAME}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceMaster;