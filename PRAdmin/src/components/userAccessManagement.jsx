import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../configAPI";

const UserAccessManagement = () => {
  const [activeTab, setActiveTab] = useState("menu"); 

  const [menuItem, setMenuItem] = useState({ menuKey: "", menuLabel: "" });
  const [menuMessage, setMenuMessage] = useState("");

  const [userAccess, setUserAccess] = useState({
    username: "",
    menuKeys: [],
  });
  const [menuOptions, setMenuOptions] = useState([]);
  const [accessMessage, setAccessMessage] = useState("");

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/menuItem/getall`);
      setMenuOptions(res.data || []);
    } catch (err) {
      console.error("Failed to load menus", err);
    }
  };

  const handleMenuItemChange = (e) => {
    const { name, value } = e.target;
    setMenuItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserAccessChange = (e) => {
    const { name, value } = e.target;
    setUserAccess((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuCheckbox = (menuKey) => {
    setUserAccess((prev) => {
      const alreadySelected = prev.menuKeys.includes(menuKey);
      const updatedKeys = alreadySelected
        ? prev.menuKeys.filter((key) => key !== menuKey)
        : [...prev.menuKeys, menuKey];
      return { ...prev, menuKeys: updatedKeys };
    });
  };

  const handleMenuItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/menuItem/create`, menuItem);
      setMenuMessage("Menu item created successfully.");
      setMenuItem({ menuKey: "", menuLabel: "" });
      fetchMenuItems();
    } catch (err) {
      setMenuMessage("Failed to create menu item.");
      console.error(err);
    }
  };

  const handleUserAccessSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/userAccess/create`, userAccess);
      setAccessMessage("User access updated successfully.");
      setUserAccess({ username: "", menuKeys: [] });
    } catch (err) {
      setAccessMessage("Failed to update user access.");
      console.error(err);
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex gap-4 mb-4">
        <button
          className={`btn ${activeTab === "menu" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => setActiveTab("menu")}
        >
          Add Menu Item
        </button>
        <button
          className={`btn ${activeTab === "access" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => setActiveTab("access")}
        >
          User Access Management
        </button>
      </div>

      {activeTab === "menu" && (
        <div className="card shadow border-0 rounded-4 p-4">
          <h4 className="fw-semibold mb-3">Add New Menu Item</h4>
          {menuMessage && <div className="alert alert-info">{menuMessage}</div>}
          <form onSubmit={handleMenuItemSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Menu Key</label>
              <input
                type="text"
                name="menuKey"
                value={menuItem.menuKey}
                onChange={handleMenuItemChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Menu Label</label>
              <input
                type="text"
                name="menuLabel"
                value={menuItem.menuLabel}
                onChange={handleMenuItemChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-dark px-4">
                Save Menu
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "access" && (
        <div className="card shadow border-0 rounded-4 p-4">
          <h4 className="fw-semibold mb-3">Assign Menus to User</h4>
          {accessMessage && <div className="alert alert-info">{accessMessage}</div>}
          <form onSubmit={handleUserAccessSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={userAccess.username}
                onChange={handleUserAccessChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Select Menu Access</label>
              <div className="d-flex flex-wrap gap-3">
                {menuOptions.map((item) => (
                  <div key={item.menuKey} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`chk_${item.menuKey}`}
                      checked={userAccess.menuKeys.includes(item.menuKey)}
                      onChange={() => handleMenuCheckbox(item.menuKey)}
                    />
                    <label className="form-check-label" htmlFor={`chk_${item.menuKey}`}>
                      {item.menuLabel}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-dark px-4">
                Assign Access
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserAccessManagement;
