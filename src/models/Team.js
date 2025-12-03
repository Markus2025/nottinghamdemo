const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Team = sequelize.define("Team", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '关联房源ID'
    },
    propertyTitle: {
        type: DataTypes.STRING(255),
        comment: '房源标题'
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建者ID'
    },
    maxMembers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '最大人数'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '组队备注'
    },
    status: {
        type: DataTypes.ENUM('active', 'full', 'closed'),
        defaultValue: 'active',
        comment: '状态'
    }
}, {
    tableName: 'Teams',
    timestamps: true
});

module.exports = Team;
