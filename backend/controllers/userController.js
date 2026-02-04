const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.test = async (req, res) => {
    try {
        console.log("Touched test")
        return res.status(200).json({resp:"You Got User API!"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    const { name, role, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, role, email, password:hashedPassword });
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getUser = async(req, res) => {
    const { name, password } = req.body;

    try {
        let user = await User.findOne({where : {name : name}})
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) { 
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const adminToken  = jwt.sign({ id: user.id }, process.env.ADMIN_SECRET, { expiresIn: '1h' });
        if (user.role == 'admin')
            res.json({ token, adminToken, user})
        else  
            res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

