import React from 'react';
import {
  Navbar,
  Container,
  Form,
  Nav,
  NavDropdown,
  Offcanvas,
  Button,
} from 'react-bootstrap';

function Topbar() {
  const expand = 'lg';

  return (
    <Navbar
      expand={expand}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '0.75rem 1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }}
      className="mb-4"
    >
      <Container fluid>
        <Navbar.Brand className="fw-bold fs-4 text-primary">PRAdmin</Navbar.Brand>
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
              <Nav.Link href="/login" className="text-dark fw-medium">Login/Register</Nav.Link>
              <Nav.Link href="/profile" className="text-dark fw-medium">Profile</Nav.Link>
              <NavDropdown title="More" id="nav-dropdown" className="fw-medium">
                <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action4">Another Action</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action5">Something Else</NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <Form className="d-flex ms-4" style={{ maxWidth: '300px', width: '100%' }}>
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2 rounded-pill shadow-sm"
                aria-label="Search"
              />
              <Button
                variant="primary"
                className="rounded-pill px-3"
                style={{
                  background: 'linear-gradient(180deg, #1e3c72, #2a5298)',
                  border: 'none',
                }}
              >
                Search
              </Button>
            </Form>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Topbar;
