import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Comments.css';
import defaultAvatar from '../assets/defaultAvatar';
import axios from 'axios';
import { useAuth } from './AuthContext'; 

const Comments = ({ commentId, postId, username, text, userAvatar, commentUserId, authorId, onCommentChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [showButtons, setShowButtons] = useState(true); 

  const handleEdit = async () => {
    if (!user) return;
    try {
      const userId = typeof user.id === 'number' ? user.id : parseInt(user.id);
      await axios.post(`http://localhost:8080/comments/${commentId}?userId=${user.id}`,{ 
        postId, 
        userId, 
        commentText: editedText 
      });
      setIsEditing(false);
      setShowButtons(true);
      onCommentChange();  
    } catch (error) {
      console.error('Error editing comment:', error);
      if (error.response && error.response.data) {
        console.log('Server error message:', error.response.data); 
      }
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await axios.delete(`http://localhost:8080/comments/${commentId}?userId=${user.id}`);
      onCommentChange();  
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="comment-container">
      <div className="comment-author-avatar">
        {userAvatar ? (
          <img src={`http://localhost:8080/images/${userAvatar}`} alt={`${username}'s Avatar`} />
        ) : (
          <img src={defaultAvatar} alt="Default Avatar" />
        )}
      </div>
      <div className="comment-content">
        <Link to={`/profile/${username}`} className="comment-author">
          <p>{username}</p>
        </Link>
        {isEditing ? (
          <>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="comment-input" 
              rows={3}
              style={{ resize: 'none' }} 
            />
            <button onClick={handleEdit} className="comment-button">Отправить</button>
            <button onClick={() => { setIsEditing(false); setShowButtons(true); }} className="comment-button">Отмена</button>
          </>
        ) : (
          <p className="comment-text">{text}</p>
        )}
        {(isAuthenticated && user) && showButtons && ( 
          <div className="comment-actions">
            {user.id === commentUserId && ( 
              <button onClick={() => { setIsEditing(true); setShowButtons(false); }} className="comment-button">Редактировать</button>
            )}
            {(user.id === commentUserId || user.id === authorId) && (
              <button onClick={handleDelete} className="comment-button">Удалить</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
