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
    selectlayoutId: "", // ✅ used for fetching
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

  /** 🔽 Load dropdown options */
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

  useEffect(() => {
    layoutDropDown();
  }, []);

  /** 🔽 Fetch layout designs when selectlayoutId changes */
  useEffect(() => {
    if (!form.selectlayoutId) {
      setList([]);
      return;
    }

    axios
      .post(
        `${BASE_URL}/layoutDesignFetch/FetchData`,
        { layoutId: form.selectlayoutId }, // ✅ body
        getAuthHeaders() // ✅ headers
      )
      .then((res) => setList(res.data.data || []))
      .catch((err) => console.error("Fetch error:", err.response || err));
  }, [form.selectlayoutId]);

  /** 🔽 Form onChange handler */
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "rowNum") {
      if (Number(value) > 100) return;
      if (Number(value) < 1 && value !== "") return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  /** 🔽 Handle Edit */
 const handleEdit = (item) => {
  setForm({
    layid: item.ID,
    layoutId: item.LAYOUT_ID,
    rowNum: item.ROW_NO,
    deckType: item.DECK_TYPE,

    layLeftSide1: item.LEFTSIDE,
    layLeftSide1Desc: item.LEFTDESCRIPTION,
    layLeftSide2: item.LEFTSIDE2,
    layLeftSide2Desc: item.LEFTSIDE2DESCRIPTION,
    layLeftSide3: item.LEFTSIDE3,
    layLeftSide3Desc: item.LEFTSIDEDESCRIPTION3,

    layRightSide1: item.RIGHTSIDE,
    layRightSide1Desc: item.RIGHTSIDEDESCRIPTION,
    layRightSide2: item.RIGHTSIDE2,
    layRightSide2Desc: item.RIGHTSIDE2DESCRIPTION,
    layRightSide3: item.RIGHTSIDE3,
    layRightSide3Desc: item.RIGHTSIDE3DESCRIPTION,

    selectlayoutId: form.selectlayoutId,
  });
};


  /** 🔽 Submit form (Insert / Update) */
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.layoutId || !form.rowNum || !form.deckType) {
    setMessage("Please fill all required fields.");
    return;
  }

  let res;

  try {
    if (form.layid) {
      // 🔹 UPDATE single row
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

       res=await axios.put(
        `${BASE_URL}/layoutDesignMaster/update`,
        payloadUpdate,
        getAuthHeaders()
      );

      setMessage(res.data.meta.message);
    } else {
      // 🔹 INSERT multiple rows (loop)
      for (let rowIndex = 0; rowIndex < Number(form.rowNum); rowIndex++) {
        const payloadInsert = {
          layoutId: form.layoutId,
          rowNum: rowIndex + 1,
          deckType: form.deckType,
          layLeftSide1: form[`layLeftSide1_${rowIndex}`] || "",
          layLeftSide1Desc: form[`layLeftSide1Desc_${rowIndex}`] || "",
          layLeftSide2: form[`layLeftSide2_${rowIndex}`] || "",
          layLeftSide2Desc: form[`layLeftSide2Desc_${rowIndex}`] || "",
          layLeftSide3: form[`layLeftSide3_${rowIndex}`] || "",
          layLeftSide3Desc: form[`layLeftSide3Desc_${rowIndex}`] || "",
          layRightSide1: form[`layRightSide1_${rowIndex}`] || "",
          layRightSide1Desc: form[`layRightSide1Desc_${rowIndex}`] || "",
          layRightSide2: form[`layRightSide2_${rowIndex}`] || "",
          layRightSide2Desc: form[`layRightSide2Desc_${rowIndex}`] || "",
          layRightSide3: form[`layRightSide3_${rowIndex}`] || "",
          layRightSide3Desc: form[`layRightSide3Desc_${rowIndex}`] || "",
        };

        res= await axios.post(
          `${BASE_URL}/layoutMasterDesign/insertion`,
          payloadInsert,
          getAuthHeaders()
        );
      }

      setMessage(res.data.meta.message);
    }

    // ✅ Refresh after insert/update
    const fresh = await axios.post(
      `${BASE_URL}/layoutDesignFetch/FetchData`,
      { layoutId: form.layoutId },
      getAuthHeaders()
    );
    setList(fresh.data.data || []);
    setForm(initialForm);
  } catch (err) {
    console.error("Save error:", err.response || err);
    setMessage(err.response?.data?.meta?.message || "Error saving layout.");
  }
};


  /** 🔽 Toggle Status */
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (
      !window.confirm(
        `Change status to ${newStatus === "A" ? "Active" : "Inactive"}?`
      )
    )
      return;

    try {
      const res = await axios.put(
        `${BASE_URL}/layoutStatusUpdate/UpdateStatus`,
        { layoutId: id, layoutStatus: newStatus },
        getAuthHeaders()
      );

      setMessage(res.data.meta.message || "Status updated.");

      if (res.data.meta.success) {
        // ✅ Refresh list
        const fresh = await axios.post(
          `${BASE_URL}/layoutDesignFetch/FetchData`,
          { layoutId: form.layoutId },
          getAuthHeaders()
        );
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
            message.toLowerCase().includes("error") ||
            message.toLowerCase().includes("please")
              ? "alert-danger"
              : "alert-success"
          } mx-auto text-center px-3 py-2 shadow`}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            borderRadius: 12,
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}

      {/* ===== Insert/Update Form ===== */}
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4 bg-white">
          <h4 className="text-center mb-4" style={{ color: "#1e1e2d" }}>
            Layout Master Design
          </h4>
          <form onSubmit={handleSubmit} className="row g-4">
            {/* Layout Dropdown */}
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

            {/* Row Number */}
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

            {/* Deck Type */}
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

            {/* Seat Inputs */}
      {/* Seat Inputs */}
{Number(form.rowNum) > 0 && (
  <div className="col-12">
    <table className="table table-borderless text-center">
      <thead>
        <tr>
          <th>Row</th>
          <th>Left Seat 1</th>
          <th>Left Seat 1 Desc</th>
          <th>Left Seat 2</th>
          <th>Left Seat 2 Desc</th>
          <th>Left Seat 3</th>
          <th>Left Seat 3 Desc</th>
          <th>Right Seat 1</th>
          <th>Right Seat 1 Desc</th>
          <th>Right Seat 2</th>
          <th>Right Seat 2 Desc</th>
          <th>Right Seat 3</th>
          <th>Right Seat 3 Desc</th>
        </tr>
      </thead>
 <tbody>
  {Array.from({ length: Number(form.rowNum) }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      <td>{rowIndex + 1}</td>

      {/* Left Side 1 */}
      <td>
        <input
          type="text"
          name={`layLeftSide1_${rowIndex}`}
          value={form[`layLeftSide1_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-control form-control-sm"
        />
      </td>
      <td>
        <select
          name={`layLeftSide1Desc_${rowIndex}`}
          value={form[`layLeftSide1Desc_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-select form-select-sm"
        >
          <option value="">Select</option>
          <option value="SEATER">Seater</option>
          <option value="SLEEPER">Sleeper</option>
        </select>
      </td>

      {/* Left Side 2 */}
      <td>
        <input
          type="text"
          name={`layLeftSide2_${rowIndex}`}
          value={form[`layLeftSide2_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-control form-control-sm"
        />
      </td>
      <td>
        <select
          name={`layLeftSide2Desc_${rowIndex}`}
          value={form[`layLeftSide2Desc_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-select form-select-sm"
        >
          <option value="">Select</option>
          <option value="SEATER">Seater</option>
          <option value="SLEEPER">Sleeper</option>
        </select>
      </td>

      {/* Left Side 3 */}
      <td>
        <input
          type="text"
          name={`layLeftSide3_${rowIndex}`}
          value={form[`layLeftSide3_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-control form-control-sm"
        />
      </td>
      <td>
        <select
          name={`layLeftSide3Desc_${rowIndex}`}
          value={form[`layLeftSide3Desc_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-select form-select-sm"
        >
          <option value="">Select</option>
          <option value="SEATER">Seater</option>
          <option value="SLEEPER">Sleeper</option>
        </select>
      </td>

      {/* Right Side 1 */}
      <td>
        <input
          type="text"
          name={`layRightSide1_${rowIndex}`}
          value={form[`layRightSide1_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-control form-control-sm"
        />
      </td>
      <td>
        <select
          name={`layRightSide1Desc_${rowIndex}`}
          value={form[`layRightSide1Desc_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-select form-select-sm"
        >
          <option value="">Select</option>
          <option value="SEATER">Seater</option>
          <option value="SLEEPER">Sleeper</option>
        </select>
      </td>

      {/* Right Side 2 */}
      <td>
        <input
          type="text"
          name={`layRightSide2_${rowIndex}`}
          value={form[`layRightSide2_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-control form-control-sm"
        />
      </td>
      <td>
        <select
          name={`layRightSide2Desc_${rowIndex}`}
          value={form[`layRightSide2Desc_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-select form-select-sm"
        >
          <option value="">Select</option>
          <option value="SEATER">Seater</option>
          <option value="SLEEPER">Sleeper</option>
        </select>
      </td>

      {/* Right Side 3 */}
      <td>
        <input
          type="text"
          name={`layRightSide3_${rowIndex}`}
          value={form[`layRightSide3_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-control form-control-sm"
        />
      </td>
      <td>
        <select
          name={`layRightSide3Desc_${rowIndex}`}
          value={form[`layRightSide3Desc_${rowIndex}`] || ""}
          onChange={onChange}
          className="form-select form-select-sm"
        >
          <option value="">Select</option>
          <option value="SEATER">Seater</option>
          <option value="SLEEPER">Sleeper</option>
        </select>
      </td>
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

      {/* ===== Fetch Dropdown ===== */}
      <div className="card shadow border-0 rounded-4 mb-4">
        <div className="card-body bg-light p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="selectlayoutId" className="form-label">
                Layout <span className="text-danger">*</span>
              </label>
              <select
                id="selectlayoutId"
                name="selectlayoutId"
                value={form.selectlayoutId}
                onChange={onChange}
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
          </div>
        </div>
      </div>

      {/* ===== Records Table ===== */}
      {list.length > 0 && (
        <div className="card shadow mt-5 border-0 rounded-4 bg-white">
          <div className="card-body p-4">
            <h5
              className="text-center mb-4 fw-bold"
              style={{ color: "#1e1e2d" }}
            >
              Layout Design Records
            </h5>
            <div className="table-responsive"
            style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
              <table className="table table-hover align-middle text-center">
                <thead style={{ backgroundColor: "#1e1e2d", color: "#fff" }}>
                 <tr>
    <th>Row Number</th>
    <th>Deck Type</th>
    <th>Left Side 1</th>
    <th>Left Side 1 Desc</th>
    <th>Left Side 2</th>
    <th>Left Side 2 Desc</th>
    <th>Left Side 3</th>
    <th>Left Side 3 Desc</th>
    <th>Right Side 1</th>
    <th>Right Side 1 Desc</th>
    <th>Right Side 2</th>
    <th>Right Side 2 Desc</th>
    <th>Right Side 3</th>
    <th>Right Side 3 Desc</th>
    <th>Status</th>
    <th style={{ minWidth: 140 }}>Actions</th>
  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.ID}>
      <td>{item.ROW_NO}</td>
      <td>{item.DECK_TYPE}</td>
      <td>{item.LEFTSIDE}</td>
      <td>{item.LEFTDESCRIPTION}</td>
      <td>{item.LEFTSIDE2}</td>
      <td>{item.LEFTSIDE2DESCRIPTION}</td>
      <td>{item.LEFTSIDE3}</td>
      <td>{item.LEFTSIDEDESCRIPTION3}</td>
      <td>{item.RIGHTSIDE}</td>
      <td>{item.RIGHTSIDEDESCRIPTION}</td>
      <td>{item.RIGHTSIDE2}</td>
      <td>{item.RIGHTSIDE2DESCRIPTION}</td>
      <td>{item.RIGHTSIDE3}</td>
      <td>{item.RIGHTSIDE3DESCRIPTION}</td>
                      <td>{item.STATUS === "A" ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: "#1e1e2d",
                              color: "#fff",
                              border: "none",
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
                              border: "none",
                            }}
                            onClick={() =>
                              handleToggleStatus(item.LAYID, item.STATUS)
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

export default LayoutMasterDesign;
