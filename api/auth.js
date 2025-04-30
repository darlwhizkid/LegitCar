import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

// Helper function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action, email, password, name, phone } = req.body;
  
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('legitcar');
    const users = db.collection('users');

    // Register new user
    if (action === 'register') {
      // Check if user already exists
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const result = await users.insertOne({
        name,
        email,
        password: hashedPassword,
        phone,
        isNewUser: true,
        createdAt: new Date().toISOString()
      });

      // Generate demo data for the new user
      await generateDemoData(db, result.insertedId.toString());

      return res.status(201).json({ 
        success: true, 
        message: 'User registered successfully' 
      });
    }
    
    // Login user
    else if (action === 'login') {
      // Find user
      const user = await users.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      // Return user data and token
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    }
    
    // Reset password
    else if (action === 'resetPassword') {
      // In a real app, you would send an email with a reset link
      // For this demo, we'll just check if the email exists
      const user = await users.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'No account found with this email' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Password reset link sent' 
      });
    }
    
    else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Generate demo data for a new user
async function generateDemoData(db, userId) {
  // Create vehicles collection
  const vehicles = db.collection('vehicles');
  await vehicles.insertMany([
    {
      userId,
      make: "Toyota",
      model: "Camry",
      year: 2020,
      vin: "1HGCM82633A123456",
      status: "Verified",
      lastChecked: new Date().toISOString()
    },
    {
      userId,
      make: "Honda",
      model: "Accord",
      year: 2019,
      vin: "5FNRL38409B006666",
      status: "Pending Verification",
      lastChecked: new Date().toISOString()
    }
  ]);

  // Create activities
  const activities = db.collection('activities');
  await activities.insertMany([
    {
      userId,
      type: "Vehicle Check",
      description: "Performed verification check on Toyota Camry",
      date: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
      status: "Completed"
    },
    {
      userId,
      type: "Document Upload",
      description: "Uploaded vehicle registration documents",
      date: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
      status: "Completed"
    }
  ]);

  // Create notifications
  const notifications = db.collection('notifications');
  await notifications.insertMany([
    {
      userId,
      title: "Verification Complete",
      message: "Your Toyota Camry has been successfully verified.",
      date: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
      read: false
    },
    {
      userId,
      title: "Document Required",
      message: "Please upload proof of ownership for your Honda Accord.",
      date: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
      read: true
    }
  ]);
}