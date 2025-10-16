import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => (
  <nav style={{ marginBottom: '2rem', background: '#e9ecef', padding: '1rem', borderRadius: 8 }}>
    <Link to="/" style={{ marginRight: 16 }}>Home</Link>
    <Link to="/employees" style={{ marginRight: 16 }}>Employees</Link>
    {/* Add links for other features here */}
  </nav>
);

export default Navigation;
