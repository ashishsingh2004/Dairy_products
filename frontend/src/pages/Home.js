import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import WeatherWidget from '../components/WeatherWidget';
import Tooltip from '../components/Tooltip';
import './Home.css';


function Home() {
    const { isAuthenticated, user } = useAuth();
    const { t, i18n } = useTranslation();
    const [showLanguages, setShowLanguages] = React.useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
        { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
        { code: 'as', name: 'অসমীয়া', flag: '🇮🇳' },
        { code: 'ur', name: 'اردو', flag: '🇮🇳' },
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
        setShowLanguages(false);
    };

    const getCurrentLanguage = () => {
        return languages.find(lang => lang.code === i18n.language) || languages[0];
    };

    return (
        <div className="home-container">
            {/* Complete Village Scene Background */}
            <div className="village-scene">
                {/* Sun */}
                <Tooltip content="☀️ Bright & Sunny!" position="bottom">
                    <div className="sun">☀️</div>
                </Tooltip>

                {/* Weather Widget */}
                <WeatherWidget />

                {/* Flying Birds */}
                <div className="bird bird-1">🦅</div>
                <div className="bird bird-2">🦅</div>

                {/* Trees */}
                <Tooltip content="🌳 Village Greenery" position="top">
                    <div className="tree tree-left">🌳</div>
                </Tooltip>
                <Tooltip content="🌴 Palm Tree" position="top">
                    <div className="tree tree-right">🌴</div>
                </Tooltip>
                <Tooltip content="🌲 Pine Tree" position="top">
                    <div className="tree tree-center">🌲</div>
                </Tooltip>

                {/* Mud Houses */}
                <Tooltip content="🏠 Village Home" position="top">
                    <div className="mud-house house-1">🏠</div>
                </Tooltip>
                <Tooltip content="🏡 Farmer's House" position="top">
                    <div className="mud-house house-2">🏡</div>
                </Tooltip>

                {/* Lake/Pond */}
                <div className="lake">
                    <span className="wave">〰️</span>
                    <span className="wave">〰️</span>
                    <span className="wave">〰️</span>
                </div>

                {/* Fields */}
                <div className="field field-1">🌾🌾🌾</div>
                <div className="field field-2">🌾🌾</div>

                {/* Village Animals */}
                <Tooltip content="🐄 Dairy Cow Grazing" position="top">
                    <div className="animal cow-grazing">🐄</div>
                </Tooltip>
                <Tooltip content="🐃 Buffalo" position="top">
                    <div className="animal buffalo">🐃</div>
                </Tooltip>

                {/* Well */}
                <Tooltip content="🪣 Village Well" position="top">
                    <div className="well">🪣</div>
                </Tooltip>
            </div>

            <nav className="navbar">
                <div className="nav-brand">
                    <h1>🥛 डेयरी बाज़ार</h1>
                    <span className="nav-subtitle">Dairy Marketplace</span>
                </div>

                <div className="nav-links">
                    <Link to="/">{t('home')}</Link>
                    <Link to="/products">{t('products')}</Link>
                    <Link to="/cows">{t('cows')}</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard">{t('orders')}</Link>
                            {user?.role === 'admin' && <Link to="/admin">{t('admin')}</Link>}
                        </>
                    ) : (
                        <Link to="/auth" className="auth-link">Login / Register</Link>
                    )}
                </div>

                <div className="language-switcher">
                    <button
                        className="language-btn"
                        onClick={() => setShowLanguages(!showLanguages)}
                    >
                        <span className="flag">{getCurrentLanguage().flag}</span>
                        <span className="lang-name">{getCurrentLanguage().name}</span>
                        <span className={`dropdown-arrow ${showLanguages ? 'open' : ''}`}>▼</span>
                    </button>

                    {showLanguages && (
                        <div className="language-dropdown">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                                    onClick={() => changeLanguage(lang.code)}
                                >
                                    <span className="flag">{lang.flag}</span>
                                    <span className="lang-name">{lang.name}</span>
                                    {i18n.language === lang.code && <span className="checkmark">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            <div className="hero-section">
                <h2>🌾 {t('welcome')} 🐄</h2>
                <p className="hero-subtitle">ग्रामीण डेयरी का डिजिटल बाज़ार</p>
                <p>Your one-stop platform for dairy products, cattle trading, and farming assistance</p>

                <div className="feature-grid">
                    <div className="feature-card card-1">
                        <div className="card-icon">🥛</div>
                        <h3>{t('products')}</h3>
                        <p>Fresh milk and dairy products from verified farmers</p>
                        <Link to="/products" className="btn-primary">Browse Products →</Link>
                    </div>

                    <div className="feature-card card-2">
                        <div className="card-icon">🐄</div>
                        <h3>{t('cows')}</h3>
                        <p>Buy and sell cattle with complete health records</p>
                        <Link to="/cows" className="btn-primary">View Listings →</Link>
                    </div>

                    <div className="feature-card card-3">
                        <div className="card-icon">🤖</div>
                        <h3>{t('chat')}</h3>
                        <p>Get expert advice on cattle health and farming</p>
                        <Link to="/dashboard" className="btn-primary">Ask Assistant →</Link>
                    </div>
                </div>
            </div>

            {/* Village Footer */}
            <div className="village-footer">
                <p>🌾 भारतीय किसान का साथी • Indian Farmer's Partner 🐄</p>
            </div>
        </div>
    );
}

export default Home;
