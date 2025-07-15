import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import logo from '../assets/ChatGPT Image Jul 12, 2025, 04_34_28 PM.png';
import axios from 'axios';
import BASE_URL from '../configAPI';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(''); 
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const { username, password } = form;

  if (!username || !password) {
    setMessage('Please fill in all mandatory fields.');
    return;
  }

  const payload = { username, password };

  try {
    const response = await axios.post(`${BASE_URL}/userMaster/login`, payload);

    const { token, data } = response.data;

    if (token) {
      localStorage.setItem("authToken", token);
      console.log("authToken", token);
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "/"; 
    }
  } catch (error) {
    const errMsg =
      error.response?.data?.meta?.message || "Login failed. Please try again.";
    setMessage(errMsg);
  }
};


  return (
    <Container
      fluid
      className="p-0"
      style={{
        background: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <Row className="g-0" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        {/* Left Side - Image */}
        <Col
          md={6}
          className="d-none d-md-flex align-items-center justify-content-center p-0"
          style={{ background: '#ffffff' }}
        >
          <img
            src={logo}
            alt="Login Visual"
            style={{
              maxWidth: '90%',
              height: 'auto',
              objectFit: 'contain',
              padding: '20px',
            }}
          />
        </Col>

        {/* Right Side - Login Card */}
        <Col
          xs={12}
          md={6}
          className="d-flex justify-content-center align-items-center p-3"
          style={{
            background: '#ffffff',
          }}
        >
          <Card
            className="shadow rounded-4 w-100"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '30px',
              background: '#fff',
            }}
          >
            <h4 className="text-center fw-bold mb-4" style={{ color: '#1e1e2d' }}>
              PRAdmin Login
            </h4>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label style={{ color: '#1e1e2d' }}>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="rounded-pill"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label style={{ color: '#1e1e2d' }}>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="rounded-pill"
                />
              </Form.Group>

              {/* Error message */}
              {message && (
                <Alert variant="danger" className="py-1 text-center">
                  {message}
                </Alert>
              )}

              <div className="d-grid mt-3">
                <Button
                  type="submit"
                  className="rounded-pill"
                  style={{
                    background: '#1e1e2d',
                    border: 'none',
                    fontSize: '1rem',
                    padding: '10px',
                  }}
                >
                  Login
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
