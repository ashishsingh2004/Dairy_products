import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services';
import { useTranslation } from 'react-i18next';
import './AdminDashboard.css';

function AdminDashboard() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('analytics');
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [pendingCertifications, setPendingCertifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'analytics') {
            fetchAnalytics();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'products') {
            fetchPendingProducts();
        } else if (activeTab === 'certifications') {
            fetchPendingCertifications();
        }
    }, [activeTab]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAnalytics();
            setAnalytics(response.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getUsers();
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPendingProducts();
            setPendingProducts(response.data);
        } catch (err) {
            console.error('Failed to fetch pending products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingCertifications = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPendingCertifications();
            setPendingCertifications(response.data);
        } catch (err) {
            console.error('Failed to fetch certifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserStatusToggle = async (userId, currentStatus) => {
        try {
            await adminService.updateUserStatus(userId, !currentStatus);
            fetchUsers();
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const handleProductApproval = async (productId, approve) => {
        try {
            await adminService.approveProduct(productId, approve);
            fetchPendingProducts();
        } catch (err) {
            alert('Failed to update product status');
        }
    };

    return (
        <div className="admin-dashboard-page">
            <nav className="navbar">
                <Link to="/" className="nav-brand">🥛 Dairy Marketplace - Admin</Link>
                <div className="nav-links">
                    <Link to="/">{t('home')}</Link>
                    <Link to="/products">{t('products')}</Link>
                    <Link to="/dashboard">User Dashboard</Link>
                </div>
            </nav>

            <div className="admin-container">
                <div className="admin-header">
                    <h1>👨‍💼 Admin Control Panel</h1>
                    <p>Manage platform operations and monitor performance</p>
                </div>

                <div className="admin-tabs">
                    <button
                        className={activeTab === 'analytics' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('analytics')}
                    >
                        📊 Analytics
                    </button>
                    <button
                        className={activeTab === 'users' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Users
                    </button>
                    <button
                        className={activeTab === 'products' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('products')}
                    >
                        📦 Pending Products
                    </button>
                    <button
                        className={activeTab === 'certifications' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('certifications')}
                    >
                        ✓ Certifications
                    </button>
                </div>

                <div className="admin-content">
                    {loading && <p className="loading">{t('loading')}</p>}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && analytics && (
                        <div className="analytics-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <h3>Total Users</h3>
                                    <p className="stat-number">{analytics.totalUsers || 0}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🌾</div>
                                <div className="stat-info">
                                    <h3>Farmers</h3>
                                    <p className="stat-number">{analytics.farmers || 0}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🛒</div>
                                <div className="stat-info">
                                    <h3>Consumers</h3>
                                    <p className="stat-number">{analytics.consumers || 0}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🤝</div>
                                <div className="stat-info">
                                    <h3>Traders</h3>
                                    <p className="stat-number">{analytics.traders || 0}</p>
                                </div>
                            </div>

                            <div className="stat-card highlight">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <h3>Total Products</h3>
                                    <p className="stat-number">{analytics.totalProducts || 0}</p>
                                </div>
                            </div>

                            <div className="stat-card highlight">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <h3>Orders</h3>
                                    <p className="stat-number">{analytics.totalOrders || 0}</p>
                                </div>
                            </div>

                            <div className="stat-card success">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>Revenue</h3>
                                    <p className="stat-number">₹{analytics.totalRevenue?.toLocaleString() || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="users-section">
                            <h2>User Management</h2>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>KYC Status</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id}>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                                                <td><span className={`kyc-badge ${user.kycStatus}`}>{user.kycStatus}</span></td>
                                                <td>
                                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={`btn-action ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                                                        onClick={() => handleUserStatusToggle(user._id, user.isActive)}
                                                    >
                                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pending Products Tab */}
                    {activeTab === 'products' && (
                        <div className="products-section">
                            <h2>Pending Product Approvals</h2>
                            {pendingProducts.length === 0 ? (
                                <p className="empty-message">No pending products</p>
                            ) : (
                                <div className="approval-grid">
                                    {pendingProducts.map((product) => (
                                        <div key={product._id} className="approval-card">
                                            <h3>{product.name}</h3>
                                            <p><strong>Type:</strong> {product.type}</p>
                                            <p><strong>Price:</strong> ₹{product.price}/{product.unit}</p>
                                            <p><strong>Seller:</strong> {product.seller?.name}</p>
                                            <div className="approval-actions">
                                                <button
                                                    className="btn-approve"
                                                    onClick={() => handleProductApproval(product._id, true)}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => handleProductApproval(product._id, false)}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Certifications Tab */}
                    {activeTab === 'certifications' && (
                        <div className="certifications-section">
                            <h2>Pending Certifications</h2>
                            {pendingCertifications.length === 0 ? (
                                <p className="empty-message">No pending certifications</p>
                            ) : (
                                <div className="approval-grid">
                                    {pendingCertifications.map((cert) => (
                                        <div key={cert._id} className="approval-card">
                                            <h3>Certification Request</h3>
                                            <p><strong>Product:</strong> {cert.product?.name}</p>
                                            <p><strong>Farmer:</strong> {cert.farmer?.name}</p>
                                            <p><strong>Type:</strong> {cert.certificationType}</p>
                                            {cert.documents && cert.documents.length > 0 && (
                                                <a href={cert.documents[0].url} target="_blank" rel="noopener noreferrer" className="view-doc">
                                                    View Document
                                                </a>
                                            )}
                                            <div className="approval-actions">
                                                <button className="btn-approve">✓ Verify</button>
                                                <button className="btn-reject">✗ Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
