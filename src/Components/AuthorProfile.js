import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import PostPreview from './PostPreview';
import defaultAvatar from '../assets/defaultAvatar';
import './AuthorProfile.css';
import jwt_decode from 'jwt-decode';

const ITEMS_PER_PAGE = 12;

const AuthorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('authorPosts');
  const [loading, setLoading] = useState(true);

  const fetchAuthorProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/users/${username}`);
      setAuthor(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching author profile:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      await fetchAuthorProfile();
      const decodedToken = checkAuthentication();
      if (decodedToken && author) { 
        await fetchLikedPosts(decodedToken.userId);
      }
    };
  
    initializeProfile();
  }, [username, author]);

  const fetchLikedPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/users/${author.id}/likedPosts`);
      setLikedPosts(response.data);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  };  

  const checkIfFollowing = async (userId, targetUserId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/users/isSubscribed`,
        {
          params: {
            userId: userId,
            targetUserId: targetUserId,
          },
        }
      );
      setIsFollowing(response.data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      const decodedToken = jwt_decode(token);
      setUserId(decodedToken.userId);
      return decodedToken;
    } else {
      setIsAuthenticated(false);
      return null;
    }
  };

  const goBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goForward = () => {
    if (author && author.posts) {
      const totalPages = Math.ceil(author.posts.length / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handleEditProfile = () => {
    navigate(`/edit-profile/${username}`);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const initializeProfile = async () => {
      await fetchAuthorProfile();
      const decodedToken = checkAuthentication();
      if (decodedToken) {
        await fetchLikedPosts(decodedToken.userId);
      }
    };

    initializeProfile();
  }, [username]);

  useEffect(() => {
    if (author && userId) {
      setIsCurrentUser(userId === author.id);
      checkIfFollowing(userId, author.id);
    }
  }, [author, userId]);

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('accessToken');
    const decodedToken = jwt_decode(token);

    try {
      if (isFollowing) {
        await axios.post(`http://localhost:8080/users/unfollow`, {
          userId: decodedToken.userId,
          targetUserId: author.id,
        });
      } else {
        await axios.post(`http://localhost:8080/users/follow`, {
          userId: decodedToken.userId,
          targetUserId: author.id,
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const [isBlocked, setIsBlocked] = useState(false);

  const handleBlockToggle = async () => {
    // Логика для переключения состояния блокировки профиля
  };

  const handleFollowersClick = () => {
    navigate(`/${author.id}/followers`);
  };

  const handleFollowingClick = () => {
    navigate(`/${author.id}/following`);
  };

  const renderPosts = () => {
    if (activeTab === 'authorPosts' && author && author.posts) {
      return author.posts.map((post) => (
        <PostPreview key={post.postId} post={post} />
      ));
    } else if (activeTab === 'likedPosts' && likedPosts.length > 0) {
      return likedPosts.map((post) => (
        <PostPreview key={post.postId} post={post} />
      ));
    } else {
      return <p>No posts available</p>;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="author-profile-container" style={{ paddingTop: '80px' }}>
        <div className="author-info-container">
          {author?.avatar ? (
            <img src={`http://localhost:8080/images/${author.avatar}`} alt={`${author.username}'s Avatar`} />
          ) : (
            <img src={defaultAvatar} alt="Default Avatar" />
          )}
          <div className="author-info-details">
            <h2>{author?.username}</h2>
            <p>{author?.description}</p>
            <div className="author-info-stats">
              <p>Публикации: {author?.postsCount}</p>
              <p onClick={handleFollowersClick} style={{ cursor: 'pointer' }}>Подписчики: {author?.followersCount}</p>
              <p onClick={handleFollowingClick} style={{ cursor: 'pointer' }}>Подписки: {author?.followingCount}</p>
              {isAuthenticated && (
                <>
                  {isCurrentUser ? (
                    <button className="edit-profile-button" onClick={handleEditProfile}>Редактировать профиль</button>
                  ) : (
                    <>
                      <button className={isFollowing ? 'unfollow-button' : 'follow-button'} onClick={handleFollowToggle}>
                        {isFollowing ? 'Отписаться' : 'Подписаться'}
                      </button>
                      <button className={isBlocked ? 'unfollow-button' : 'follow-button'} onClick={handleBlockToggle}>
                        {isBlocked ? 'Разблокировать профиль' : 'Заблокировать профиль'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="tab-container">
          <button
            onClick={() => setActiveTab('authorPosts')}
            className={`tab-button ${activeTab === 'authorPosts' ? 'active' : ''}`}
          >
            Посты автора
          </button>
          <button
            onClick={() => setActiveTab('likedPosts')}
            className={`tab-button ${activeTab === 'likedPosts' ? 'active' : ''}`}
          >
            Понравились автору
          </button>
        </div>
        <div className="post-container">
          {renderPosts()}
        </div>
      </div>
      <div className="pagination-container">
        <div className="pagination">
          <button onClick={goBack} disabled={currentPage === 1}>
            Назад
          </button>
          {author && author.posts && Array.from({ length: Math.ceil(author.posts.length / ITEMS_PER_PAGE) }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={index + 1 === currentPage ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={goForward} disabled={author && (!author.posts || currentPage === Math.ceil(author.posts.length / ITEMS_PER_PAGE))}>
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
