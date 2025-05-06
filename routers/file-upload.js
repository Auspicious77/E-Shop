const express = require('express');
const multer = require('multer');
const cloudinary = require('../helpers/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce-app',
        allowed_formats: ['jpg', 'png', 'PNG', 'jpeg', 'pdf',],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

const upload = multer({ storage });

// Upload single image
router.post('/upload-single', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    res.status(200).json({
        success: true,
        data: {
            url: req.file.path,
            public_id: req.file.filename,
            format: req.file.format,
            resource_type: req.file.resource_type,
        },
    });
});

// Upload multiple images
router.post('/upload-multiple', upload.array('images', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const uploads = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
        format: file.format,
        resource_type: file.resource_type,
    }));

    res.status(200).json({
        success: true,
        data: uploads,
    });
});

module.exports = router;
