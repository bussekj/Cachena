const { Tracker } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.test = async (req, res) => {
    try {
        console.log("Touched tracker")
        return res.status(200).json({resp:"You Got Tracker!"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async(req, res) => {
    const { id } = req.query;

    try {
        let tracker = await Tracker.findOne({where : { trackerId }})
        res.json({ tracker })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    const { id, location, battery} = req.body;
    try {
        const tracker = await Tracker.create({  id, location, battery });
        return res.status(201).json(tracker);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.update = async(req, res) => {
    const { id, location, battery } = req.body;

    try {
        let tracker = await Tracker.findOne({where : { id }})
        if (tracker != "")
            tracker.location = location;
        if (battery != "")
            tracker.battery = battery;
        tracker.save();

        res.json({ tracker })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
