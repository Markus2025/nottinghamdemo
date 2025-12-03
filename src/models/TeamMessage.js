const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const TeamMessage = sequelize.define("TeamMessage", {
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
        comment: '发送者ID'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '消息内容'
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'system'),
        defaultValue: 'text',
        comment: '消息类型'
    }
}, {
    tableName: 'TeamMessages',
    timestamps: true,
    updatedAt: false
});

module.exports = TeamMessage;
