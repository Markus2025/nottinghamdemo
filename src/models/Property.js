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
        comment: '类型',
        set(value) {
            // 将空字符串转换为undefined，让Sequelize的allowNull验证生效
            if (value === '' || (typeof value === 'string' && value.trim() === '')) {
                this.setDataValue('type', undefined);
            } else {
                this.setDataValue('type', value);
            }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '月租（£）',
        set(value) {
            // 将空字符串转换为undefined，让Sequelize的allowNull验证生效
            if (value === '' || value === null) {
                this.setDataValue('price', undefined);
            } else {
                this.setDataValue('price', value);
            }
        }
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
        get() {
            // Getter: 将数组转换为多行字符串（AdminJS显示用）
            const value = this.getDataValue('images');
            if (Array.isArray(value) && value.length > 0) {
                return value.join('\n');
            }
            return value;
        },
        set(value) {
            // Setter: 自动转换为数组格式
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
        get() {
            // Getter: 将数组转换为多行字符串（AdminJS显示用）
            const value = this.getDataValue('tags');
            if (Array.isArray(value) && value.length > 0) {
                return value.join('\n');
            }
            return value;
        },
        set(value) {
            // Setter: 处理null、undefined或空值
            if (value === null || value === undefined || value === '') {
                this.setDataValue('tags', null);
                return;
            }

            let normalized = value;

            if (typeof value === 'string') {
                value = value.trim();

                // 空字符串 -> null
                if (!value) {
                    this.setDataValue('tags', null);
                    return;
                }

                // JSON字符串
                if (value.startsWith('[')) {
                    try {
                        normalized = JSON.parse(value);
                    } catch (e) {
                        console.error('解析tags JSON失败:', e);
                        normalized = null;
                    }
                }
                // 换行分隔
                else if (value.includes('\n')) {
                    normalized = value.split('\n').map(tag => tag.trim()).filter(tag => tag);
                    // 如果过滤后为空数组，设为null
                    if (normalized.length === 0) normalized = null;
                }
                // 逗号分隔
                else if (value.includes(',')) {
                    normalized = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    // 如果过滤后为空数组，设为null
                    if (normalized.length === 0) normalized = null;
                }
                // 单个标签
                else {
                    normalized = [value];
                }
            }
            // 如果已经是数组，直接使用
            else if (Array.isArray(value)) {
                normalized = value.length > 0 ? value : null;
            }

            this.setDataValue('tags', normalized);
        }
    },
    facilities: {
        type: DataTypes.JSON,
        comment: '配套设施',
        get() {
            // Getter: 将数组转换为多行字符串（AdminJS显示用）
            const value = this.getDataValue('facilities');
            if (Array.isArray(value) && value.length > 0) {
                return value.join('\n');
            }
            return value;
        },
        set(value) {
            // 处理null、undefined或空值
            if (value === null || value === undefined || value === '') {
                this.setDataValue('facilities', null);
                return;
            }

            let normalized = value;

            if (typeof value === 'string') {
                value = value.trim();

                // 空字符串 -> null
                if (!value) {
                    this.setDataValue('facilities', null);
                    return;
                }

                // JSON字符串
                if (value.startsWith('[')) {
                    try {
                        normalized = JSON.parse(value);
                    } catch (e) {
                        console.error('解析facilities JSON失败:', e);
                        normalized = null;
                    }
                }
                // 换行分隔
                else if (value.includes('\n')) {
                    normalized = value.split('\n').map(item => item.trim()).filter(item => item);
                    // 如果过滤后为空数组，设为null
                    if (normalized.length === 0) normalized = null;
                }
                // 逗号分隔
                else if (value.includes(',')) {
                    normalized = value.split(',').map(item => item.trim()).filter(item => item);
                    // 如果过滤后为空数组，设为null
                    if (normalized.length === 0) normalized = null;
                }
                // 单个设施
                else {
                    normalized = [value];
                }
            }
            // 如果已经是数组，直接使用
            else if (Array.isArray(value)) {
                normalized = value.length > 0 ? value : null;
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
