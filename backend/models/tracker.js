
module.exports = (sequelize, DataTypes) => {
const Tracker = sequelize.define(
        'tracker', 
        {
            id : {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,

            },
            location: {
                type: DataTypes.STRING,
                allowNull: false
            },
            battery: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }
    );

    return Tracker;
};
