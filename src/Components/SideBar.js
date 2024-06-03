import React, { useEffect, useState } from 'react';
import './SideBar.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const Sidebar = ({ isOpen, onClose, onLogout }) => {
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decodedToken = jwt_decode(token);
                setUsername(decodedToken.sub); 
                setUserId(decodedToken.userId); 
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    const sidebarClassName = `sidebar ${isOpen ? 'open' : ''}`;

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/logout');
            onLogout(); 
            onClose(); 
            window.location.href = '/'; 
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };    

    const handleLinkClick = () => {
        onClose(); 
    };

    return (
        <div className={sidebarClassName}>
            {username ? (
                <Link to={`/profile/${username}`} onClick={handleLinkClick}>Мой профиль</Link>
            ) : (
                <p>Загрузка...</p> 
            )}
            <Link to="/submit" onClick={handleLinkClick}>Создать пост</Link>
            {userId ? (
                <Link to={`/${userId}/following`} onClick={handleLinkClick}>Подписки</Link>
            ) : (
                <p>Загрузка...</p>
            )}
            <Link to="/feed" onClick={handleLinkClick}>Лента подписок</Link>
            {isOpen && (
              <>
                <button onClick={handleLogout} className="logout-button">Выход</button>
              </>
            )}
        </div>
    );
};

export default Sidebar;
