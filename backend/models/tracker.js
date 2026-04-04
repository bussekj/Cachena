
module.exports = (sequelize, DataTypes) => {
const Tracker = sequelize.define(
        'tracker', 
        {
            location: {
                type: DataTypes.STRING,
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
