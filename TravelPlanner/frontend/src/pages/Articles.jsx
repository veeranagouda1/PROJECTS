import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(a => a.category === selectedCategory));
    }
  }, [selectedCategory, articles]);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/articles');
      setArticles(response.data);
      setFilteredArticles(response.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      showToast('Failed to fetch articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const categories = ['ALL', 'SAFETY', 'TRAVEL_TIPS', 'NEWS', 'HISTORY'];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="articles-page">
      <Navbar />
      <div className="articles-container">
        <div className="articles-header">
          <h1>📰 Travel Articles & Safety News</h1>
          <p>Stay informed with the latest travel safety information and tips</p>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'ALL' ? 'All Articles' : category.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="articles-grid">
          {filteredArticles.length === 0 ? (
            <div className="no-articles">
              <p>No articles found in this category.</p>
            </div>
          ) : (
            filteredArticles.map(article => (
              <div key={article.id} className="article-card">
                {article.imageUrl && (
                  <div className="article-image" style={{ backgroundImage: `url(${article.imageUrl})` }}>
                    <span className="article-category">{article.category}</span>
                  </div>
                )}
                <div className="article-content">
                  <h2>{article.title}</h2>
                  {article.summary && <p className="article-summary">{article.summary}</p>}
                  <div className="article-meta">
                    <span className="article-date">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    {article.source && <span className="article-source">{article.source}</span>}
                  </div>
                  <div className="article-text">
                    {article.content.length > 200
                      ? `${article.content.substring(0, 200)}...`
                      : article.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Articles;

