const { Tracker, TrackedUserObject } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.test = async (req, res) => {
    try {
        console.log("Touched tracker")
        res.status(200).json({resp:"You Got Tracker!"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async(req, res) => {
    // Support both frontend '?id=' and potential '?trackerUUID='
    const id = req.query.id || req.query.trackerUUID; 
    try {
        let tracker = await Tracker.findOne({where : { trackerUUID : id}})
        res.json({ tracker })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.assign = async(req, res) => {
    const { trackerUUID, TUOId } = req.body;
    try {
        let trackedUserObject = await TrackedUserObject.findByPk(TUOId)
        let tracker = await Tracker.findOne({where: { trackerUUID }})
        
        // For 1-to-1 relationships, Sequelize uses set<Model> instead of add<Model>
        await trackedUserObject.setTracker(tracker);
        
        return res.status(201).json(trackedUserObject);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.update = async(req, res) => {
    const { UUID, lat, lon, battery, RssiValue, SnrValue } = req.body;
    let latitude = lat / 10000;
    let longitude = lon / 10000;
    try {
        let tracker = await Tracker.findOne({where : { trackerUUID : UUID }})
        if (!tracker) {
            tracker = await Tracker.create({  trackerUUID:UUID, latitude, longitude, battery });
            res.status(201).json(tracker)
            return
        }

        if (tracker)
        {
            tracker.longitude = longitude;
            tracker.latitude = latitude;
            if (battery !== undefined && battery !== "")
                tracker.battery = battery;
            await tracker.save();
        }

        res.json({ tracker })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
