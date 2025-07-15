import React from 'react';
import Sidebar from '../scence/global/sidebar';
import Topbar from '../scence/global/Topbar';
import { Routes, Route } from 'react-router-dom';
import FormPage from '../scence/form/FormWithTable';
import LookupMaster from '../scence/masters/lookUpMaster';
import UserMaster from '../scence/masters/userMaster';
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
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
