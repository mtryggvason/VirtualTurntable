import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/UserProfile.module.css';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.userProfile}>
      <div 
        className={styles.trigger}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className={styles.avatar}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <span className={styles.email}>{user.email}</span>
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownItem}>
            <span>{user.displayName || user.email}</span>
          </div>
          <button 
            className={styles.dropdownItem}
            onClick={() => {
              window.location.href = '/user';
              setShowDropdown(false);
            }}
          >
            My Songs
          </button>
          <button 
            className={styles.dropdownItem}
            onClick={() => {
              window.location.href = '/user/upload';
              setShowDropdown(false);
            }}
          >
            Upload Song
          </button>
          <button 
            className={`${styles.dropdownItem} ${styles.logoutBtn}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;