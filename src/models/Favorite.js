const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Favorite = sequelize.define("Favorite", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '房源ID'
    }
}, {
    tableName: 'Favorites',
    timestamps: true,
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'propertyId']
        }
    ]
});

module.exports = Favorite;
