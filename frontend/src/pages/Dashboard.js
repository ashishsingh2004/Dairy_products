import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService, chatService } from '../services';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Chatbot state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAll();
            setOrders(response.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Preset questions
    const presetQuestions = [
        "What are the common diseases in cows and their symptoms?",
        "How to increase milk production in dairy cows?",
        "What is the ideal vaccination schedule for cows?",
        "What should be the proper diet for a lactating cow?",
        "How to identify if a cow is pregnant?",
        "What are the best practices for cow breeding?",
        "How to take care of a newborn calf?",
        "What is the ideal temperature for cow housing?"
    ];

    const handlePresetQuestion = (question) => {
        setChatInput(question);
        // Auto-submit the question
        setTimeout(() => {
            const submitEvent = { preventDefault: () => { } };
            handleChatSubmit(submitEvent);
        }, 100);
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = { role: 'user', content: chatInput };
        setChatMessages([...chatMessages, userMessage]);
        setChatInput('');
        setChatLoading(true);

        try {
            const response = await chatService.sendMessage(chatInput);
            const aiMessage = { role: 'assistant', content: response.data.aiResponse };
            setChatMessages([...chatMessages, userMessage, aiMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setChatMessages([...chatMessages, userMessage, errorMessage]);
        } finally {
            setChatLoading(false);
        }
    };

    const clearChatHistory = async () => {
        try {
            await chatService.clearHistory();
            setChatMessages([]);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    return (
        <div className="dashboard-page">
            <nav className="navbar">
                <Link to="/" className="nav-brand">🥛 Dairy Marketplace</Link>
                <div className="nav-links">
                    <Link to="/">{t('home')}</Link>
                    <Link to="/products">{t('products')}</Link>
                    <Link to="/cows">{t('cows')}</Link>
                    <Link to="/dashboard">{t('orders')}</Link>
                </div>
            </nav>

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.name}!</h1>
                    <p>Role: <span className="role-badge">{user?.role}</span></p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={activeTab === 'orders' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        📦 My Orders
                    </button>
                    <button
                        className={activeTab === 'chat' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('chat')}
                    >
                        🤖 AI Assistant
                    </button>
                    {user?.role === 'farmer' && (
                        <button
                            className={activeTab === 'products' ? 'tab-active' : ''}
                            onClick={() => setActiveTab('products')}
                        >
                            🥛 My Products
                        </button>
                    )}
                </div>

                <div className="dashboard-content">
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="orders-section">
                            <h2>My Orders</h2>
                            {loading && <p className="loading">{t('loading')}</p>}

                            {!loading && orders.length === 0 && (
                                <div className="empty-state">
                                    <p>No orders yet</p>
                                    <Link to="/products" className="btn-primary">Start Shopping</Link>
                                </div>
                            )}

                            <div className="orders-grid">
                                {orders.map((order) => (
                                    <div key={order._id} className="order-card">
                                        <div className="order-header">
                                            <span className="order-id">Order #{order._id.slice(-6)}</span>
                                            <span className={`status-badge status-${order.deliveryStatus}`}>
                                                {order.deliveryStatus}
                                            </span>
                                        </div>

                                        <div className="order-items">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="order-item">
                                                    <span>{item.product?.name || 'Product'}</span>
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-footer">
                                            <p className="order-total">Total: ₹{order.totalAmount}</p>
                                            <p className="order-date">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Chat Tab */}
                    {activeTab === 'chat' && (
                        <div className="chat-section">
                            <div className="chat-header">
                                <h2>🤖 AI Farming Assistant</h2>
                                <button onClick={clearChatHistory} className="btn-clear">
                                    Clear History
                                </button>
                            </div>

                            <div className="chat-window">
                                {chatMessages.length === 0 && (
                                    <div className="chat-welcome">
                                        <h3>👋 Hello! I'm your AI farming assistant</h3>
                                        <p className="welcome-subtitle">Get expert advice on cow care and dairy farming</p>

                                        <div className="preset-questions">
                                            <p className="preset-title">💡 Quick questions you can ask:</p>
                                            <div className="question-grid">
                                                {presetQuestions.map((question, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="preset-question-btn"
                                                        onClick={() => handlePresetQuestion(question)}
                                                    >
                                                        {question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`chat-message ${msg.role}`}>
                                        <div className="message-bubble">
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {chatLoading && (
                                    <div className="chat-message assistant">
                                        <div className="message-bubble">Thinking...</div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleChatSubmit} className="chat-input-form">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={t('chatPlaceholder')}
                                    disabled={chatLoading}
                                />
                                <button type="submit" disabled={chatLoading}>
                                    {t('send')}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Products Tab (Farmers) */}
                    {activeTab === 'products' && user?.role === 'farmer' && (
                        <div className="products-section">
                            <h2>My Products</h2>
                            <Link to="/products/create" className="btn-primary">
                                + Add New Product
                            </Link>
                            <p className="placeholder-text">Product management coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
