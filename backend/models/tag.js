module.exports = (sequelize, DataTypes) => {
const Tag = sequelize.define(
        'tag', 
        {
            color: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
        }
    );

    return Tag;
};
