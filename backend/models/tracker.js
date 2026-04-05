
module.exports = (sequelize, DataTypes) => {
const Tracker = sequelize.define(
        'tracker', 
        {
            trackerUUID: {
                type: DataTypes.SMALLINT,
                allowNull: false
            },
            longitude: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            latitude: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            battery: {
                type: DataTypes.SMALLINT,
                allowNull: false
            }
        }
    );

    return Tracker;
};
