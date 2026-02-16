const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Email templates
const templates = {
    orderConfirmation: (order) => ({
        subject: `Order Confirmation - #${order._id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Order Confirmed!</h2>
                <p>Thank you for your order. Your order has been received and is being processed.</p>
                
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                <p><strong>Status:</strong> ${order.deliveryStatus}</p>
                
                <h3>Items:</h3>
                <ul>
                    ${order.items.map(item => `
                        <li>${item.name || 'Product'} - Quantity: ${item.quantity} - ₹${item.price * item.quantity}</li>
                    `).join('')}
                </ul>
                
                <h3>Shipping Address:</h3>
                <p>
                    ${order.shippingAddress.street}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                    Phone: ${order.shippingAddress.phone}
                </p>
                
                <p>We'll notify you when your order is shipped!</p>
                <p>Thank you for shopping with Dairy Marketplace.</p>
            </div>
        `,
    }),

    orderStatusUpdate: (order, newStatus) => ({
        subject: `Order ${newStatus} - #${order._id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Order Status Updated</h2>
                <p>Your order #${order._id} has been ${newStatus}</p>
                
                ${order.trackingInfo && order.trackingInfo.trackingNumber ? `
                    <p><strong>Tracking Number:</strong> ${order.trackingInfo.trackingNumber}</p>
                    <p><strong>Courier:</strong> ${order.trackingInfo.courier}</p>
                ` : ''}
                
                <p>Thank you for your patience!</p>
            </div>
        `,
    }),

    paymentSuccess: (order) => ({
        subject: 'Payment Successful',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Payment Received!</h2>
                <p>Your payment has been successfully processed.</p>
                
                <p><strong>Amount Paid:</strong> ₹${order.totalAmount}</p>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Payment Method:</strong> ${order.paymentInfo.method}</p>
                
                <p>Thank you for your business!</p>
            </div>
        `,
    }),
};

// Send email function
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('Email credentials not configured. Skipping email send.');
            return { success: false, message: 'Email not configured' };
        }

        const info = await transporter.sendMail({
            from: `"Dairy Marketplace" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

// Specific email functions
const sendOrderConfirmation = async (order, userEmail) => {
    const { subject, html } = templates.orderConfirmation(order);
    return await sendEmail({ to: userEmail, subject, html });
};

const sendOrderStatusUpdate = async (order, userEmail, newStatus) => {
    const { subject, html } = templates.orderStatusUpdate(order, newStatus);
    return await sendEmail({ to: userEmail, subject, html });
};

const sendPaymentSuccess = async (order, userEmail) => {
    const { subject, html } = templates.paymentSuccess(order);
    return await sendEmail({ to: userEmail, subject, html });
};

module.exports = {
    sendEmail,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendPaymentSuccess,
};
