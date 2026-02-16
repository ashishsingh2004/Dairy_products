const express = require('express');
const router = express.Router();
const { getChatbotResponse } = require('../services/aiChatService');
const { protect } = require('../middleware/auth');

// Store conversation history in memory (for production, use database)
const conversationHistories = new Map();

// @route   POST /api/chat
// @desc    Send message to AI chatbot
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id.toString();

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Get or initialize conversation history
        let history = conversationHistories.get(userId) || [];

        // Get AI response
        const aiResponse = await getChatbotResponse(message, history);

        // Update conversation history
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: aiResponse });

        // Keep only last 10 messages (5 exchanges) to avoid token limits
        if (history.length > 10) {
            history = history.slice(-10);
        }

        conversationHistories.set(userId, history);

        res.json({
            success: true,
            data: {
                userMessage: message,
                aiResponse,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/chat/history
// @desc    Clear chat history
// @access  Private
router.delete('/history', protect, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        conversationHistories.delete(userId);

        res.json({
            success: true,
            message: 'Chat history cleared',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
