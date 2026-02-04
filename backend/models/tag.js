module.exports = (sequelize, DataTypes) => {
const Tag = sequelize.define(
        'tag', 
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            color: {
                type: DataTypes.STRING,
                allowNull: false
            },
        }
    );

    return Tag;
};
