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
      setLoading(true);
      const response = await api.get('/articles/online', {
        params: { page: 0, size: 50 }
      });
      const articlesData = response.data.articles || response.data || [];
      setArticles(articlesData);
      setFilteredArticles(articlesData);
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
        <div className="articles-container" style={{ padding: '40px' }}>
          <div className="articles-header">
            <h1>📰 Travel Articles & Safety News</h1>
          </div>
          <div className="articles-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="article-card shimmer" style={{
                height: '400px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}></div>
            ))}
          </div>
        </div>
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
                    {article.content && article.content.length > 200
                      ? `${article.content.substring(0, 200)}...`
                      : article.content || article.summary}
                  </div>
                  {article.source && (
                    <a
                      href={article.source.startsWith('http') ? article.source : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: '15px',
                        padding: '8px 16px',
                        backgroundColor: '#6A5AE0',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#8A63FF';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#6A5AE0';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Read More →
                    </a>
                  )}
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

