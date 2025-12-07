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
        comment: '图片URL数组',
        set(value) {
            // 自动转换为数组格式
            let normalized = value;

            if (typeof value === 'string') {
                value = value.trim();

                // JSON字符串
                if (value.startsWith('[')) {
                    try {
                        normalized = JSON.parse(value);
                    } catch (e) {
                        console.error('解析images JSON失败:', e);
                        normalized = [];
                    }
                }
                // 换行分隔
                else if (value.includes('\n')) {
                    normalized = value.split('\n').map(url => url.trim()).filter(url => url);
                }
                // 逗号分隔
                else if (value.includes(',')) {
                    normalized = value.split(',').map(url => url.trim()).filter(url => url);
                }
                // 单个URL
                else {
                    normalized = value ? [value] : [];
                }
            }

            // 确保是数组
            if (!Array.isArray(normalized)) {
                normalized = normalized ? [normalized] : [];
            }

            this.setDataValue('images', normalized);
        }
    },
    imageFiles: {
        type: DataTypes.JSON,
        comment: '上传的图片文件信息（AdminJS使用）'
    },
    tags: {
        type: DataTypes.JSON,
        comment: '标签',
        set(value) {
            let normalized = value;

            if (typeof value === 'string') {
                value = value.trim();

                // JSON字符串
                if (value.startsWith('[')) {
                    try {
                        normalized = JSON.parse(value);
                    } catch (e) {
                        console.error('解析tags JSON失败:', e);
                        normalized = [];
                    }
                }
                // 换行分隔
                else if (value.includes('\n')) {
                    normalized = value.split('\n').map(tag => tag.trim()).filter(tag => tag);
                }
                // 逗号分隔
                else if (value.includes(',')) {
                    normalized = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                }
                // 单个标签
                else {
                    normalized = value ? [value] : [];
                }
            }

            // 确保是数组
            if (!Array.isArray(normalized)) {
                normalized = normalized ? [normalized] : [];
            }

            this.setDataValue('tags', normalized);
        }
    },
    facilities: {
        type: DataTypes.JSON,
        comment: '配套设施',
        set(value) {
            let normalized = value;

            if (typeof value === 'string') {
                value = value.trim();

                // JSON字符串
                if (value.startsWith('[')) {
                    try {
                        normalized = JSON.parse(value);
                    } catch (e) {
                        console.error('解析facilities JSON失败:', e);
                        normalized = [];
                    }
                }
                // 换行分隔
                else if (value.includes('\n')) {
                    normalized = value.split('\n').map(item => item.trim()).filter(item => item);
                }
                // 逗号分隔
                else if (value.includes(',')) {
                    normalized = value.split(',').map(item => item.trim()).filter(item => item);
                }
                // 单个设施
                else {
                    normalized = value ? [value] : [];
                }
            }

            // 确保是数组
            if (!Array.isArray(normalized)) {
                normalized = normalized ? [normalized] : [];
            }

            this.setDataValue('facilities', normalized);
        }
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
