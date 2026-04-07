module.exports = (sequelize, DataTypes) => {
const TrackedUserObject = sequelize.define(
        'trackedUserObject', 
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.STRING
            },
            is_locked: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            }
        }
    );

    return TrackedUserObject;
};
