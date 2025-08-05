import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  MdDashboard,
  MdOutlineAssessment,
  MdManageAccounts,
  MdPlace,
  MdHotelClass,
  MdDriveFileRenameOutline,
} from "react-icons/md";
import {
  FaShieldAlt,
  FaCube,
  FaUserAstronaut,
  FaRoute,
  FaPlaceOfWorship,
  FaBusAlt,
  FaSitemap,
} from "react-icons/fa";
import { AiOutlineSchedule } from "react-icons/ai";
import { LuLayoutPanelLeft } from "react-icons/lu";
import { LiaTruckPickupSolid } from "react-icons/lia";
import { SiOpenaccess } from "react-icons/si";
import { TbReportSearch } from "react-icons/tb";

import BASE_URL from "../../configAPI"; // Make sure this is correct
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ collapsed }) => {
  const [openMasters, setOpenMasters] = useState(false);
  const [openPlaceMaster, setOpenPlaceMaster] = useState(false);
  const [accessList, setAccessList] = useState([]);

  const sidebarWidth = collapsed ? 80 : 250;

  // Fetch access data on component mount
  useEffect(() => {
    const fetchAccess = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/module/moduleAccess`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccessList(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching access list:", err);
      }
    };

    fetchAccess();
  }, []);

  // Check access helper
  const hasAccess = (name) =>
    accessList.some(
      (item) => item.MODULENAME?.toLowerCase() === name.toLowerCase()
    );

  return (
    <div
      className="sidebar-container"
      style={{
        width: `${sidebarWidth}px`,
        background: "#1e1e2d",
        color: "#fff",
        transition: "width 0.3s ease",
        whiteSpace: "nowrap",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        height: "100vh",
        borderTopRightRadius: "12px",
        borderBottomRightRadius: "12px",
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          overflowY: "auto",
          height: "100%",
          padding: "1rem 0.75rem",
        }}
      >
        <h5 className="fw-bold mb-4 text-center d-flex justify-content-center align-items-center gap-2">
          <FaShieldAlt size={20} />
          {!collapsed && <span>PR Admin</span>}
        </h5>

        <ul className="nav flex-column gap-2">
          {hasAccess("dashboard") && (
            <SidebarItem
              to="/dashboard"
              icon={<MdDashboard />}
              label="Dashboard"
              collapsed={collapsed}
            />
          )}

          {/* Masters */}
          {(hasAccess("lookupMaster") ||
            hasAccess("placeMaster") ||
            hasAccess("pickupMaster") ||
            hasAccess("aliasMaster") ||
            hasAccess("userMaster") ||
            hasAccess("scheduleMaster") ||
            hasAccess("routeMaster") ||
            hasAccess("classMaster") ||
            hasAccess("layoutMaster") ||
            hasAccess("moduleMaster") ||
            hasAccess("userAccessManage") ||
            hasAccess("serviceMaster")) && (
            <li className="nav-item">
              <div
                className="nav-link text-white px-3 py-2 rounded hover-effect d-flex justify-content-between align-items-center"
                onClick={() => setOpenMasters(!openMasters)}
                style={{ cursor: "pointer" }}
              >
                <span className="d-flex align-items-center">
                  <MdManageAccounts className="me-2" />
                  {!collapsed && "Masters"}
                </span>
                {!collapsed && <span>{openMasters ? "▾" : "▸"}</span>}
              </div>

              {!collapsed && openMasters && (
                <ul className="nav flex-column ps-3 mt-1">
                  {hasAccess("lookupMaster") && (
                    <SidebarItem
                      to="/lookupMaster"
                      icon={<FaCube />}
                      label="Lookup Master"
                      collapsed={collapsed}
                    />
                  )}

                  {(hasAccess("placeMaster") ||
                    hasAccess("pickupMaster") ||
                    hasAccess("aliasMaster")) && (
                    <li className="nav-item">
                      <div
                        className="nav-link text-white px-3 py-1 rounded hover-effect d-flex justify-content-between align-items-center"
                        onClick={() => setOpenPlaceMaster(!openPlaceMaster)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="d-flex align-items-center gap-2">
                          <FaPlaceOfWorship size={18} />
                          {!collapsed && "Place Master"}
                        </span>
                        {!collapsed && <span>{openPlaceMaster ? "▾" : "▸"}</span>}
                      </div>

                      {!collapsed && openPlaceMaster && (
                        <ul className="nav flex-column ps-4">
                          {hasAccess("placeMaster") && (
                            <SidebarItem
                              to="/placeMaster"
                              icon={<MdPlace />}
                              label="Place Master"
                              collapsed={collapsed}
                            />
                          )}
                          {hasAccess("pickupMaster") && (
                            <SidebarItem
                              to="/pickupMaster"
                              icon={<LiaTruckPickupSolid />}
                              label="Pickup Master"
                              collapsed={collapsed}
                            />
                          )}
                          {hasAccess("aliasMaster") && (
                            <SidebarItem
                              to="/aliasMaster"
                              icon={<MdDriveFileRenameOutline />}
                              label="Alias Master"
                              collapsed={collapsed}
                            />
                          )}
                        </ul>
                      )}
                    </li>
                  )}

                  {hasAccess("userMaster") && (
                    <SidebarItem
                      to="/userMaster"
                      icon={<FaUserAstronaut />}
                      label="User Master"
                      collapsed={collapsed}
                    />
                  )}
                  {hasAccess("scheduleMaster") && (
                    <SidebarItem
                      to="/scheduleMaster"
                      icon={<AiOutlineSchedule />}
                      label="Schedule Master"
                      collapsed={collapsed}
                    />
                  )}
                  {hasAccess("routeMaster") && (
                    <SidebarItem
                      to="/routeMaster"
                      icon={<FaRoute />}
                      label="Route Master"
                      collapsed={collapsed}
                    />
                  )}
                  {hasAccess("classMaster") && (
                    <SidebarItem
                      to="/classMaster"
                      icon={<MdHotelClass />}
                      label="Class Master"
                      collapsed={collapsed}
                    />
                  )}
                  {hasAccess("layoutMaster") && (
                    <SidebarItem
                      to="/layoutMaster"
                      icon={<LuLayoutPanelLeft />}
                      label="Layout Master"
                      collapsed={collapsed}
                    />
                  )}
                  {hasAccess("moduleMaster") && (
                    <SidebarItem
                      to="/moduleMaster"
                      icon={<FaSitemap />}
                      label="Module Master"
                      collapsed={collapsed}
                    />
                  )}
                  {hasAccess("userAccessManage") && (
                    <SidebarItem
                      to="/userAccessManage"
                      icon={<SiOpenaccess />}
                      label="User Access"
                      collapsed={collapsed}
                    />
                  )}
                  {hasAccess("serviceMaster") && (
                    <SidebarItem
                      to="/serviceMaster"
                      icon={<FaBusAlt />}
                      label="Service Master"
                      collapsed={collapsed}
                    />
                  )}
                </ul>
              )}
            </li>
          )}

          {hasAccess("reports") && (
            <SidebarItem
              to="/reports"
              icon={<TbReportSearch />}
              label="Reports"
              collapsed={collapsed}
            />
          )}
        </ul>
      </div>

      {/* Scrollbar styling */}
      <style>{`
        .sidebar-container ::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-container ::-webkit-scrollbar-track {
          background: #1e1e2d;
          border-radius: 12px;
        }
        .sidebar-container ::-webkit-scrollbar-thumb {
          background-color: #3a3a50;
          border-radius: 12px;
        }
        .hover-effect:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transition: background-color 0.3s;
        }
      `}</style>
    </div>
  );
};

const SidebarItem = ({ to, icon, label, collapsed }) => (
  <li className="nav-item">
    <Link
      to={to}
      className="nav-link text-white px-3 py-2 rounded hover-effect d-flex align-items-center gap-2"
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  </li>
);

export default Sidebar;
