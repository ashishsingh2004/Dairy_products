const express = require('express');
const router = express.Router();
const Certification = require('../models/Certification');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload } = require('../config/cloudinary');

// @route   POST /api/certifications
// @desc    Upload certification documents
// @access  Private (Farmers only)
router.post('/', protect, authorize('farmer'), upload.fields([
    { name: 'fatTestReport', maxCount: 1 },
    { name: 'labCertification', maxCount: 1 }
]), async (req, res) => {
    try {
        const { productId } = req.body;

        // Check if product exists and belongs to the farmer
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to certify this product' });
        }

        const fatTestReport = req.files && req.files['fatTestReport']
            ? {
                url: req.files['fatTestReport'][0].path,
                publicId: req.files['fatTestReport'][0].filename,
            }
            : null;

        const labCertification = req.files && req.files['labCertification']
            ? {
                url: req.files['labCertification'][0].path,
                publicId: req.files['labCertification'][0].filename,
            }
            : null;

        const certification = await Certification.create({
            product: productId,
            farmer: req.user._id,
            fatTestReport,
            labCertification,
        });

        // Link certification to product
        product.certification = certification._id;
        await product.save();

        res.status(201).json({
            success: true,
            data: certification,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/certifications/product/:productId
// @desc    Get certification for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
    try {
        const certification = await Certification.findOne({ product: req.params.productId })
            .populate('farmer', 'name email')
            .populate('verifiedBy', 'name');

        if (!certification) {
            return res.status(404).json({ message: 'Certification not found' });
        }

        res.json(certification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/certifications/:id/verify
// @desc    Verify certification
// @access  Private (Admin only)
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
    try {
        const { verificationStatus, rejectionReason, premiumPricingEnabled } = req.body;

        const certification = await Certification.findById(req.params.id);

        if (!certification) {
            return res.status(404).json({ message: 'Certification not found' });
        }

        certification.verificationStatus = verificationStatus;
        certification.verifiedBy = req.user._id;
        certification.verificationDate = Date.now();

        if (verificationStatus === 'rejected' && rejectionReason) {
            certification.rejectionReason = rejectionReason;
        }

        if (verificationStatus === 'approved') {
            certification.premiumPricingEnabled = premiumPricingEnabled || false;

            // Update product verification status
            const product = await Product.findById(certification.product);
            if (product) {
                product.isVerified = true;
                await product.save();
            }
        }

        await certification.save();

        res.json({
            success: true,
            data: certification,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
