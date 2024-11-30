const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const User = require('./models/Users');
const Task = require('./models/Tasks');
const authenticate = require('./middleware/authenticate');
const app = express();
const PORT = process.env.PORT || 4000; // Change the port number to 3000

// Load environment variables from .env file
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // Get the JWT secret key from environment variables
const MONGO_URI = process.env.MONGO_URI; // Get the MongoDB URI from environment variables

// Function to connect to MongoDB
const connectWithRetry = () => {
    console.log('MongoDB connection with retry');
    mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB is connected');
    })
    .catch(err => {
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.', err);
        setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// User login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Create a task
app.post('/tasks', authenticate, async (req, res) => {
    const task = new Task({ ...req.body, user: req.user.userId });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all tasks
app.get('/tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.userId });
        res.send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a task
app.put('/tasks/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a task
app.delete('/tasks/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).send();
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
