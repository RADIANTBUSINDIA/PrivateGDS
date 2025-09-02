import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";

const LayoutMasterDesign = () => {
  const initialForm = {
    layid: null,
    layoutId: "",
    rowNum: "",
    deckType: "",
    layLeftSide1: "",
    layLeftSide1Desc: "",
    layLeftSide2: "",
    layLeftSide2Desc: "",
    layLeftSide3: "",
    layLeftSide3Desc: "",
    layRightSide1: "",
    layRightSide1Desc: "",
    layRightSide2: "",
    layRightSide2Desc: "",
    layRightSide3: "",
    layRightSide3Desc: "",
  };

  const [form, setForm] = useState(initialForm);
  const [list, setList] = useState([]);
  const [layoutList, setLayoutList] = useState([]);
  const [message, setMessage] = useState("");
  const layoutIdRef = useRef(null);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  const layoutDropDown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dropdown/layoutNameDropDown`, getAuthHeaders());
      setLayoutList(res.data.data || []);
    } catch (err) {
      console.error("User Fetch Error:", err);
    }
  };

  useEffect(() => {
    layoutDropDown();
  }, []);

  // Fetch layout designs when layoutId changes
  useEffect(() => {
    if (!form.layoutId) {
      setList([]);
      return;
    }

    axios
      .get(`${BASE_URL}/layoutDesignFetch/FetchData`, {
        ...getAuthHeaders(),
        params: { layoutId: form.layoutId },
      })
      .then((res) => setList(res.data.data || []))
      .catch((err) => console.error("Fetch error:", err.response || err));
  }, [form.layoutId]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "rowNum") {
      if (Number(value) > 100) return;
      if (Number(value) < 1 && value !== "") return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = (item) => {
    setForm({
      layid: item.LAYID,
      layoutId: item.LAYOUTID,
      rowNum: item.ROWNUM,
      deckType: item.DECKTYPE,
      layLeftSide1: item.LAYLEFTSIDE1,
      layLeftSide1Desc: item.LAYLEFTSIDE1DESC,
      layLeftSide2: item.LAYLEFTSIDE2,
      layLeftSide2Desc: item.LAYLEFTSIDE2DESC,
      layLeftSide3: item.LAYLEFTSIDE3,
      layLeftSide3Desc: item.LAYLEFTSIDE3DESC,
      layRightSide1: item.LAYRIGHTSIDE1,
      layRightSide1Desc: item.LAYRIGHTSIDE1DESC,
      layRightSide2: item.LAYRIGHTSIDE2,
      layRightSide2Desc: item.LAYRIGHTSIDE2DESC,
      layRightSide3: item.LAYRIGHTSIDE3,
      layRightSide3Desc: item.LAYRIGHTSIDE3DESC,
    });
    setMessage(`Editing Layout ID: ${item.LAYOUTID}`);
    setTimeout(() => layoutIdRef.current?.focus(), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.layoutId || !form.rowNum || !form.deckType) {
      setMessage("Please fill all required fields.");
      return;
    }

    const payloadInsert = {
      layoutId: form.layoutId,
      rowNum: form.rowNum,
      deckType: form.deckType,
      layLeftSide1: form.layLeftSide1,
      layLeftSide1Desc: form.layLeftSide1Desc,
      layLeftSide2: form.layLeftSide2,
      layLeftSide2Desc: form.layLeftSide2Desc,
      layLeftSide3: form.layLeftSide3,
      layLeftSide3Desc: form.layLeftSide3Desc,
      layRightSide1: form.layRightSide1,
      layRightSide1Desc: form.layRightSide1Desc,
      layRightSide2: form.layRightSide2,
      layRightSide2Desc: form.layRightSide2Desc,
      layRightSide3: form.layRightSide3,
      layRightSide3Desc: form.layRightSide3Desc,
    };

    const payloadUpdate = {
      layid: form.layid,
      layoutid: form.layoutId,
      rowNum: form.rowNum,
      deckType: form.deckType,
      leftSide1: form.layLeftSide1,
      leftSide1Description: form.layLeftSide1Desc,
      leftSide2: form.layLeftSide2,
      leftSide2Description: form.layLeftSide2Desc,
      leftSide3: form.layLeftSide3,
      leftSide3Description: form.layLeftSide3Desc,
      rightSide1: form.layRightSide1,
      rightSide1Description: form.layRightSide1Desc,
      rightSide2: form.layRightSide2,
      rightSide2Description: form.layRightSide2Desc,
      rightSide3: form.layRightSide3,
      rightSide3Description: form.layRightSide3Desc,
    };

    try {
      const res = form.layid
        ? await axios.put(`${BASE_URL}/layoutDesignMaster/update`, payloadUpdate, getAuthHeaders())
        : await axios.post(`${BASE_URL}/layoutMasterDesign/insertion`, payloadInsert, getAuthHeaders());

      setMessage(res.data.meta.message || "Saved successfully.");

      if (res.data.meta.success) {
        setForm(initialForm);

        const fresh = await axios.get(`${BASE_URL}/layoutDesignFetch/FetchData`, {
          ...getAuthHeaders(),
          params: { layoutId: payloadInsert.layoutId },
        });
        setList(fresh.data.data || []);
      }
    } catch (err) {
      console.error("Save error:", err.response || err);
      setMessage(err.response?.data?.meta?.message || "Error saving layout.");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (!window.confirm(`Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`)) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/layoutStatusUpdate/UpdateStatus`,
        { layoutId: id, layoutStatus: newStatus },
        getAuthHeaders()
      );

      setMessage(res.data.meta.message || "Status updated.");

      if (res.data.meta.success) {
        const fresh = await axios.get(`${BASE_URL}/layoutDesignFetch/FetchData`, {
          ...getAuthHeaders(),
          params: { layoutId: form.layoutId },
        });
        setList(fresh.data.data || []);
      }
    } catch (err) {
      console.error("Status toggle error:", err.response || err);
      setMessage("Failed to update status.");
    }
  };

  return (
    <div className="container my-5">
      {message && (
        <div
          className={`alert ${
            message.toLowerCase().includes("error") || message.toLowerCase().includes("please")
              ? "alert-danger"
              : "alert-success"
          } mx-auto text-center px-3 py-2 shadow`}
          style={{ display: "inline-block", whiteSpace: "nowrap", borderRadius: 12, fontWeight: 500 }}
        >
          {message}
        </div>
      )}

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4" style={{ color: "#1e1e2d" }}>
            Layout Master Design
          </h4>
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-md-4">
              <label htmlFor="layoutId" className="form-label">
                Layout <span className="text-danger">*</span>
              </label>
              <select
                id="layoutId"
                name="layoutId"
                value={form.layoutId}
                onChange={onChange}
                ref={layoutIdRef}
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

            <div className="col-md-3">
              <label htmlFor="rowNum" className="form-label">
                Row Number <span className="text-danger">*</span>
              </label>
              <input
                id="rowNum"
                name="rowNum"
                type="number"
                value={form.rowNum}
                onChange={onChange}
                className="form-control"
                required
                min={1}
                max={100}
                placeholder="Enter Row Number"
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="deckType" className="form-label">
                Deck Type <span className="text-danger">*</span>
              </label>
              <input
                id="deckType"
                name="deckType"
                value={form.deckType}
                onChange={onChange}
                className="form-control"
                required
                placeholder="Enter Deck Type"
              />
            </div>

            {Number(form.rowNum) > 0 && (
              <div className="col-12">
                <table className="table table-borderless text-center">
                  <thead>
                    <tr>
                      <th style={{ color: "#1e1e2d", fontSize: ".9rem" }}>Sl.No</th>
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const seatLabel = (idx % 3) + 1;
                        return (
                          <React.Fragment key={idx}>
                            <th style={{ color: "#1e1e2d", fontSize: ".9rem" }}>{`Seat No ${seatLabel}`}</th>
                            <th style={{ color: "#1e1e2d", fontSize: ".9rem" }}>{`Seat Desc ${seatLabel}`}</th>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Number(form.rowNum) || 0 }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>{rowIndex + 1}</td>
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <React.Fragment key={idx}>
                            <td>
                              <input
                                type="text"
                                name={`seatNo_${rowIndex}_${idx}`}
                                value={form[`seatNo_${rowIndex}_${idx}`] || ""}
                                onChange={onChange}
                                className="form-control form-control-sm seat-input-small"
                                maxLength={3}
                                placeholder="No"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                name={`seatDesc_${rowIndex}_${idx}`}
                                value={form[`seatDesc_${rowIndex}_${idx}`] || ""}
                                onChange={onChange}
                                className="form-control form-control-sm seat-input-small"
                                maxLength={3}
                                placeholder="Desc"
                              />
                            </td>
                          </React.Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-end">
                  <button
                    type="submit"
                    className="btn px-4"
                    style={{ backgroundColor: "#1e1e2d", color: "#fff", border: "none" }}
                  >
                    {form.layid ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {list.length > 0 && (
        <div className="card shadow mt-5 border-0 rounded-4 bg-white">
          <div className="card-body p-4">
            <h5 className="text-center mb-4 fw-bold" style={{ color: "#1e1e2d" }}>
              Layout Design Records
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                  <tr>
                    <th>Layout ID</th>
                    <th>Row Number</th>
                    <th>Deck Type</th>
                    <th>Left Side 1</th>
                    <th>Left Side 1 Desc</th>
                    <th>Right Side 1</th>
                    <th>Right Side 1 Desc</th>
                    <th>Status</th>
                    <th style={{ minWidth: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.LAYID}>
                      <td>{item.LAYOUTID}</td>
                      <td>{item.ROWNUM}</td>
                      <td>{item.DECKTYPE}</td>
                      <td>{item.LAYLEFTSIDE1}</td>
                      <td>{item.LAYLEFTSIDE1DESC}</td>
                      <td>{item.LAYRIGHTSIDE1}</td>
                      <td>{item.LAYRIGHTSIDE1DESC}</td>
                      <td>{item.STATUS === "A" ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{ backgroundColor: "#1e1e2d", color: "#fff", border: "none" }}
                            onClick={() => handleEdit(item)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: item.STATUS === "A" ? "#6c757d" : "#2a5298",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => handleToggleStatus(item.LAYID, item.STATUS)}
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

export default LayoutMasterDesign;
