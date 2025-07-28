import React from 'react';
import Sidebar from '../scence/global/sidebar';
import Topbar from '../scence/global/Topbar';
import { Routes, Route } from 'react-router-dom';
import FormPage from '../scence/form/FormWithTable';
import LookupMaster from '../scence/masters/lookUpMaster';
import UserMaster from '../scence/masters/userMaster';
import ChangePassword from '../components/changePassword';
import UserAccessManagement from '../components/userAccessManagement';
import RouteStageMaster from '../scence/masters/RouteStageMaster';
import PickUpPointMaster from '../scence/masters/PickUpPointMaster';
import AliasMaster from '../scence/masters/AliasMaster';
import ClassMaster from '../scence/masters/ClassMaster';
import PlaceMaster from '../scence/masters/placeMaster';
import ZoneMaster from '../scence/masters/zonemaster';
const Home = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
        <Topbar />
        <div className="p-3">
          <Routes>
            <Route path="/form" element={<FormPage />} />
            <Route path="/lookUp" element={<LookupMaster />} />
            <Route path="/userMaster" element={<UserMaster />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/userAccessManage" element={<UserAccessManagement />} />
            <Route path="/routeMaster" element={<RouteStageMaster />} />
            <Route path="/pickUp" element={<PickUpPointMaster />} />
            <Route path="/alias" element={<AliasMaster />} />
            <Route path="/classMaster" element={<ClassMaster />} />
            <Route path="/placeMaster" element={<PlaceMaster />} />
            <Route path="/zonemaster" element={<ZoneMaster />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
