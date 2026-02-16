import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return <ProductCardSkeleton />;
            case 'list':
                return <ListItemSkeleton />;
            case 'text':
                return <TextSkeleton />;
            case 'circle':
                return <CircleSkeleton />;
            case 'stats':
                return <StatsSkeleton />;
            default:
                return <ProductCardSkeleton />;
        }
    };

    return (
        <div className="skeleton-container">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index}>{renderSkeleton()}</div>
            ))}
        </div>
    );
};

// Product Card Skeleton
const ProductCardSkeleton = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-image"></div>
        <div className="skeleton-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-button"></div>
        </div>
    </div>
);

// List Item Skeleton
const ListItemSkeleton = () => (
    <div className="skeleton-list-item">
        <div className="skeleton skeleton-avatar"></div>
        <div className="skeleton-list-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
        </div>
    </div>
);

// Text Skeleton
const TextSkeleton = () => (
    <div className="skeleton-text-block">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
    </div>
);

// Circle Skeleton (for avatars)
const CircleSkeleton = () => (
    <div className="skeleton skeleton-circle"></div>
);

// Stats Card Skeleton
const StatsSkeleton = () => (
    <div className="skeleton-stats">
        <div className="skeleton skeleton-circle small"></div>
        <div className="skeleton-stats-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text short"></div>
        </div>
    </div>
);

export default SkeletonLoader;
