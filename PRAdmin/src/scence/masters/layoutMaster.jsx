import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import BASE_URL from "../../configAPI";

const LayoutMaster = () => {
  const [form, setForm] = useState({
    layoutCode: "",
    layoutDescription: "",
    seatingType: "",
    totalSeaterCount: "",
    totalBerthCount: "",
    conductorSeat: "",
    totalSeats: "",
    formattedEffectiveFromDate: "",
    formattedEffectiveToDate: "",
    deckType: "",
    layoutId: null,
  });

  const [layoutList, setLayoutList] = useState([]);
  const [message, setMessage] = useState("");
  const layoutCodeInputRef = useRef(null);

  const handleReset = () => {
    setForm({
      layoutCode: "",
      layoutDescription: "",
      seatingType: "",
      totalSeaterCount: "",
      totalBerthCount: "",
      conductorSeat: "",
      totalSeats: "",
      formattedEffectiveFromDate: "",
      formattedEffectiveToDate: "",
      deckType: "",
      layoutId: null,
    });

    // Optional: Clear messages
    setMessage?.(""); // if you use setMessage
    // if you have dropdowns to hide

    // Focus the layout code input
  };

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      layoutCode,
      layoutDescription,
      seatingType,
      totalSeaterCount,
      totalBerthCount,
      conductorSeat,
      totalSeats,
      formattedEffectiveFromDate,
      formattedEffectiveToDate,
      deckType,
      layoutId,
    } = form;

    if (
      !layoutCode ||
      !layoutDescription ||
      !seatingType ||
      !totalSeaterCount ||
      !totalBerthCount ||
      !conductorSeat ||
      !totalSeats ||
      !formattedEffectiveFromDate ||
      !formattedEffectiveToDate ||
      !deckType
    ) {
      alert("All fields are required");
      return;
    }

    try {
      var res;
      if (layoutId) {
        res = await axios.post(
          `${BASE_URL}/layoutMaster/update`,
          form,
          getAuthHeaders()
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/layoutMaster/insert`,
          form,
          getAuthHeaders()
        );
      }

      const resultMsg = res?.data?.meta?.message;
      setMessage(resultMsg);

      if (res.data.meta.success) {
        setForm({
          layoutCode: "",
          layoutDescription: "",
          seatingType: "",
          totalSeaterCount: "",
          totalBerthCount: "",
          conductorSeat: "",
          totalSeats: "",
          formattedEffectiveFromDate: "",
          formattedEffectiveToDate: "",
          deckType: "",
        });
        getAllLayout();
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.meta?.message || "Error saving record.";
      setMessage(errorMsg);
    }
  };

  const getAllLayout = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/layoutMaster/getLayoutList`,
        getAuthHeaders()
      );
      setLayoutList(res.data.data);
    } catch (err) {
      const errorMsg = err?.response?.data?.meta?.message;
      setMessage(errorMsg);
    }
  };

  useEffect(() => {
    getAllLayout();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
    });
  };

  const handleEdit = (item) => {
    setForm({
      layoutCode: item.LAYOUT_CODE,
      layoutDescription: item.LAYOUT_DESCRIPTION,
      seatingType: item.SEATING_TYPE,
      totalSeaterCount: item.SEATE_COUNT,
      totalBerthCount: item.BERTH_COUNT,
      deckType: item.DECK_TYPE,
      conductorSeat: item.CONDUCTOR_SEAT,
      totalSeats: item.TOTAL_SEAT,
      formattedEffectiveFromDate: item.EFF_FROM_DATE,
      formattedEffectiveToDate: item.EFF_TO_DATE,
      layoutId: item.LAYOUT_ID,
    });
    setMessage(`Editing Layout Name: ${item.LAYOUT_DESCRIPTION}`);
    setTimeout(() => {
      layoutCodeInputRef.current?.focus();
    }, 0);
  };

  const handleToggleStatus = async (layoutId, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (
      !window.confirm(
        `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`
      )
    )
      return;

    try {
      const res = await axios.post(
        `http://172.31.98.168:5000/api/layoutMaster/taggleStatus`,
        { status: newStatus, layoutId: layoutId },
        getAuthHeaders()
      );
      setMessage(res?.data?.meta?.message || "Status updated");
      if (res.data.meta.success) getAllLayout();
    } catch (err) {
      console.error("Toggle Error:", err);
      const msg =
        err?.response?.data?.meta?.message || "Failed to toggle status.";
      setMessage(msg);
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
          <h4 className="text-center mb-4">Layout Master Form</h4>
          <form onSubmit={handleSubmit} className="row g-4">
            {[
              ["layoutCode", "Layout Code", "text"],
              ["layoutDescription", "Layout Description", "text"],
              ["seatingType", "Seating Type", "text"],
              ["totalSeaterCount", "Total Seater Count", "number"],
              ["totalBerthCount", "Total Berth Count", "number"],
              ["deckType", "Deck Type", "text"],
              ["conductorSeat", "Conductor Seat", "number"],
              ["totalSeats", "Total Seats", "number"],
              ["formattedEffectiveFromDate", "Effective From", "date"],
              ["formattedEffectiveToDate", "Effective To", "date"],
            ].map(([name, label, type], i) => (
              <div className="col-md-4" key={name}>
                <label htmlFor={name} className="form-label">
                  {label} <span className="text-danger">*</span>
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={form[name] || ""}
                  onChange={handleChange}
                  className="form-control"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  required
                  ref={name === "layoutDescription" ? layoutCodeInputRef : null}
                  disabled={name === "layoutCode" && !!form.layoutId}
                />
              </div>
            ))}

            <div className="col-12 text-end d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn px-4"
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                }}
                onClick={handleReset}
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
                {form.layoutId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {layoutList.length > 0 && (
        <div
          className="card shadow mt-5 border-0 rounded-4"
          style={{ backgroundColor: "#fff" }}
        >
          <div className="card-body p-4">
            <h5
              className="text-center mb-4 fw-bold"
              style={{ color: "#1e1e2d" }}
            >
              Lookup Records
            </h5>
            <div
              className="table-responsive"
              style={{ overflowX: "auto", whiteSpace: "nowrap" }}
            >
              <table
                className="table table-hover align-middle text-center"
                style={{ width: "100%" }}
              >
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                  <tr>
                    <th>Sl.No</th>
                    <th>Layout Code</th>
                    <th>Layout Description</th>
                    <th>Seating Type</th>
                    <th>Seat Count</th>
                    <th>Berth Count</th>
                    <th>Deck Type</th>
                    <th>Conductor Seat</th>
                    <th>Total Seats</th>
                    <th>Effective From</th>
                    <th>Effective To</th>
                    <th>Status</th>
                    <th style={{ minWidth: "180px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {layoutList.map((item, index) => (
                    <tr key={item.LAYOUT_ID}>
                      <td>{index + 1}</td>
                      <td>{item.LAYOUT_CODE}</td>
                      <td>{item.LAYOUT_DESCRIPTION}</td>
                      <td>{item.SEATING_TYPE}</td>
                      <td>{item.SEATE_COUNT}</td>
                      <td>{item.BERTH_COUNT}</td>
                      <td>{item.DECK_TYPE}</td>
                      <td>{item.CONDUCTOR_SEAT}</td>
                      <td>{item.TOTAL_SEAT}</td>
                      <td>{item.EFF_FROM_DATE}</td>
                      <td>{item.EFF_TO_DATE}</td>
                      <td>{item.STATUS === "A" ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: "#1e1e2d",
                              color: "#fff",
                            }}
                            onClick={() => handleEdit(item)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor:
                                item.STATUS === "A" ? "#6c757d" : "#2a5298",
                              color: "#fff",
                            }}
                            onClick={() =>
                              handleToggleStatus(item.LAYOUT_ID, item.STATUS)
                            }
                          >
                            {item.STATUS === "A" ? "Deactivate" : "Activate"}
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
  );
};

export default LayoutMaster;
