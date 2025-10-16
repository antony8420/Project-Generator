import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: 'Arial, sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
    <header style={{ background: '#343a40', color: '#fff', padding: '1rem' }}>
      <h1>E-Forms Reflex Module</h1>
    </header>
    <main style={{ margin: '2rem auto', maxWidth: 1200 }}>{children}</main>
  </div>
);

export default Layout;
