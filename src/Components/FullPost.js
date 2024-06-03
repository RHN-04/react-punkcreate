import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './FullPost.css';
import jwt_decode from 'jwt-decode';
import LikesModal from './LikesModal';
import Comments from './Comments';
import DeleteConfirmationModal from './DeleteConfirmationModal';

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "none" }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "none" }}
      onClick={onClick}
    />
  );
}

const FullPost = () => {
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [sliderHeight, setSliderHeight] = useState('auto');
  const [authorId, setAuthorId] = useState(null);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likeUsers, setLikeUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { postId } = useParams();
  const isAuthenticated = localStorage.getItem('accessToken') !== null;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);
  const token = localStorage.getItem('accessToken');
  const decodedToken = token ? jwt_decode(token) : null;
  const userId = decodedToken ? decodedToken.userId : null;
  const userAge = decodedToken ? Math.floor((Date.now() - new Date(decodedToken.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  const navigate = useNavigate();

  const searchByTag = (tag) => {
    navigate(`/search?tag=${tag}`);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/post/${postId}`);
        setPost(response.data);
        setAuthorId(response.data.userId);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };    

    const fetchLikeStatus = async () => {
      try {
        if (userId) {
          const requestData = { postId: postId, userId: userId };
          const response = await axios.post(`http://localhost:8080/isPostLikedByUser`, requestData, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          setLiked(response.data);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    fetchPost();
    fetchLikeStatus();
  }, [postId, userId]);

  const handleLike = async () => {
    try {
      const requestData = { postId: postId, userId: userId };
      const response = await axios.post('http://localhost:8080/isPostLikedByUser', requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const isLiked = response.data;

      if (!isLiked) {
        await axios.post(`http://localhost:8080/${postId}/like`, requestData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPost(prevPost => ({
          ...prevPost,
          likes: prevPost.likes + 1
        }));
      } else {
        await axios.delete(`http://localhost:8080/${postId}/like`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: requestData
        });
        setPost(prevPost => ({
          ...prevPost,
          likes: prevPost.likes - 1
        }));
      }

      setLiked(!isLiked);
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/comments`, {
        postId: postId,
        userId: userId,
        commentText: commentContent  
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCommentContent('');
      const response = await axios.get(`http://localhost:8080/post/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleSliderImageLoad = () => {
    const slider = document.querySelector('.slick-slider');
    if (slider) {
      setSliderHeight(`${slider.clientHeight}px`);
    }
  };

  const handleOpenLikesModal = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/post/${postId}/likes`);
      setLikeUsers(response.data);
      setLikesModalOpen(true);
    } catch (error) {
      console.error('Error fetching like users:', error);
    }
  };

  const handleCloseLikesModal = () => {
    setLikesModalOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { userId } // добавление userId как параметра запроса
      });
      setIsDeleteModalOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const refreshComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/post/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  const { images, username, title, description, tags, likes, comments, nsfw } = post;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow className="custom-next-arrow" />,
    prevArrow: <SamplePrevArrow className="custom-prev-arrow" />,
    style: { width: "100%", height: sliderHeight, maxWidth: "800px", margin: "0 auto" },
  };

  return (
    <div className="full-post-container" style={{ paddingTop: '80px' }}>
      <div className="left-block post-info">
        {nsfw && !showNSFW && (
          <div className="nsfw-post">
            {userAge >= 18 ? (
              <>
                <p>Содержание этого поста может быть неприятным и не предназначено для просмотра лицами младше 18 лет.</p>
                <button onClick={() => setShowNSFW(true)}>Всё равно посмотреть</button>
              </>
            ) : (
              <p>Содержание этого поста может быть неприятным и не предназначено для просмотра лицами младше 18 лет.</p>
            )}
          </div>
        )}
        {(!nsfw || (isAuthenticated && showNSFW)) && (
          <Slider {...sliderSettings}>
            {images.map((image, index) => (
              <div key={index} className="slider-image-container">
                <img
                  className="slider-image"
                  src={`http://localhost:8080/images/${image}`}
                  alt={`Post Image ${index + 1}`}
                  onLoad={handleSliderImageLoad}
                />
              </div>
            ))}
          </Slider>
        )}
        <p className="title1">{title}</p>
        <Link to={`/profile/${username}`} className="author1">
          <p>{username}</p>
        </Link>
        <p className="description">{description}</p>
        <p className="tags">
          {tags ? tags.map(tag => (
            <button key={tag} className="tag" onClick={() => searchByTag(tag)}>{tag}</button>
          )) : 'No tags'}
        </p>
      </div>
      <div className="right-block">
        <div className="likes-comments">
          {isAuthenticated && (
            <button
              className={`like-button ${liked ? 'active' : ''}`}
              onClick={handleLike}
            >
              Мне нравится
            </button>
          )}
          <span className="likes-text" onClick={handleOpenLikesModal}>Понравилось: {likes}</span>
        </div>
        {isAuthenticated && (
          <div className="dropdown-menu-container">
            <button className="dropdown-button" onClick={() => setShowDropdown(!showDropdown)}>Ещё...</button>
            {showDropdown && (
              <div className="dropdown-menu">
                {authorId === userId && (
                  <>
                    <button className="dropdown-item" onClick={() => navigate(`/edit/${postId}`)}>Редактировать</button>
                    <button className="dropdown-item" onClick={handleDeleteClick}>Удалить</button>
                  </>
                )}
                {authorId !== userId && (
                  <>
                    <button className="dropdown-item">Жалоба...</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        <div className="comments-section">
          <h3 className="comments-sign">Комментарии</h3>
          <div className="comment-form">
            <textarea
              placeholder="Хочу написать, что..."
              className="comment-input"
              value={commentContent}
              onChange={handleCommentChange}
              rows={3}
              style={{ resize: 'none' }}
            />
            <button className="comment-button" onClick={handleSubmitComment}>Отправить</button>
          </div>
          <ul className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <Comments 
                  key={index} 
                  commentId={comment.commentId} 
                  postId={postId} 
                  commentUserId={comment.userId} 
                  username={comment.username} 
                  userAvatar={comment.userAvatar} 
                  text={comment.commentText} 
                  authorId={authorId} 
                  onCommentChange={refreshComments} 
                />
              ))
            ) : (
              <p className="no-comments">Комментариев пока нет</p>
            )}
          </ul>
        </div>
      </div>
      <LikesModal isOpen={likesModalOpen} onClose={handleCloseLikesModal} users={likeUsers} />
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onDelete={handleDeleteConfirm} 
      />
    </div>
  );
};

export default FullPost;
