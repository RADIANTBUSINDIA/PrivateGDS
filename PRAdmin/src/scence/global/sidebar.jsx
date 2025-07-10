import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Sidebar = () => {
  const [openMasters, setOpenMasters] = useState(false);

  return (
    <div
      className="d-flex flex-column vh-100 p-3"
      style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1e3c72, #2a5298)',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        borderTopRightRadius: '12px',
        borderBottomRightRadius: '12px',
        position: 'sticky',
        top: 0,
      }}
    >
      <h4 className="text-white fw-bold mb-4 text-center border-bottom pb-3">
        PR Admin
      </h4>

      <ul className="nav flex-column gap-2">
        <li className="nav-item">
          <a href="/" className="nav-link text-white px-3 py-2 rounded hover-effect">
            🏠 Dashboard
          </a>
        </li>

        <li className="nav-item">
          <a href="/form" className="nav-link text-white px-3 py-2 rounded hover-effect">
            ✅ Tasks
          </a>
        </li>

        
        <li className="nav-item">
          <div
            className="nav-link text-white px-3 py-2 rounded hover-effect d-flex justify-content-between align-items-center"
            onClick={() => setOpenMasters(!openMasters)}
            style={{ cursor: 'pointer' }}
          >
            🧩 Masters
            <span>{openMasters ? '▾' : '▸'}</span>
          </div>

          {openMasters && (
            <ul className="nav flex-column ps-3">
              <li className="nav-item">
                <a href="/lookUp" className="nav-link text-white px-3 py-1 rounded hover-effect">
                  🔹 Lookup Master
                </a>
              </li>
              <li className="nav-item">
                <a href="/placeMaster" className="nav-link text-white px-3 py-1 rounded hover-effect">
                  🔹 Place Master
                </a>
              </li>
             
            </ul>
          )}
        </li>

        <li className="nav-item">
          <a href="/settings" className="nav-link text-white px-3 py-2 rounded hover-effect">
            ⚙️ Settings
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
