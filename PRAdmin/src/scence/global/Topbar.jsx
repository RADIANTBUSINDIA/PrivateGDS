import React from "react";
import { Navbar, Container, Nav, Offcanvas } from "react-bootstrap";
import { FaShieldAlt } from "react-icons/fa";
import { NavDropdown } from 'react-bootstrap';
import { ImProfile } from "react-icons/im";
import { MdOutlinePassword } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { GiPlagueDoctorProfile } from "react-icons/gi";



function Topbar() {
  const expand = "lg";

  return (
    <Navbar
      expand={expand}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "0.75rem 1.5rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
      className="mb-4"
    >
<Container fluid className="position-relative">
  {/* Centered Brand */}
  <div className="position-absolute start-50 translate-middle-x">
    <Navbar.Brand
      className="fw-bold fs-4 d-flex align-items-center gap-2"
      style={{ color: "#1e1e2d" }}
    >
      <FaShieldAlt size={24} />
      <span>
        Welcome to <span style={{ color: "#1e1e2d" }}>PR</span>
        <span style={{ color: "#1e1e2d" }}>Admin</span>
      </span>
    </Navbar.Brand>
  </div>

  {/* Toggle + Right-side nav */}
  <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />

  <Navbar.Offcanvas
    id={`offcanvasNavbar-expand-${expand}`}
    aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
    placement="end"
  >
    <Offcanvas.Header closeButton>
      <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
        PRAdmin Menu
      </Offcanvas.Title>
    </Offcanvas.Header>

    <Offcanvas.Body>
      <Nav className="ms-auto align-items-center gap-3">
        <NavDropdown
          title={
            <span className="text-dark fw-medium">
              <GiPlagueDoctorProfile size={20} className="me-2" />
              Profile
            </span>
          }
          id="nav-dropdown-profile"
        >
          <NavDropdown.Item href="/profile">
            <ImProfile size={20} className="me-2" />
            My Profile
          </NavDropdown.Item>
          <NavDropdown.Item href="/change-password">
            <MdOutlinePassword size={20} className="me-2" />
            Change Password
          </NavDropdown.Item>
        </NavDropdown>

        <Nav.Link
          onClick={() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="text-dark fw-medium"
          style={{ cursor: "pointer" }}
        >
          <IoLogOut size={20} className="me-1" />
          Logout
        </Nav.Link>
      </Nav>
    </Offcanvas.Body>
  </Navbar.Offcanvas>
</Container>

    </Navbar>
  );
}

export default Topbar;
