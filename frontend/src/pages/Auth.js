import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Auth.css';

function Auth() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'consumer',
        phone: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        const errors = {};

        switch (name) {
            case 'name':
                if (!value.trim() && !isLogin) {
                    errors.name = 'Name is required';
                } else if (value.trim().length < 2 && !isLogin) {
                    errors.name = 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                if (!value) {
                    errors.email = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    errors.email = 'Email is invalid';
                }
                break;
            case 'password':
                if (!value) {
                    errors.password = 'Password is required';
                } else if (value.length < 6) {
                    errors.password = 'Password must be at least 6 characters';
                }
                break;
            case 'phone':
                if (value && !/^\+?[\d\s-()]+$/.test(value)) {
                    errors.phone = 'Invalid phone number format';
                }
                break;
            default:
                break;
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear field error when user types
        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: '',
            });
        }

        // Validate on blur
        const errors = validateField(name, value);
        if (errors[name]) {
            setFieldErrors({
                ...fieldErrors,
                ...errors,
            });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errors = validateField(name, value);
        setFieldErrors({
            ...fieldErrors,
            ...errors,
        });
    };

    const validateForm = () => {
        const errors = {};

        if (!isLogin) {
            const nameErrors = validateField('name', formData.name);
            Object.assign(errors, nameErrors);
        }

        const emailErrors = validateField('email', formData.email);
        Object.assign(errors, emailErrors);

        const passwordErrors = validateField('password', formData.password);
        Object.assign(errors, passwordErrors);

        if (!isLogin && formData.phone) {
            const phoneErrors = validateField('phone', formData.phone);
            Object.assign(errors, phoneErrors);
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate form
        if (!validateForm()) {
            setError('Please fix the errors above');
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await login({ email: formData.email, password: formData.password });
                setSuccess('Login successful! Redirecting...');
            } else {
                await register(formData);
                setSuccess('Registration successful! Redirecting...');
            }

            // Show success message before redirecting
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Auth error:', err);
            const errorMessage = err.response?.data?.message || err.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again`;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode) => {
        setIsLogin(mode === 'login');
        setError('');
        setSuccess('');
        setFieldErrors({});
        // Keep email and password when switching modes
        if (mode === 'register') {
            setFormData({
                ...formData,
                name: '',
                phone: '',
                role: 'consumer',
            });
        }
    };

    return (
        <div className="auth-page">
            {/* Complete Village Scene Background */}
            <div className="village-scene">
                {/* Sun */}
                <div className="sun">☀️</div>

                {/* Flying Birds */}
                <div className="bird bird-1">🦅</div>
                <div className="bird bird-2">🦅</div>

                {/* Trees */}
                <div className="tree tree-left">🌳</div>
                <div className="tree tree-right">🌴</div>
                <div className="tree tree-center">🌲</div>

                {/* Mud Houses */}
                <div className="mud-house house-1">🏠</div>
                <div className="mud-house house-2">🏡</div>

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
                <div className="animal cow-grazing">🐄</div>
                <div className="animal buffalo">🐃</div>

                {/* Well */}
                <div className="well">🪣</div>
            </div>

            <div className="auth-container-village">
                <Link to="/" className="back-home">← गृह पेज (Home)</Link>

                <div className="auth-card-village">
                    {/* Traditional Border Pattern */}
                    <div className="traditional-border-top"></div>

                    <div className="auth-header-village">
                        <div className="village-icon">🏘️</div>
                        <h1>डेयरी बाज़ार</h1>
                        <p className="village-tagline">ग्रामीण डेयरी बाज़ार</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="auth-tabs-village">
                        <button
                            className={isLogin ? 'active' : ''}
                            onClick={() => switchMode('login')}
                        >
                            प्रवेश करें (Login)
                        </button>
                        <button
                            className={!isLogin ? 'active' : ''}
                            onClick={() => switchMode('register')}
                        >
                            पंजीकरण करें (Register)
                        </button>
                    </div>

                    {error && (
                        <div className="error-message-village">
                            <span className="message-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message-village">
                            <span className="message-icon">✅</span>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form-village">
                        {!isLogin && (
                            <div className="form-group-village">
                                <label>
                                    <span className="label-icon">👤</span>
                                    नाम (Name) <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="अपना नाम दर्ज करें"
                                    className={fieldErrors.name ? 'input-error' : ''}
                                />
                                {fieldErrors.name && (
                                    <span className="field-error">{fieldErrors.name}</span>
                                )}
                            </div>
                        )}

                        <div className="form-group-village">
                            <label>
                                <span className="label-icon">📧</span>
                                ईमेल (Email) <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="example@gmail.com"
                                className={fieldErrors.email ? 'input-error' : ''}
                            />
                            {fieldErrors.email && (
                                <span className="field-error">{fieldErrors.email}</span>
                            )}
                        </div>

                        <div className="form-group-village">
                            <label>
                                <span className="label-icon">🔒</span>
                                पासवर्ड (Password) <span className="required">*</span>
                                {!isLogin && <span className="hint">(minimum 6 characters)</span>}
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="******"
                                    className={fieldErrors.password ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? '👁️' : '🙈'}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <span className="field-error">{fieldErrors.password}</span>
                            )}
                        </div>

                        {!isLogin && (
                            <>
                                <div className="form-group-village">
                                    <label>
                                        <span className="label-icon">📱</span>
                                        फ़ोन नंबर (Phone)
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="+91 XXXXXXXXXX"
                                        className={fieldErrors.phone ? 'input-error' : ''}
                                    />
                                    {fieldErrors.phone && (
                                        <span className="field-error">{fieldErrors.phone}</span>
                                    )}
                                </div>

                                <div className="form-group-village">
                                    <label>
                                        <span className="label-icon">👥</span>
                                        भूमिका (Role) <span className="required">*</span>
                                    </label>
                                    <select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="consumer">उपभोक्ता (Consumer)</option>
                                        <option value="farmer">किसान (Farmer)</option>
                                        <option value="trader">व्यापारी (Trader)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={loading} className="btn-village-primary">
                            {loading ? (
                                <span className="loading-text">
                                    <span className="spinner"></span>
                                    कृपया प्रतीक्षा करें...
                                </span>
                            ) : isLogin ? (
                                <span>प्रवेश करें 🚪</span>
                            ) : (
                                <span>पंजीकरण करें ✍️</span>
                            )}
                        </button>

                        {isLogin && (
                            <div className="auth-footer-links">
                                <p>
                                    नया उपयोगकर्ता हैं?{' '}
                                    <button type="button" onClick={() => switchMode('register')} className="link-btn">
                                        यहाँ पंजीकरण करें
                                    </button>
                                </p>
                            </div>
                        )}

                        {!isLogin && (
                            <div className="auth-footer-links">
                                <p>
                                    पहले से खाता है?{' '}
                                    <button type="button" onClick={() => switchMode('login')} className="link-btn">
                                        यहाँ प्रवेश करें
                                    </button>
                                </p>
                            </div>
                        )}
                    </form>

                    <div className="traditional-border-bottom"></div>
                </div>

                {/* Village Footer */}
                <div className="village-footer">
                    <p>🌾 भारतीय किसान का साथी 🐄</p>
                </div>
            </div>
        </div>
    );
}

export default Auth;
