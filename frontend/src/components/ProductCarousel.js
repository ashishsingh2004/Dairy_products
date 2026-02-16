import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import './ProductCarousel.css';

function ProductCarousel({ currentProductId, productType }) {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRelatedProducts();
    }, [currentProductId, productType]);

    const fetchRelatedProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAll({ type: productType });
            // Filter out current product and limit to 10
            const filtered = response.data
                .filter(p => p._id !== currentProductId)
                .slice(0, 10);
            setRelatedProducts(filtered);
        } catch (err) {
            console.error('Failed to fetch related products:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollCarousel = (direction) => {
        const carousel = document.querySelector('.carousel-track');
        const cardWidth = 300; // Card width + gap
        const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    if (loading || relatedProducts.length === 0) return null;

    return (
        <div className="product-carousel">
            <h2>🛍️ You May Also Like</h2>
            <div className="carousel-container">
                <button
                    className="carousel-btn prev"
                    onClick={() => scrollCarousel('left')}
                    aria-label="Previous products"
                >
                    ‹
                </button>

                <div className="carousel-track">
                    {relatedProducts.map((product) => (
                        <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            className="carousel-card"
                        >
                            <div className="carousel-image">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0].url} alt={product.name} />
                                ) : (
                                    <div className="carousel-no-image">📦</div>
                                )}
                            </div>
                            <div className="carousel-info">
                                <h3>{product.name}</h3>
                                <div className="carousel-price">₹{product.price}</div>
                                <div className="carousel-rating">
                                    {'⭐'.repeat(Math.round(product.averageRating || 0))}
                                    <span>({product.numReviews || 0})</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <button
                    className="carousel-btn next"
                    onClick={() => scrollCarousel('right')}
                    aria-label="Next products"
                >
                    ›
                </button>
            </div>
        </div>
    );
}

export default ProductCarousel;
