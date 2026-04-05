const { Tracker } = require('../models');
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
    const { trackerUUID } = req.query;
    try {
        let tracker = await Tracker.findOne({where : { trackerUUID : trackerUUID}})
        res.json({ tracker })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.assign = async(req, res) => {
    const { trackerUUID, TUOId } = req.body;
    try {
        let trackedUserObject = await TrackedUserObject.findByPk(TUOId)
        trackedUserObject.addTracker(trackerUUID);
        trackedUserObject.save()
        
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

        if (tracker != "")
        {
            tracker.longitude = longitude;
            tracker.latitude = latitude;
            if (battery != "")
                tracker.battery = battery;
        }
        tracker.save();

        res.json({ tracker })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
