import React, { useState } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";

const AliasMaster = () => {
  const [form, setAliasForm] = useState({
    aliasId: "",
    placeId: "",
    placeLabel: "",
    aliasName: "",
  });
  const [placeAliases, setPlaceAliases] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  const loadOptions = async (inputValue) => {
    if (inputValue.length < 3) return [];
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/dropdown/getPlaces",
        { place: inputValue },
        getAuthHeaders()
      );
      return res.data.data.map((pt) => ({
        value: pt.PM_PLACEID,
        label: pt.PM_PLACENAME,
      }));
    } catch (err) {
      console.error("Place fetch error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceChange = async (selectedOption) => {
    const placeId = selectedOption?.value || "";
    const placeLabel = selectedOption?.label || "";
    setAliasForm((p) => ({ ...p, placeId, placeLabel }));

    if (placeId) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/placeAlias/view",
          { placeId },
          getAuthHeaders()
        );
        setPlaceAliases(res.data.data || []);
      } catch (err) {
        console.error("Fetch aliases:", err);
        setPlaceAliases([]);
      }
    } else {
      setPlaceAliases([]);
    }
    setAliasForm((p) => ({ ...p, aliasId: "", aliasName: "" }));
  };

  const handleAliasPlaceChange = (selectedOption) => {
    setAliasForm((p) => ({
      ...p,
      aliasName: selectedOption?.label || "",
    }));
  };

  const handleAliasSubmit = async (e) => {
    e.preventDefault();
    const { aliasId, aliasName, placeId, placeLabel } = form;
    if (!aliasName || !placeId) {
      setMessage("Place and alias name are required.");
      return;
    }

    const isUpdate = Boolean(aliasId);
    const url = isUpdate
      ? "http://localhost:5000/api/placeAlias/update"
      : "http://localhost:5000/api/placeAlias/insert";
    const method = isUpdate ? "put" : "post";
    const payload = isUpdate
      ? { aliasId, aliasName, placeId }
      : { aliasName, placeId };

    try {
      const res = await axios[method](url, payload, getAuthHeaders());
      setMessage(res.data.meta.message);

      // Refresh list & reset form
      await handlePlaceChange({ value: placeId, label: placeLabel });
    } catch (err) {
      console.error("Save alias failed:", err);
      setMessage("Failed to save alias.");
    } finally {
      setAliasForm((p) => ({
        aliasId: "",
        placeId,
        placeLabel,
        aliasName: "",
      }));
    }
  };

  const handleAliasEdit = (alias) => {
    setAliasForm({
      aliasId: alias.PLACE_ALIAS_ID,
      placeId: alias.PLACE_ID,
      placeLabel: alias.PLACE_NAME,
      aliasName: alias.PLACE_ALIAS_NAME,
    });
  };

  const toggleAliasStatus = async (aliasId, currentStatus) => {
    const newStatus = currentStatus === "A" ? "I" : "A";
    if (!window.confirm(`Switch status to ${newStatus === "A" ? "Active" : "Inactive"}?`)) {
      return;
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/placeAlias/toggleStatus",
        { aliasId, status: newStatus },
        getAuthHeaders()
      );
      setMessage(res.data.meta.message);
      
      // Refresh the aliases
      await handlePlaceChange({ value: form.placeId, label: form.placeLabel });
    } catch (err) {
      console.error("Toggle status failed:", err);
      setMessage("Status update failed.");
    }
  };

  return (
    <div className="container my-5">
      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="card shadow rounded-4 mb-5">
        <div className="card-body p-4">
          <h4 className="text-center mb-4">PLACE ALIAS FORM</h4>
          <form onSubmit={handleAliasSubmit} className="row g-4">
            <div className="col-md-6">
              <label className="form-label">Place Name*</label>
              <AsyncSelect
                loadOptions={loadOptions}
                value={
                  form.placeId
                    ? { value: form.placeId, label: form.placeLabel }
                    : null
                }
                onChange={handlePlaceChange}
                isClearable
                placeholder="Search place"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Alias Name*</label>
              <AsyncSelect
                loadOptions={loadOptions}
                value={form.aliasName ? { label: form.aliasName, value: "" } : null}
                onChange={handleAliasPlaceChange}
                isClearable
                placeholder="Type alias"
              />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-dark px-4">
                {form.aliasId ? "Update Alias" : "Add Alias"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow rounded-4">
        <div className="card-body p-4">
          <h5>Existing Place Aliases</h5>
          <table className="table table-bordered mt-4 text-center">
            <thead>
              <tr>
                <th>Alias Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {placeAliases.length > 0 ? (
                placeAliases.map((alias) => (
                  <tr key={alias.PLACE_ALIAS_ID}>
                    <td>{alias.PLACE_ALIAS_NAME}</td>
                    <td>{alias.STATUS === "A" ? "Active" : "Inactive"}</td>
                    <td>
                        <button
                            className="btn btn-sm rounded-pill px-3"
                            style={{
                              backgroundColor: "#1e1e2d",
                              color: "#fff",
                              border: "none",
                            }}
                             onClick={() => handleAliasEdit(alias)}
                          >
                            ✏️ Edit
                          </button>
                      <button
                         className="btn btn-sm rounded-pill px-3"
                                     style={{
                                      backgroundColor: alias.STATUS === 'A' ? '#6c757d' : '#2a5298',
                                      color: '#fff',
                                     border: 'none',
                                           }}
                        onClick={() =>
                          toggleAliasStatus(alias.PLACE_ALIAS_ID, alias.STATUS)
                        }
                      >
                        🔄 Toggle
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No aliases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AliasMaster;
