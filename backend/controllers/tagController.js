const { Tag } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.test = async (req, res) => {
    try {
        console.log("Touched Tag")
        return res.status(200).json({resp:"You Got Tag API!"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async(req, res) => {
    const { tagId } = req.query;

    try {
        let tag = await Tag.findOne({where : { tagId }})
        res.json({ tag })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const { tagId } = req.body;
    try {
        let tag = await Tag.findOne({where : { tagId }})
        await tag.destroy();
        res.status(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};