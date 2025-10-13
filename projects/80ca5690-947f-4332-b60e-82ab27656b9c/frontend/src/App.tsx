import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Edit from './pages/Edit';
import Profile from './pages/Profile';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/edit/:id" element={<Edit />} />
      <Route path="/profile/:id" element={<Profile />} />
    </Routes>
  </BrowserRouter>
);

export default App;
