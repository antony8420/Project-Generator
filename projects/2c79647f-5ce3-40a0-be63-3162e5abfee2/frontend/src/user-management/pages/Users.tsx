// Users page
import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import UserProfileComponent from '../components/UserProfile';

const Users: React.FC = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    userService.listUsers().then(setUsers);
  }, []);
  return (
    <div>
      <h1>Users</h1>
      {users.map((user: any) => <UserProfileComponent key={user.id} user={user} />)}
    </div>
  );
};

export default Users;
