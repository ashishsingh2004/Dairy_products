import React from 'react';
import { useCart } from '../context/CartContext';
import './CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

    if (!isOpen) return null;

    const handleCheckout = () => {
        // Navigate to checkout or show checkout modal
        alert('Checkout functionality - Navigate to /checkout or implement checkout flow');
        onClose();
    };

    return (
        <div className="cart-modal-overlay" onClick={onClose}>
            <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>🛒 Your Cart</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                        <button className="btn-continue" onClick={onClose}>Continue Shopping</button>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item._id} className="cart-item">
                                    {item.images && item.images.length > 0 && (
                                        <img src={item.images[0].url} alt={item.name} />
                                    )}
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p className="item-price">₹{item.price}/{item.unit}</p>
                                        {item.type && <p className="item-type">{item.type.replace('_', ' ')}</p>}
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="item-total">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(item._id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <h3>Total:</h3>
                                <h3>₹{getCartTotal().toFixed(2)}</h3>
                            </div>
                            <div className="cart-buttons">
                                <button className="btn-clear" onClick={clearCart}>Clear Cart</button>
                                <button className="btn-checkout" onClick={handleCheckout}>
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartModal;
