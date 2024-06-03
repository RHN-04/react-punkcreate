import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import SideBar from './SideBar';
import './Navbar.css';
import defaultAvatar from '../assets/defaultAvatar';

const Navbar = (props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title'); 
  const [isSideBarOpen, setSideBarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const toggleSideBar = () => {
    setSideBarOpen(!isSideBarOpen);
  };

  const closeSideBar = () => {
    setSideBarOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isSideBarOpen && !e.target.closest('.sidebar')) {
        closeSideBar();
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isSideBarOpen]);

  useEffect(() => {
    if (props.isAuthenticated && props.token) {
      try {
        const decodedToken = jwt_decode(props.token);
        setUserData(decodedToken);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          props.onLogout();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [props.isAuthenticated, props.token]);

  const handleSearch = () => {
    let queryParams = '';
    if (searchQuery) {
      queryParams += `title=${searchQuery}`;
    }
    if (searchQuery && searchType === 'both') {
      queryParams += '&';
    }
    if (searchType === 'tag') {
      queryParams += `tag=${searchQuery}`;
    }
    navigate(`/search?${queryParams}`);
  };
  
  return (
    <div className="navbar">
      <div className="left-section">
        {props.isAuthenticated && (
          <button className="menu-button" onClick={toggleSideBar}>
            <img className="menuicon" src="/img/iconnav.png" alt="Меню" />
          </button>
        )}
        <Link to="/">
          <img className="logo" src="/img/logo1.png" alt="Логотип" />
        </Link>
        <div className="search-container">
          <input 
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="title">По названию</option>
            <option value="tag">По тегу</option>
            <option value="both">И по названию, и по тегу</option>
          </select>
          <button className="search-button" onClick={handleSearch}>
            <img className="searchicon" src="/img/searchicon1.png" alt="Поиск" />
          </button>
        </div>
      </div>

      <div className="right-section">
        {props.isAuthenticated && userData ? (
          <div className="user-info1">
            <img
              src={userData?.avatar ? `http://localhost:8080/images/${userData.avatar}` : defaultAvatar}
              alt={`${userData.username}'s Avatar`}
              className="avatar" 
            />
            <span className="username">{userData.sub}</span> 
          </div>
        ) : (
          <>
            <button onClick={handleRegister}>Зарегистрироваться</button>
            <button onClick={props.openModal}>Войти</button>
          </>
        )}
      </div>
      {isSideBarOpen && <SideBar isOpen={isSideBarOpen} onClose={closeSideBar} onLogout={props.onLogout} />}
    </div>
  );
};

export default Navbar;
