import React from 'react';
import Sidebar from '../scence/global/sidebar';
import Topbar from '../scence/global/Topbar';
import { Routes, Route } from 'react-router-dom';
import FormPage from '../scence/form/FormWithTable';
import LookupMaster from '../scence/masters/lookUpMaster';
import Login from '../components/login';

const Home = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-grow-1" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="p-3">
          <Routes>''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
            <Route path="/form" element={<FormPage />} />
            <Route path="/lookUp" element={<LookupMaster />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
