import React, { useState } from "react";
import {
  MdDashboard,
  MdOutlineAssessment,
  MdManageAccounts,
} from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaShieldAlt } from "react-icons/fa";
import { MdPlace } from "react-icons/md";
import { FaCube } from "react-icons/fa";
import { FaUserAstronaut } from "react-icons/fa";
import { AiOutlineSchedule } from "react-icons/ai";
import { RiMenuUnfold3Line } from "react-icons/ri";
import { RiMenuFold3Line } from "react-icons/ri";


const Sidebar = () => {
  const [openMasters, setOpenMasters] = useState(false);

  return (
    <div
      className="d-flex flex-column vh-100 p-3"
      style={{
        width: "280px",
        background: " #1e1e2d", 
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        borderTopRightRadius: "12px",
        borderBottomRightRadius: "12px",
        position: "sticky",
        top: 0,
      }}
    >
      <h4 className="text-white fw-bold mb-4 text-center border-bottom pb-3 d-flex align-items-center justify-content-center gap-2">
        <FaShieldAlt size={20} />
        PR Admin
      </h4>

      <ul className="nav flex-column gap-2">
        <li className="nav-item">
          <a
            href="/"
            className="nav-link text-white px-3 py-2 rounded hover-effect"
          >
            <MdDashboard style={{ marginRight: "8px" }} />
            Dashboard
          </a>
        </li>

        <li className="nav-item">
          <a
            href="/form"
            className="nav-link text-white px-3 py-2 rounded hover-effect"
          >
            <MdOutlineAssessment style={{ marginRight: "8px" }} />
            Reports
          </a>
        </li>

        <li className="nav-item">
          <div
            className="nav-link text-white px-3 py-2 rounded hover-effect d-flex justify-content-between align-items-center"
            onClick={() => setOpenMasters(!openMasters)}
            style={{ cursor: "pointer" }}
          >
            <span className="d-flex align-items-center">
              <MdManageAccounts style={{ marginRight: "8px" }} />
              Masters
            </span>
            <span>{openMasters ? "▾" : "▸"}</span>
          </div>

          {openMasters && (
            <ul className="nav flex-column ps-3 mt-1">
              <li className="nav-item">
                <a
                  href="/lookUp"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                  <FaCube size={18} />
                  Lookup Master
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="/placeMaster"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                  <MdPlace size={18} />
                  Place Master
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="/userMaster"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                  <FaUserAstronaut size={18} />
                  User Master
                </a>
              </li>
                   <li className="nav-item">
                <a
                  href="/scheduleMaster"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                  <AiOutlineSchedule size={18} />
                  Schedule Master
                </a>
              </li>
               <li className="nav-item">
                <a
                  href="/routeMaster"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                  <AiOutlineSchedule size={18} />
                  Route Master
                </a>
              </li>
               <li className="nav-item">
                <a
                  href="/pickUp"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                 <MdPlace size={18} />
                  Pickup Master
                </a>
              </li>

               <li className="nav-item">
                <a
                 href="/alias"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                  <MdPlace size={18} />
                  Alias Master
                </a>
              </li>


               <li className="nav-item">
                <a
                 href="/classMaster"
                  className="nav-link text-white px-3 py-1 rounded hover-effect d-flex align-items-center gap-2"
                >
                  <MdPlace size={18} />
                  Class Master

                </a>
              </li>
            </ul>
          )}
        </li>

        <li className="nav-item">
          <a
            href="/userAccessManage"
            className="nav-link text-white px-3 py-2 rounded hover-effect"
          >
            ⚙️ User Access Management
          </a>
        </li>
      </ul>

      <style>{`
        .hover-effect:hover {
          background-color: rgba(235, 239, 244, 0.2);
          transition: background-color 0.3s;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
