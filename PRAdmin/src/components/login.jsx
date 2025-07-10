import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', formData);
  
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ height: '100vh', backgroundColor: '#f4f6f8' }}
    >
      <Card className="shadow-lg p-4 rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4 text-primary fw-bold">PRAdmin Login</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-white"><FaUser /></span>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <div className="input-group">
              <span className="input-group-text bg-white"><FaLock /></span>
              <Form.Control
                type="password"
                placeholder="Enter password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 rounded-pill"
            style={{
              background: 'linear-gradient(180deg, #1e3c72, #2a5298)',
              border: 'none',
              fontWeight: '500'
            }}
          >
            Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Login;
