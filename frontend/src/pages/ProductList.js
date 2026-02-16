import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import SkeletonLoader from '../components/SkeletonLoader';
import CartModal from '../components/CartModal';
import './ProductList.css';

function ProductList() {
    const { t } = useTranslation();
    const { addToCart, getCartCount } = useCart();
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        city: '',
        minPrice: '',
        maxPrice: '',
        minRating: '',
        search: '',
    });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await productService.getAll(cleanFilters);
            setProducts(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const renderStars = (rating) => {
        return '⭐'.repeat(Math.round(rating));
    };

    const handleAddToCart = (product) => {
        if (product.stock <= 0) {
            showToast('Product is out of stock', 'error');
            return;
        }
        addToCart(product, 1);
        showToast(`${product.name} added to cart!`, 'success');
    };

    return (
        <div className="product-list-page">
            <nav className="navbar">
                <Link to="/" className="nav-brand">🥛 Dairy Marketplace</Link>
                <div className="nav-links">
                    <Link to="/">{t('home')}</Link>
                    <Link to="/products">{t('products')}</Link>
                    <Link to="/cows">{t('cows')}</Link>
                    <Link to="/dashboard">{t('orders')}</Link>
                    <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
                        🛒
                        {getCartCount() > 0 && (
                            <span className="cart-badge">{getCartCount()}</span>
                        )}
                    </div>
                </div>
            </nav>

            <div className="product-container">
                <aside className="filter-sidebar">
                    <h3>{t('filter')}</h3>

                    <div className="filter-group">
                        <label>Product Type</label>
                        <select name="type" value={filters.type} onChange={handleFilterChange}>
                            <option value="">All Types</option>
                            <option value="raw_milk">{t('rawMilk')}</option>
                            <option value="ghee">{t('ghee')}</option>
                            <option value="paneer">{t('paneer')}</option>
                            <option value="curd">{t('curd')}</option>
                            <option value="butter">{t('butter')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('search')}</label>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label>{t('location')}</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={filters.city}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label>{t('price')} Range</label>
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Min {t('rating')}</label>
                        <select name="minRating" value={filters.minRating} onChange={handleFilterChange}>
                            <option value="">Any</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                        </select>
                    </div>

                    <button className="btn-reset" onClick={() => setFilters({
                        type: '', city: '', minPrice: '', maxPrice: '', minRating: '', search: ''
                    })}>
                        Reset Filters
                    </button>
                </aside>

                <main className="product-grid-container">
                    <div className="product-header">
                        <h2>{t('products')}</h2>
                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                            >
                                ⊞
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                            >
                                ☰
                            </button>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    {!loading && products.length === 0 && (
                        <p className="no-products">No products found. Try adjusting your filters.</p>
                    )}

                    <div className={`product-${viewMode}`}>
                        {loading ? (
                            <SkeletonLoader type="card" count={6} />
                        ) : (
                            products.map((product) => (
                                <div key={product._id} className="product-card">
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p className="product-type">{product.type.replace('_', ' ')}</p>

                                        {product.isVerified && (
                                            <span className="verified-badge">✓ Verified Quality</span>
                                        )}

                                        <div className="product-details">
                                            <p className="price">₹{product.price}/{product.unit}</p>
                                            {product.type === 'raw_milk' && product.fatPercentage && (
                                                <p className="fat-percentage">Fat: {product.fatPercentage}%</p>
                                            )}
                                        </div>

                                        <div className="rating">
                                            {renderStars(product.averageRating)}
                                            <span>({product.numReviews})</span>
                                        </div>

                                        <p className="seller">By: {product.seller?.name}</p>
                                        <p className="location">📍 {product.location?.city}</p>

                                        {product.stock > 0 ? (
                                            <button
                                                className="btn-add-to-cart"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                🛒 Add to Cart
                                            </button>
                                        ) : (
                                            <button className="btn-out-of-stock" disabled>
                                                Out of Stock
                                            </button>
                                        )}

                                        <Link to={`/products/${product._id}`} className="btn-view">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}

export default ProductList;
