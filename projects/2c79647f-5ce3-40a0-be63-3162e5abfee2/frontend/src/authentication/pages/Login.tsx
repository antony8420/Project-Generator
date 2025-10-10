// Login page
import React from 'react';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  return <LoginForm onLogin={() => navigate('/employees')} />;
};

export default Login;
