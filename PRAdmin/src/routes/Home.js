import React, { useState } from 'react';
import Sidebar from '../scence/global/sidebar';
import Topbar from '../scence/global/Topbar';
import { Routes, Route ,Navigate } from 'react-router-dom';
import { RxCross1 } from 'react-icons/rx';
import { IoReorderThree } from 'react-icons/io5';

import FormPage from '../scence/form/FormWithTable';
import LookupMaster from '../scence/masters/lookUpMaster';
import UserMaster from '../scence/masters/userMaster';
import ChangePassword from '../components/changePassword';
import UserAccessManagement from '../scence/masters/userAccessManagement';
import RouteStageMaster from '../scence/masters/RouteStageMaster';
import PickUpPointMaster from '../scence/masters/PickUpPointMaster';
import AliasMaster from '../scence/masters/AliasMaster';
import ClassMaster from '../scence/masters/ClassMaster';
import PlaceMaster from '../scence/masters/placeMaster';
import ZoneMaster from '../scence/masters/zonemaster';
import LayoutMaster from '../scence/masters/layoutMaster';
import ModuleMaster from '../scence/masters/moduleMaster';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import Dashboard from '../scence/dashboard/dashboard';
import ServiceMaster from '../scence/masters/serviceMaster';

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 80 : 250;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        style={{
          width: `${sidebarWidth}px`,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          backgroundColor: '#fff',
          zIndex: 1000,
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          transition: 'width 0.3s',
        }}
      >
        <Sidebar collapsed={collapsed} />
      </div>

{/* Toggle Button - Top Left */}
<div
  className="position-absolute"
  style={{
    top: '18px',
    left: collapsed ? '80px' : '250px',
    zIndex: 1100,
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '0 4px 4px 0',
    transition: 'left 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
  onClick={() => setCollapsed(!collapsed)}
>
  {collapsed ? <FaArrowRight size={20} /> : <FaArrowLeft size={20} />}
</div>



      {/* Main Content Area */}
      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          transition: 'margin-left 0.3s, width 0.3s',
        }}
      >
        {/* Topbar */}
        <div
          style={{
            height: '64px',
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            background: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Topbar />
        </div>

        {/* Routes / Main Content */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            background: '#f8f9fa',
            padding: '1rem',
          }}
        >
          <Routes>
            <Route path="/reports" element={<FormPage />} />
            <Route path="/lookupMaster" element={<LookupMaster />} />
            <Route path="/userMaster" element={<UserMaster />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/userAccessManage" element={<UserAccessManagement />} />
            <Route path="/routeMaster" element={<RouteStageMaster />} />
            <Route path="/pickupMaster" element={<PickUpPointMaster />} />
            <Route path="/aliasMaster" element={<AliasMaster />} />
            <Route path="/classMaster" element={<ClassMaster />} />
            <Route path="/placeMaster" element={<PlaceMaster />} />
            <Route path="/zoneMaster" element={<ZoneMaster />} />
            <Route path="/layoutMaster" element={<LayoutMaster />} />
            <Route path="/moduleMaster" element={<ModuleMaster />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/serviceMaster" element={<ServiceMaster />} />
            
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
