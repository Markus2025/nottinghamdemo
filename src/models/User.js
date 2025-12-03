const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    openId: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        comment: '微信openId'
    },
    nickname: {
        type: DataTypes.STRING(255),
        comment: '昵称'
    },
    avatar: {
        type: DataTypes.STRING(500),
        comment: '头像URL'
    },
    campus: {
        type: DataTypes.STRING(255),
        comment: '校区'
    },
    motto: {
        type: DataTypes.STRING(500),
        comment: '个性签名'
    }
}, {
    tableName: 'Users',
    timestamps: true
});

module.exports = User;
