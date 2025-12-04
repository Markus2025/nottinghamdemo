const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Property = sequelize.define("Property", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '标题'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '描述'
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '类型'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '月租（£）'
    },
    deposit: {
        type: DataTypes.DECIMAL(10, 2),
        comment: '押金（£）'
    },
    location: {
        type: DataTypes.STRING(255),
        comment: '区域'
    },
    address: {
        type: DataTypes.STRING(500),
        comment: '详细地址'
    },
    bedrooms: {
        type: DataTypes.INTEGER,
        comment: '卧室数'
    },
    bathrooms: {
        type: DataTypes.INTEGER,
        comment: '浴室数'
    },
    area: {
        type: DataTypes.DECIMAL(10, 2),
        comment: '面积（m²）'
    },
    floor: {
        type: DataTypes.INTEGER,
        comment: '楼层'
    },
    totalFloors: {
        type: DataTypes.INTEGER,
        comment: '总楼层'
    },
    images: {
        type: DataTypes.JSON,
        comment: '图片URL数组'
    },
    imageFiles: {
        type: DataTypes.JSON,
        comment: '上传的图片文件信息（AdminJS使用）'
    },
    tags: {
        type: DataTypes.JSON,
        comment: '标签'
    },
    facilities: {
        type: DataTypes.JSON,
        comment: '配套设施'
    },
    contactName: {
        type: DataTypes.STRING(255),
        comment: '联系人'
    },
    contactPhone: {
        type: DataTypes.STRING(50),
        comment: '联系电话'
    },
    contactQRCode: {
        type: DataTypes.STRING(500),
        comment: '二维码URL'
    },
    status: {
        type: DataTypes.ENUM('available', 'rented'),
        defaultValue: 'available',
        comment: '状态'
    }
}, {
    tableName: 'Properties',
    timestamps: true
});

module.exports = Property;
