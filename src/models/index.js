const User = require("./User");
const Property = require("./Property");
const Team = require("./Team");
const TeamMember = require("./TeamMember");
const TeamMessage = require("./TeamMessage");
const Favorite = require("./Favorite");

// 定义模型关系

// User - Team (创建者)
User.hasMany(Team, { foreignKey: 'creatorId', as: 'createdTeams' });
Team.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Property - Team
Property.hasMany(Team, { foreignKey: 'propertyId' });
Team.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

// Team - TeamMember
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'teamMembers' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId' });

// User - TeamMember
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships' });
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Team - TeamMessage
Team.hasMany(TeamMessage, { foreignKey: 'teamId', as: 'messages' });
TeamMessage.belongsTo(Team, { foreignKey: 'teamId' });

// User - TeamMessage
User.hasMany(TeamMessage, { foreignKey: 'userId', as: 'messages' });
TeamMessage.belongsTo(User, { foreignKey: 'userId', as: 'sender' });

// User - Favorite
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

// Property - Favorite
Property.hasMany(Favorite, { foreignKey: 'propertyId' });
Favorite.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

module.exports = {
    User,
    Property,
    Team,
    TeamMember,
    TeamMessage,
    Favorite
};
