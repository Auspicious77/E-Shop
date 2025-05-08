const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authJwt = require('../helpers/jwt');
const checkAdmin = require('../helpers/check-admin');

// Async wrapper for error handling
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


const sendVerificationEmail = require('../utils/send-mail');
const generate5DigitToken = require('../utils/generateToken');

// Inside try block, after saving the user
// const token = Math.floor(10000 + Math.random() * 90000);
// const { randomBytes } = require('node:crypto');
// const token = randomBytes(20).toString('hex'); 

const token = generate5DigitToken();

const expires = Date.now() + 10 * 60 * 1000; // token expires in 10 minutes


// Helper function to validate required fields
function validateFields(requiredFields, body) {
    for (let field of requiredFields) {
        if (!body[field]) {
            const label = field.charAt(0).toUpperCase() + field.slice(1);
            return `${label} is required`;
        }
    }
    return null;
}


// GET all users (without passwordHash)
router.get('/', authJwt(), checkAdmin, asyncHandler(async (req, res) => {
    const userList = await User.find().select('-passwordHash');
    res.status(200).json(userList);
}));

// GET a single user by ID
router.get('/:id', asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        return next(error);
    }
    res.status(200).json(user);
}));


// Register route
router.post('/register', async (req, res) => {
    const { name, email, password, phone, isAdmin, apartment, street, zip, city, country } = req.body;

    const requiredFields = ['name', 'email', 'password', 'phone', 'street', 'zip', 'city', 'country'];
    const missingFieldMessage = validateFields(requiredFields, req.body);

    if (missingFieldMessage) {
        return res.status(400).json({
            data: null,
            message: missingFieldMessage
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                data: null,
                message: 'User with this email already exists'
            });
        }
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            return res.status(409).json({
                data: null,
                message: 'User with this phone number already exists'
            });
        }

        const existingUserByName = await User.findOne({ name });
        if (existingUserByName) {
            return res.status(409).json({
                data: null,
                message: 'User with this name already exists'
            });
        }


        const user = new User({
            name,
            email,
            passwordHash: bcrypt.hashSync(password, 10),
            phone,
            isAdmin,
            apartment,
            street,
            zip,
            city,
            country,
            verificationCode: token,
            verificationCodeExpires: expires
        });

        const savedUser = await user.save();

        // Remove passwordHash before sending response
        const userResponse = savedUser.toObject();
        delete userResponse.passwordHash;

        // Optionally: Save token to user record for later verification
        savedUser.verificationToken = token;
        await savedUser.save();

        await sendVerificationEmail(email,token);



        return res.status(201).json({
            data: userResponse,
            message: "User registered successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            data: null,
            message: "An unexpected error occurred"
        });
    }
});

// LOGIN user
router.post('/login', asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            data: null,
            message: 'Email and Password are required',
        });
    }

    const secret = process.env.secret;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({
            data: null,
            message: 'User doesnot exist',
        });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

    if (!isPasswordValid) {
        return res.status(400).json({
            data: null,
            message: 'Password is incorrect',
        });
    }

    const token = jwt.sign(
        {
            userId: user._id,
            isAdmin: user.isAdmin,
        },
        secret,
        { expiresIn: '1d' }
    );

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(200).json({
        data: userResponse,
        token,
    });
}));


// GET user count
router.get('/get/count', asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    res.status(200).json({ userCount });
}));

// DELETE user by ID
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndRemove(req.params.id);

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        return next(error);
    }

    res.status(200).json({
        success: true,
        message: 'The user has been deleted',
    });
}));


router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


module.exports = router;
