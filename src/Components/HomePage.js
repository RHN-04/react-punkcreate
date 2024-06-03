import React, { useState, useEffect } from 'react';
import PostPreview from './PostPreview';
import './HomePage.css'; 
import axios from 'axios';

const ITEMS_PER_PAGE = 12;

const HomePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get('http://localhost:8080/');
        setPosts(response.data);
        setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Ошибка при получении постов:', error);
      }
    }

    fetchPosts();
  }, []);

  const indexOfLastPost = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - ITEMS_PER_PAGE;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goForward = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="home-page-container" style={{ paddingTop: '80px' }}>
      <div className="post-container">
        {currentPosts.map((post) => (
          <PostPreview key={post.postId} post={post} />
        ))}
      </div>
      <div className="pagination-container">
        <div className="pagination">
          <button onClick={goBack} disabled={currentPage === 1}>
            Назад
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index + 1} onClick={() => paginate(index + 1)}>
              {index + 1}
            </button>
          ))}
          <button onClick={goForward} disabled={currentPage === totalPages}>
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
