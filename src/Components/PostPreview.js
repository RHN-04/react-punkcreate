import React from 'react';
import { Link } from 'react-router-dom';
import './PostPreview.css';

const PostPreview = ({ post }) => {
  const { postId, images, title, username, likes, comments, postDate, nsfw } = post;
  const previewImage = images.length > 0 ? `http://localhost:8080/images/${images[0]}` : '/img/stub.png';

  return (
    <div className={`post-preview ${nsfw ? 'nsfw' : ''}`}>
      <Link to={`/post/${postId}`} className="post-link">
        <div className="image-container">
          {nsfw ? (
            <div className="nsfw-warning">
              <p>Содержание этого поста может быть неприятным и не предназначено для просмотра лицами младше 18 лет.</p>
            </div>
          ) : (
            <img src={previewImage} alt="Post Preview" />
          )}
          <div className="info-overlay">
            <Link to={`/profile/${username}`} className="author-link">
              <p>{username}</p>
            </Link>
            <p className="title">{title}</p>
            <div className="likes-comments">
              <span>Нравится: {likes}</span>
              <span>Комментарии: {comments.length}</span>
            </div>
            <p className="date">{new Date(postDate).toLocaleString()}</p>
          </div>
        </div>
      </Link>
    </div>
  );  
};

export default PostPreview;
