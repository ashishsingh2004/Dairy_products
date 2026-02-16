const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { sendEmail } = require('../services/emailService');

// Process subscriptions daily at 2 AM
const processSubscriptions = cron.schedule('0 2 * * *', async () => {
    try {
        console.log('⏰ Processing daily subscriptions...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find active subscriptions that need processing today
        const activeSubscriptions = await Subscription.find({
            status: 'active',
            nextDeliveryDate: { $lte: today },
        }).populate('product subscriber seller');

        console.log(`Found ${activeSubscriptions.length} subscriptions to process`);

        for (const subscription of activeSubscriptions) {
            try {
                // Check product availability
                const product = await Product.findById(subscription.product._id);
                if (!product || product.stock < subscription.quantity) {
                    // Notify user about stock issue
                    await Notification.create({
                        user: subscription.subscriber._id,
                        type: 'system',
                        title: 'Subscription Delivery Issue',
                        message: `Insufficient stock for your subscription: ${subscription.product.name}. Delivery skipped.`,
                        relatedId: subscription._id,
                        relatedModel: 'Subscription',
                    });

                    // Skip to next delivery date
                    subscription.skipNextDelivery();
                    await subscription.save();
                    continue;
                }

                // Create order for subscription
                const orderItems = [
                    {
                        product: subscription.product._id,
                        name: subscription.product.name,
                        quantity: subscription.quantity,
                        price: subscription.pricePerDelivery / subscription.quantity,
                        unit: subscription.product.unit,
                        seller: subscription.seller._id,
                    },
                ];

                const order = new Order({
                    buyer: subscription.subscriber._id,
                    items: orderItems,
                    shippingAddress: subscription.shippingAddress,
                    paymentInfo: {
                        method: subscription.paymentMethod,
                    },
                });

                // Calculate prices
                order.calculatePrices();

                // Set payment status
                if (subscription.paymentMethod === 'cod') {
                    order.paymentStatus = 'pending';
                } else {
                    // For online payments, would need to charge the saved payment method
                    order.paymentStatus = 'pending'; // Should integrate with payment gateway
                }

                await order.save();

                // Update product stock
                product.stock -= subscription.quantity;
                await product.save();

                // Update subscription
                subscription.deliveryCount += 1;
                subscription.lastDeliveryDate = new Date();
                subscription.calculateNextDeliveryDate();

                // Check if subscription should end
                if (subscription.endDate && new Date() >= new Date(subscription.endDate)) {
                    subscription.status = 'completed';
                }

                await subscription.save();

                // Create notification
                await Notification.create({
                    user: subscription.subscriber._id,
                    type: 'order',
                    title: 'Subscription Order Created',
                    message: `Your subscription order for ${subscription.product.name} has been created.`,
                    relatedId: order._id,
                    relatedModel: 'Order',
                });

                // Send email notification (if configured)
                if (subscription.subscriber.email) {
                    await sendEmail({
                        to: subscription.subscriber.email,
                        subject: `Subscription Delivery - ${subscription.product.name}`,
                        html: `
                            <h2>Subscription Delivery</h2>
                            <p>Your subscription order has been created:</p>
                            <p><strong>Product:</strong> ${subscription.product.name}</p>
                            <p><strong>Quantity:</strong> ${subscription.quantity}</p>
                            <p><strong>Delivery Time:</strong> ${subscription.deliveryTime}</p>
                            <p><strong>Next Delivery:</strong> ${subscription.nextDeliveryDate.toDateString()}</p>
                        `,
                    });
                }

                console.log(`✅ Processed subscription: ${subscription._id}`);
            } catch (error) {
                console.error(`❌ Error processing subscription ${subscription._id}:`, error.message);
            }
        }

        console.log('✅ Subscription processing complete!');
    } catch (error) {
        console.error('❌ Subscription cron job error:', error);
    }
}, {
    scheduled: false, // Start manually
});

// Start the cron job
const startSubscriptionScheduler = () => {
    processSubscriptions.start();
    console.log('📅 Subscription scheduler started (runs daily at 2 AM)');
};

// Stop the cron job
const stopSubscriptionScheduler = () => {
    processSubscriptions.stop();
    console.log('📅 Subscription scheduler stopped');
};

module.exports = {
    startSubscriptionScheduler,
    stopSubscriptionScheduler,
    processSubscriptions,
};
