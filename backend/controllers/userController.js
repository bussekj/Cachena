const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.test = async (req, res) => {
    try {
        console.log("Touched test")
        return res.status(200).json({resp:"You Got Me!"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    const { name, role, email, password} = req.body;
    console.log("Touched Register")
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, role, email, password:hashedPassword });
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
