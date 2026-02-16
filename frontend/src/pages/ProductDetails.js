import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import ProductCarousel from '../components/ProductCarousel';
import './ProductDetails.css';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { t } = useTranslation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    // Keyboard navigation for zoom modal
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!showZoom || !product?.images) return;

            if (e.key === 'Escape') {
                setShowZoom(false);
            } else if (e.key === 'ArrowLeft') {
                setSelectedImage((prev) =>
                    prev === 0 ? product.images.length - 1 : prev - 1
                );
            } else if (e.key === 'ArrowRight') {
                setSelectedImage((prev) =>
                    prev === product.images.length - 1 ? 0 : prev + 1
                );
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showZoom, product]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productService.getById(id);
            setProduct(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    const navigateImage = (direction) => {
        if (!product?.images) return;
        if (direction === 'prev') {
            setSelectedImage((prev) =>
                prev === 0 ? product.images.length - 1 : prev - 1
            );
        } else {
            setSelectedImage((prev) =>
                prev === product.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            await productService.addReview(id, { rating, comment: reviewText });
            setReviewText('');
            setRating(5);
            fetchProduct(); // Refresh to show new review
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add review');
        }
    };

    const renderStars = (count, interactive = false, onRate = null) => {
        return [...Array(5)].map((_, index) => (
            <span
                key={index}
                className={`star ${index < count ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                onClick={() => interactive && onRate && onRate(index + 1)}
            >
                ★
            </span>
        ));
    };

    if (loading) return <div className="loading">{t('loading')}</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!product) return <div className="error-message">Product not found</div>;

    return (
        <div className="product-details-page">
            <nav className="navbar">
                <Link to="/" className="nav-brand">🥛 Dairy Marketplace</Link>
                <div className="nav-links">
                    <Link to="/">{t('home')}</Link>
                    <Link to="/products">{t('products')}</Link>
                    <Link to="/cows">{t('cows')}</Link>
                    <Link to="/dashboard">{t('orders')}</Link>
                </div>
            </nav>

            <div className="product-details-container">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back
                </button>

                <div className="product-details-grid">
                    {/* Image Gallery */}
                    <div className="image-section">
                        <div className="main-image" onClick={() => product.images && product.images.length > 0 && setShowZoom(true)}>
                            {product.images && product.images.length > 0 ? (
                                <>
                                    <img src={product.images[selectedImage].url} alt={product.name} />
                                    <div className="zoom-hint">🔍 Click to zoom</div>
                                    {product.images.length > 1 && (
                                        <>
                                            <button
                                                className="gallery-nav-btn prev"
                                                onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                                                aria-label="Previous image"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                className="gallery-nav-btn next"
                                                onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                                                aria-label="Next image"
                                            >
                                                ›
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="no-image-large">📦</div>
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="image-thumbnails">
                                {product.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.url}
                                        alt={`${product.name} ${idx + 1}`}
                                        className={selectedImage === idx ? 'active' : ''}
                                        onClick={() => setSelectedImage(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="info-section">
                        <h1>{product.name}</h1>

                        {product.isVerified && (
                            <span className="verified-badge-large">✓ Verified Quality</span>
                        )}

                        <div className="rating-section">
                            {renderStars(Math.round(product.averageRating))}
                            <span className="rating-count">({product.numReviews} reviews)</span>
                        </div>

                        <div className="price-section">
                            <span className="price-large">₹{product.price}</span>
                            <span className="unit">per {product.unit}</span>
                        </div>

                        <div className="product-meta">
                            <div className="meta-item">
                                <span className="label">Type:</span>
                                <span className="value">{product.type.replace('_', ' ')}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Seller:</span>
                                <span className="value">{product.seller?.name}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Location:</span>
                                <span className="value">📍 {product.location?.city}, {product.location?.state}</span>
                            </div>
                            {product.type === 'raw_milk' && product.fatPercentage && (
                                <div className="meta-item">
                                    <span className="label">Fat %:</span>
                                    <span className="value highlight">{product.fatPercentage}%</span>
                                </div>
                            )}
                            {product.stock !== undefined && (
                                <div className="meta-item">
                                    <span className="label">Stock:</span>
                                    <span className="value">{product.stock} {product.unit}s</span>
                                </div>
                            )}
                        </div>

                        <p className="description">{product.description}</p>

                        <div className="quantity-section">
                            <label>Quantity:</label>
                            <div className="quantity-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        <button className="btn-add-to-cart">
                            Add to Cart - ₹{product.price * quantity}
                        </button>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <h2>Customer Reviews</h2>

                    {isAuthenticated && (
                        <form className="review-form" onSubmit={handleAddReview}>
                            <h3>Write a Review</h3>
                            <div className="rating-input">
                                <label>Rating:</label>
                                {renderStars(rating, true, setRating)}
                            </div>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with this product..."
                                required
                            />
                            <button type="submit" className="btn-submit-review">Submit Review</button>
                        </form>
                    )}

                    <div className="reviews-list">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review, idx) => (
                                <div key={idx} className="review-card">
                                    <div className="review-header">
                                        <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                                        <div className="review-rating">{renderStars(review.rating)}</div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-reviews">No reviews yet. Be the first to review!</p>
                        )}
                    </div>
                </div>

                {/* Related Products Carousel */}
                {product && (
                    <ProductCarousel
                        currentProductId={product._id}
                        productType={product.type}
                    />
                )}
            </div>

            {/* Image Zoom Modal */}
            {showZoom && product.images && product.images.length > 0 && (
                <div className="image-zoom-modal" onClick={() => setShowZoom(false)}>
                    <button className="zoom-close-btn" onClick={() => setShowZoom(false)}>×</button>
                    <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
                        <img src={product.images[selectedImage].url} alt={product.name} />
                        {product.images.length > 1 && (
                            <>
                                <button className="zoom-nav-btn prev" onClick={() => navigateImage('prev')}>‹</button>
                                <button className="zoom-nav-btn next" onClick={() => navigateImage('next')}>›</button>
                                <div className="zoom-counter">
                                    {selectedImage + 1} / {product.images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetails;
