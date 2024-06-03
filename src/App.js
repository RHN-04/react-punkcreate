import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import HomePage from './Components/HomePage';
import FullPost from './Components/FullPost';
import AuthorProfile from './Components/AuthorProfile';
import CreatePost from './Components/CreatePost';
import LoginModal from './Components/LoginModal';
import RegisterForm from './Components/RegisterForm';
import Sidebar from './Components/SideBar';
import { AuthProvider } from './Components/AuthContext';
import EditProfileForm from './Components/EditProfileForm';
import SearchResultsPage from './Components/SearchResultsPage';
import SubscriptionsPage from './Components/SubscriptionsPage';
import NewsFeedPage from './Components/NewsFeedPage';
import AdminPanel from './Components/AdminPanel';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [token, setToken] = useState(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogin = async (loginData) => {
    try {
      const response = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        throw new Error('Неправильный логин или пароль');
      }

      const data = await response.json();
      setIsAuthenticated(true);
      setUsername(data.username);
      setAvatar(data.avatar);
      setToken(data.token);
      localStorage.setItem('accessToken', data.token);

      console.log('Token received:', data.token);
      closeModal();
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setAvatar(null);
    setToken(null);
    localStorage.removeItem('accessToken');
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      setToken(token);
    }
  }, []);

  return (
    <AuthProvider isAuthenticated={isAuthenticated} username={username} avatar={avatar} token={token} handleLogout={handleLogout}>
      <div>
        <Navbar isAuthenticated={isAuthenticated} username={username} avatar={avatar} openModal={openModal} token={token} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:postId" element={<FullPost />} />
          <Route path="/profile/:username" element={<AuthorProfile />} />
          <Route path="/submit" element={<CreatePost token={token} />} />
          <Route path="/edit/:postId" element={<CreatePost token={token} />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/edit-profile/:username" element={<EditProfileForm />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/:userId/followers" element={<SubscriptionsPage isFollowers={true} />} />
          <Route path="/:userId/following" element={<SubscriptionsPage isFollowers={false} />} />
          <Route path="/feed" element={<NewsFeedPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <LoginModal isOpen={isModalOpen} onClose={closeModal} onLogin={handleLogin} />
        <Sidebar onLogout={handleLogout} />
      </div>
    </AuthProvider>
  );
}

export default App;
