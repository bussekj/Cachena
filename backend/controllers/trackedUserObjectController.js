const { TrackedUserObject, User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.test = async (req, res) => {
    try {
        console.log("Touched TrackedUserObject")
        return res.status(200).json({resp:"You Got TrackedUserObject API!"});
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
    const { userId } = req.query;
    try {
        let user = await User.findByPk(userId)
        user.getTrackedUserObjects()
        .then(
            trackedUserObjects => {
            return res.status(201).json(trackedUserObjects);
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    const { name, description } = req.body;
    let is_locked = false
    try {
        const trackedUserObject = await TrackedUserObject.create({ name, description, is_locked });
        return res.status(201).json(trackedUserObject);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.update = async(req, res) => {
    const { id, name, desc, is_locked } = req.body;
    
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

exports.assign = async(req, res) => {
    const { TUOId, userId } = req.body;
    try {
        let trackedUserObject = await TrackedUserObject.findByPk(TUOId)
        trackedUserObject.addUser(userId);
        trackedUserObject.save()

        return res.status(201).json(trackedUserObject);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};