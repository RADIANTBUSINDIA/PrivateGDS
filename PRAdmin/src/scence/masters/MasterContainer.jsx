import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../configAPI";
import ClassMaster from "./ClassMaster";
import LayoutMaster from "./layoutMaster";
import LayoutMasterDesign from "./LayoutMasterDesign";

const MasterContainer = () => {
  const [activeTab, setActiveTab] = useState("classMaster"); // Default: Class Master
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  
  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/module/moduleAccess`, getAuthHeaders());
        setAccessList(res.data?.data || []);
      } catch (error) {
        console.error("Access fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccess();
  }, []);

  const hasAccess = (name) =>
    accessList.some((item) => item.MODULENAME?.toLowerCase() === name.toLowerCase());

  if (loading) return <p className="text-center my-5">Loading access...</p>;

  return (
    <div className="container my-5">
     
      <div className="d-flex justify-content-center gap-3 mb-4">
        {hasAccess("classMaster") && (
          <button
            className={`btn ${activeTab === "classMaster" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setActiveTab("classMaster")}
          >
            Class Master
          </button>
        )}

        {hasAccess("layoutMaster") && (
          <button
            className={`btn ${activeTab === "layoutMaster" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setActiveTab("layoutMaster")}
          >
            Layout Master
          </button>
        )}

        {hasAccess("layoutMasterDesign") && (
          <button
            className={`btn ${activeTab === "layoutMasterDesign" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setActiveTab("layoutMasterDesign")}
          >
            Layout Design Master
          </button>
        )}
      </div>

      
      <div>
        {activeTab === "classMaster" && hasAccess("classMaster") && <ClassMaster />}
        {activeTab === "layoutMaster" && hasAccess("layoutMaster") && <LayoutMaster />}
        {activeTab === "layoutMasterDesign" &&
          hasAccess("layoutMasterDesign") && <LayoutMasterDesign />}
      </div>
    </div>
  );
};

export default MasterContainer;
