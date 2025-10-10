// User profile component
import React from 'react';
import { UserProfile } from '../types/UserProfile';

const UserProfileComponent: React.FC<{ user: UserProfile }> = ({ user }) => (
  <div>
    <h2>{user.username}</h2>
    <p>Role: {user.role}</p>
    {user.employeeId && <p>Employee ID: {user.employeeId}</p>}
  </div>
);

export default UserProfileComponent;
