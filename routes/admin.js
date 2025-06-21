const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();

// Use your actual JWT secret
const JWT_SECRET = 'd36c4c41931944345e889feb5eea3368295724d177768d32a358188aba21f02f';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://darlingtonodom:Coldwizkid@clusterd.bytfl.mongodb.net/LegitCar?retryWrites=true&w=majority';
let db;

// Connect to MongoDB
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
    .then(client => {
        console.log('Admin routes connected to MongoDB');
        db = client.db('LegitCar');
    })
    .catch(error => console.error('MongoDB connection error:', error));

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Access denied. No token provided.' 
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // For hardcoded admins, we'll use email as ID
        if (typeof decoded.id === 'string' && decoded.id.includes('@')) {
            req.admin = {
                email: decoded.email,
                name: 'Administrator',
                isHardcoded: true
            };
            return next();
        }
        
        // Check database admins
        const admin = await db.collection('admins').findOne({ 
            _id: new ObjectId(decoded.id) 
        });
        
        if (!admin) {
            return res.status(401).json({ 
                success: false,
                error: 'Access denied. Admin privileges required.' 
            });
        }
        
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).json({ 
            success: false,
            error: 'Invalid token.' 
        });
    }
};

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Check hardcoded admin credentials first
        const hardcodedAdmins = [
            { 
                email: 'admin@propamit.com', 
                password: 'admin123',
                name: 'System Administrator'
            },
            { 
                email: 'darlingtonodom@gmail.com', 
                password: 'Coldwizkid',
                name: 'Darlington Odom'
            },
            { 
                email: 'support@propamit.com', 
                password: 'support123',
                name: 'Support Administrator'
            }
        ];
        
        const hardcodedAdmin = hardcodedAdmins.find(admin => 
            admin.email === email && admin.password === password
        );
        
        if (hardcodedAdmin) {
            const token = jwt.sign(
                { 
                    id: hardcodedAdmin.email, 
                    email: hardcodedAdmin.email,
                    type: 'hardcoded_admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            // Log admin login
            console.log(`Admin login: ${hardcodedAdmin.email} at ${new Date().toISOString()}`);
            
            return res.json({
                success: true,
                message: 'Login successful',
                token,
                admin: {
                    email: hardcodedAdmin.email,
                    name: hardcodedAdmin.name,
                    type: 'hardcoded'
                }
            });
        }
        
        // Check database admins
        const admin = await db.collection('admins').findOne({ email });
        
        if (!admin || !bcrypt.compareSync(password, admin.password)) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        const token = jwt.sign(
            { 
                id: admin._id, 
                email: admin.email,
                type: 'database_admin'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Update last login
        await db.collection('admins').updateOne(
            { _id: admin._id },
            { $set: { lastLogin: new Date() } }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                type: 'database'
            }
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// Verify admin token (useful for checking if still logged in)
router.get('/verify', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        admin: {
            email: req.admin.email,
            name: req.admin.name || 'Administrator'
        }
    });
});

// Get dashboard stats
router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const [userCount, applicationCount, messageCount] = await Promise.all([
            db.collection('users').countDocuments({ status: { $ne: 'deleted' } }),
            db.collection('applications').countDocuments(),
            db.collection('messages').countDocuments()
        ]);
        
        const pendingApplications = await db.collection('applications')
            .countDocuments({ status: 'pending' });
        
        const approvedApplications = await db.collection('applications')
            .countDocuments({ status: 'approved' });
            
        const processingApplications = await db.collection('applications')
            .countDocuments({ status: 'processing' });
        
        const unreadMessages = await db.collection('messages')
            .countDocuments({ read: { $ne: true } });
        
        // Get recent activity
        const recentUsers = await db.collection('users')
            .find({ status: { $ne: 'deleted' } })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();
            
        const recentApplications = await db.collection('applications')
            .find({})
            .sort({ submittedAt: -1 })
            .limit(5)
            .toArray();
        
        res.json({
            success: true,
            stats: {
                totalUsers: userCount,
                totalApplications: applicationCount,
                pendingApplications,
                approvedApplications,
                processingApplications,
                totalMessages: messageCount,
                unreadMessages,
                recentUsers: recentUsers.length,
                recentApplications: recentApplications.length
            }
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching statistics' 
        });
    }
});

// Get all users with pagination and search
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const status = req.query.status || 'all';
        
        let query = { status: { $ne: 'deleted' } };
        
        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add status filter
        if (status !== 'all') {
            query.status = status;
        }
        
        const users = await db.collection('users')
            .find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
        
        const totalUsers = await db.collection('users').countDocuments(query);
        
        // Remove sensitive information
        const sanitizedUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.status || 'active',
            createdAt: user.createdAt || new Date(),
            lastLogin: user.lastLogin,
            applicationCount: 0 // We'll populate this if needed
        }));
        
        res.json({
            success: true,
            users: sanitizedUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNext: page < Math.ceil(totalUsers / limit),
                hasPrev: page > 1
            }
        });
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users' 
        });
    }
});

// Get all applications with pagination and filters
router.get('/applications', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || 'all';
        const search = req.query.search || '';
        
        let query = {};
        
        // Add status filter
        if (status !== 'all') {
            query.status = status;
        }
        
        // Add search filter
        if (search) {
            query.$or = [
                { type: { $regex: search, $options: 'i' } },
                { trackingNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        const applications = await db.collection('applications')
            .find(query)
            .sort({ submittedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
        
        const totalApplications = await db.collection('applications').countDocuments(query);
        
        // Enrich with user data
        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                let user = null;
                if (app.userId) {
                    try {
                        user = await db.collection('users').findOne({ 
                            _id: typeof app.userId === 'string' ? new ObjectId(app.userId) : app.userId 
                        });
                    } catch (err) {
                        console.log('Error finding user for application:', app._id);
                    }
                }
                
                return {
                    ...app,
                    userName: user ? user.name : 'Unknown User',
                    userEmail: user ? user.email : 'Unknown Email'
                };
            })
        );
        
        res.json({
            success: true,
            applications: enrichedApplications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalApplications / limit),
                totalApplications,
                hasNext: page < Math.ceil(totalApplications / limit),
                hasPrev: page > 1
            }
        });
        
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching applications' 
        });
    }
});

// Update application status
router.put('/applications/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const validStatuses = ['pending', 'approved', 'rejected', 'processing'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        
        const updateData = { 
            status,
            updatedAt: new Date(),
            updatedBy: req.admin.email
        };
        
        if (notes) {
            updateData.adminNotes = notes;
        }
        
        const result = await db.collection('applications').updateOne(
            { _id: typeof id === 'string' ? new ObjectId(id) : id },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            message: `Application status updated to ${status}`
        });
        
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating application status' 
        });
    }
});

// Get all messages
router.get('/messages', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unread === 'true';
        
        let query = {};
        if (unreadOnly) {
            query.read = { $ne: true };
        }
        
        const messages = await db.collection('messages')
            .find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
        
        const totalMessages = await db.collection('messages').countDocuments(query);
        
        res.json({
            success: true,
            messages: messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasNext: page < Math.ceil(totalMessages / limit),
                hasPrev: page > 1
            }
        });
        
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching messages' 
        });
    }
});

// Mark message as read
router.put('/messages/:id/read', authenticateAdmin, async (req, res) => {
    try {