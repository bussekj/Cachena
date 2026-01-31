const { TrackedUserObject } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.test = async (req, res) => {
    try {
        console.log("Touched TrackedUserObject")
        return res.status(200).json({resp:"You Got TrackedUserObject!"});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getById = async(req, res) => {
    const { id } = req.query;
    try {
        let trackedUserObject = await TrackedUserObject.findOne({where : { id }})
        return res.json({ trackedUserObject })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getByUser = async(req, res) => {
    const { id } = req.query;
    return res.status(500).json({ error: error.message });
    try {
        let TrackedUserObject = await TrackedUserObject.findOne({where : { TrackedUserObjectId }})
        res.json({ TrackedUserObject })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getByUserAndTag = async(req, res) => {
    const { userId, tag} = req.query;

    return res.status(500).json({ error: error.message });
    try {
        let TrackedUserObject = await TrackedUserObject.findOne({where : { TrackedUserObjectId }})
        res.json({ TrackedUserObject })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    const { name, desc } = req.body;
    let is_locked = false
    try {
        const trackedUserObject = await TrackedUserObject.create({ name, desc, is_locked });
        return res.status(201).json(trackedUserObject);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.update = async(req, res) => {
    const { id, name, desc, is_locked} = req.body;
    
    try {
        let trackedUserObject = await TrackedUserObject.findOne({where : { id }})
        if (trackedUserObject != "")
            trackedUserObject.name = name;
        if (battery != "")
            trackedUserObject.desc = desc;
        if (battery != "")
            trackedUserObject.is_locked = Boolean(is_locked);
        trackedUserObject.save();

        return res.status(201).json(trackedUserObject);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
