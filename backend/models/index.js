const Sequelize = require('@sequelize/core');
const sequelize = require('../config/database');

const User = require('./user')(sequelize, Sequelize);
const Tag = require('./tag')(sequelize, Sequelize);
const Tracker = require('./tracker')(sequelize, Sequelize);
const TrackedUserObject = require('./trackedUserObject')(sequelize, Sequelize);

// TUO Connnections:
User.belongsToMany(TrackedUserObject, {through: 'UserTUO'});
TrackedUserObject.belongsToMany(User, {through: 'UserTUO'});

Tag.belongsToMany(TrackedUserObject, {through: 'TagTUO'});
TrackedUserObject.belongsToMany(Tag, {through: 'TagTUO'});

TrackedUserObject.hasOne(Tracker);

module.exports = {
    User,
    Tag,
    Tracker, 
    TrackedUserObject
};
