import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cowService } from '../services';
import { useTranslation } from 'react-i18next';
import './CowList.css';

function CowList() {
    const { t } = useTranslation();
    const [cows, setCows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        breed: '',
        minPrice: '',
        maxPrice: '',
        city: '',
    });

    const breeds = ['Gir', 'Sahiwal', 'HF', 'Jersey', 'Ongole', 'Tharparkar', 'Red Sindhi', 'Other'];

    useEffect(() => {
        fetchCows();
    }, [filters]);

    const fetchCows = async () => {
        try {
            setLoading(true);
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await cowService.getAll(cleanFilters);
            setCows(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch cows');
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

    return (
        <div className="cow-list-page">
            <nav className="navbar">
                <Link to="/" className="nav-brand">🥛 Dairy Marketplace</Link>
                <div className="nav-links">
                    <Link to="/">{t('home')}</Link>
                    <Link to="/products">{t('products')}</Link>
                    <Link to="/cows">{t('cows')}</Link>
                    <Link to="/dashboard">{t('orders')}</Link>
                </div>
            </nav>

            <div className="cow-container">
                <aside className="filter-sidebar">
                    <h3>Filter Cows</h3>

                    <div className="filter-group">
                        <label>Breed</label>
                        <select name="breed" value={filters.breed} onChange={handleFilterChange}>
                            <option value="">All Breeds</option>
                            {breeds.map(breed => (
                                <option key={breed} value={breed}>{breed}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={filters.city}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Price Range</label>
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min Price"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max Price"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <button className="btn-reset" onClick={() => setFilters({
                        breed: '', minPrice: '', maxPrice: '', city: ''
                    })}>
                        Reset Filters
                    </button>
                </aside>

                <main className="cow-grid-container">
                    <h2>{t('cows')} Trading</h2>

                    {loading && <p className="loading">{t('loading')}</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && cows.length === 0 && (
                        <p className="no-cows">No cows found. Try adjusting your filters.</p>
                    )}

                    <div className="cow-grid">
                        {cows.map((cow) => (
                            <div key={cow._id} className="cow-card">


                                <div className="cow-info">
                                    <div className="cow-header">
                                        <h3>{cow.breed}</h3>
                                        {cow.negotiable && (
                                            <span className="negotiable-badge">Negotiable</span>
                                        )}
                                    </div>

                                    <div className="cow-details">
                                        <div className="detail-item">
                                            <span className="label">Age:</span>
                                            <span className="value">{cow.age} years</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Milk:</span>
                                            <span className="value">{cow.milkCapacity} L/day</span>
                                        </div>
                                        {cow.pregnancyStatus && (
                                            <div className="detail-item">
                                                <span className="label">Status:</span>
                                                <span className="value pregnancy-status">
                                                    {cow.pregnancyStatus.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="cow-description">{cow.description}</p>

                                    <div className="cow-footer">
                                        <p className="price">₹{cow.price.toLocaleString()}</p>
                                        <p className="location">📍 {cow.location?.city}</p>
                                    </div>

                                    {cow.healthRecords && cow.healthRecords.length > 0 && (
                                        <p className="health-records">
                                            ✓ {cow.healthRecords.length} Health Record(s)
                                        </p>
                                    )}


                                    {cow.seller && (
                                        <div className="seller-details">
                                            <h4>Seller Information</h4>
                                            <p><strong>Name:</strong> {cow.seller.name}</p>
                                            <p><strong>Email:</strong> <a href={`mailto:${cow.seller.email}`}>{cow.seller.email}</a></p>
                                            <p><strong>Phone:</strong> <a href={`tel:${cow.seller.phone}`}>{cow.seller.phone}</a></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CowList;
