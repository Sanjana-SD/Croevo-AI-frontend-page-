import React from 'react';
import './UserProfilePage.css';

const UserProfilePage = () => {
  return (
    <div className="user-profile-page">
      <h1>User Profile</h1>
      <div className="profile-card">
        <img src="https://via.placeholder.com/150" alt="Avatar" className="avatar" />
        <div className="info">
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Email:</strong> johndoe@example.com</p>
          <p><strong>Member since:</strong> Jan 2023</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
