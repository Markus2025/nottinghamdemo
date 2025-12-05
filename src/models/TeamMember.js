const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const TeamMember = sequelize.define("TeamMember", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '组队ID'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '加入时间'
    },
    note: {
        type: DataTypes.STRING(500),
        defaultValue: '',
        comment: '成员个人备注'
    }
}, {
    tableName: 'TeamMembers',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['teamId', 'userId']
        }
    ]
});

module.exports = TeamMember;
