const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Story = require('./models/story');
require('dotenv').config();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:4200' // Allow CORS for requests from this origin
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Define the JWT secret key


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
       return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
   
    const token = authHeader.split(' ')[1]; // Extract the token from "Bearer token"
    if (!token) {
       return res.status(401).json({ message: 'Invalid token format.' });
    }
   
    try {
       const decoded = jwt.verify(token, jwtSecretKey);
       req.user = decoded;
       next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).json({ message: 'Invalid token.' });
    }
    
};


// Connect to MongoDB
mongoose.connect("mongodb+srv://Olyvicp:olyvicpogi@cluster0.tb3i00j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log('Connected to the database');
})
.catch(() => {
    console.log('connection failed');
});

// User model and routes
const UserSchema = new mongoose.Schema({
    username: {
       type: String,
       required: true,
       unique: true
    },
    password: {
       type: String,
       required: true
    },
    email: { // Ensure this line is included
       type: String,
       required: true,
       unique: true
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
     },
     lockoutEnd: {
        type: Date,
        default: null
     }
   });
   
   UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
       this.password = await bcrypt.hash(this.password, 10);
    }
    next();
   });
   
   UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
   };
   

// Declare User model only once
const User = mongoose.model('User', UserSchema);

// Registration route
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username ||!password ||!email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = new User({
            username: username,
            password: password,
            email: email
        });

        

        console.log('Saving user:', user);
await user.save();
console.log('User saved:', user);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login route
const jwtSecretKey = 'Vic123';

app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        user.failedLoginAttempts++;
        if (user.failedLoginAttempts >= 3) {
          user.lockoutEnd = new Date(Date.now() + 10 * 60 * 1000); // Lockout for 10 minutes
        }
        await user.save();
        return res.status(400).json({ message: 'Invalid password' });
      } else {
        user.failedLoginAttempts = 0; // Reset failed attempts on successful login
        await user.save();
        const token = jwt.sign({ id: user._id, username: user.username }, jwtSecretKey, { expiresIn: '1h' });
        res.json({ token });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: error.message });
    }
});

// Post model and routes
const PostSchema = new mongoose.Schema({
 title: String,
 content: String,
 imageUrl: String,
});

const Post = mongoose.model('Post', PostSchema);

// Route to create a new post
app.post("/api/posts", verifyToken, async (req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.body.imageUrl
            // Remove the userId assignment
        });

        await post.save();
        res.status(201).json({ message: 'post added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error saving post', error: err });
    }
});

// Route to fetch all posts
app.get('/api/posts', async (req, res) => { // Directly use async function
    try {
        const posts = await Post.find();
        res.status(200).json({ message: 'Posts fetched successfully', posts });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ message: 'Error fetching posts', error: err.message });
    }
});


// Route to fetch posts by user ID
// app.get('/api/byUser/:userId', async (req, res) => {
//     try {
//         const posts = await Post.find({ userId: req.params.userId }).populate('userId');
//         if (!posts) {
//             return res.status(404).json({ message: 'No posts found for this user' });
//         }
//         res.status(200).json({ message: 'Posts fetched successfully', posts });
//     } catch (error) {
//         console.error('Error fetching posts by user ID:', error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// });

// Start the server on port 3001
const port = 3001;
app.listen(port, () => {
 console.log(`Server running on port ${port}`);
});

app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ message: 'Error deleting post', error: err.message });
    }
});

// Route to update a post
app.put('/api/posts/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ message: 'Error updating post', error: err.message });
    }
});

app.post('/change-password', async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        // Update the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
});



app.get('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

app.post('/api/stories', async (req, res) => {
    try {
      const story = new Story(req.body);
      await story.save();
      res.status(201).json({ message: 'Story added successfully', story });
    } catch (error) {
      res.status(500).json({ message: 'Error adding story', error: error.message });
    }
  });

  setInterval(async () => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 1);
    Story.find({ createdAt: { $lt: dateThreshold } }).then(story => {
      Story.deleteOne({ _id: story._id });
    });
  }, 24 * 60 * 60 * 1000); // Run every 24 hours

  const multer = require('multer'); // For handling multipart/form-data, which is primarily used for uploading files
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${Date.now().toISOString()}-${file.originalname}`)
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now().toISOString()}-${file.originalname}`)
    }
  })
  
  const upload = multer({ storage: storage })
  
  // Endpoint for uploading profile pictures
  app.post('/upload-profile-picture', upload.single('image'), async (req, res) => {
    try {
      // req.file is the 'image' file
      const filePath = req.file.path; // Path where the file is stored locally
      const imageUrl = `http://localhost:3001/uploads/${Date.now().toISOString()}-${file.originalname}`; // Generate a URL for the uploaded image
  
      // Find the user by ID (assuming you have the user's ID available)
      const userId = req.user.id; // This requires the verifyToken middleware to run before this route
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's profile picture URL
      user.profilePictureUrl = imageUrl;
      await user.save();
  
      res.status(200).json({ message: 'Profile picture updated successfully', imageUrl });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ message: 'Error updating profile picture', error: error.message });
    }
  });

  app.get('/api/posts/:userId', verifyToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      const posts = await Post.find({ userId: userId });
      if (!posts) {
        return res.status(404).json({ message: 'No posts found for this user' });
      }
      res.status(200).json({ message: 'Posts fetched successfully', posts });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
  });

module.exports = app;