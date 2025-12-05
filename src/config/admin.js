const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSSequelize = require('@adminjs/sequelize');
const { sequelize } = require('./db');
const {
    User,
    Property,
    Team,
    TeamMember,
    TeamMessage,
    Favorite
} = require('../models');

// 注册Sequelize适配器
AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
});

// AdminJS配置
const adminOptions = {
    resources: [
        {
            resource: User,
            options: {
                navigation: {
                    name: '用户管理',
                    icon: 'User',
                },
                properties: {
                    id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    openId: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    nickname: { isVisible: true },
                    avatar: { isVisible: true },
                    campus: {
                        isVisible: true,
                        availableValues: [
                            { value: 'University of Nottingham(Park)', label: 'UoN Park' },
                            { value: 'University of Nottingham(Jubilee)', label: 'UoN Jubilee' },
                            { value: 'University of Nottingham(King\'s Meadow)', label: 'UoN King\'s Meadow' },
                            { value: 'University of Nottingham(Sutton Bonington)', label: 'UoN Sutton Bonington' },
                            { value: 'Nottingham Trent University(City)', label: 'NTU City' },
                            { value: 'Nottingham Trent University(Clifton)', label: 'NTU Clifton' },
                            { value: 'Nottingham Trent University(Brackenhurst)', label: 'NTU Brackenhurst' },
                        ]
                    },
                    motto: { isVisible: true },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    updatedAt: { isVisible: { list: false, filter: false, show: true, edit: false } },
                },
            },
        },
        {
            resource: Property,
            options: {
                navigation: {
                    name: '房源管理',
                    icon: 'Home',
                },
                properties: {
                    id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    title: { isVisible: true },
                    description: { type: 'textarea', isVisible: true },
                    type: { isVisible: true },
                    price: { isVisible: true },
                    deposit: { isVisible: true },
                    location: { isVisible: true },
                    address: { isVisible: true },
                    bedrooms: { isVisible: true },
                    bathrooms: { isVisible: true },
                    area: { isVisible: true },
                    floor: { isVisible: true },
                    totalFloors: { isVisible: true },
                    images: {
                        type: 'textarea',
                        isVisible: true,
                        description: '图片URL列表，每行一个链接。例如：\nhttps://example.com/image1.jpg\nhttps://example.com/image2.jpg'
                    },
                    imageFiles: {
                        isVisible: false
                    },
                    tags: { type: 'textarea', isVisible: true },
                    facilities: { type: 'textarea', isVisible: true },
                    contactName: { isVisible: true },
                    contactPhone: { isVisible: true },
                    contactQRCode: { isVisible: true },
                    status: {
                        isVisible: true,
                        availableValues: [
                            { value: 'available', label: '可用' },
                            { value: 'rented', label: '已出租' },
                        ]
                    },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    updatedAt: { isVisible: { list: false, filter: false, show: true, edit: false } },
                },
            },
        },
        {
            resource: Team,
            options: {
                navigation: {
                    name: '组队管理',
                    icon: 'Users',
                },
                properties: {
                    id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    propertyId: { isVisible: true },
                    propertyTitle: { isVisible: true },
                    creatorId: { isVisible: true },
                    maxMembers: { isVisible: true },
                    description: { type: 'textarea', isVisible: true },
                    status: {
                        isVisible: true,
                        availableValues: [
                            { value: 'active', label: '活跃' },
                            { value: 'full', label: '已满' },
                            { value: 'closed', label: '已关闭' },
                        ]
                    },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    updatedAt: { isVisible: { list: false, filter: false, show: true, edit: false } },
                },
            },
        },
        {
            resource: TeamMember,
            options: {
                navigation: {
                    name: '组队成员',
                    icon: 'UserCheck',
                },
                properties: {
                    id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    teamId: { isVisible: true },
                    userId: { isVisible: true },
                    joinedAt: { isVisible: true },
                },
            },
        },
        {
            resource: TeamMessage,
            options: {
                navigation: {
                    name: '组队消息',
                    icon: 'MessageCircle',
                },
                properties: {
                    id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    teamId: { isVisible: true },
                    userId: { isVisible: true },
                    content: { type: 'textarea', isVisible: true },
                    type: {
                        isVisible: true,
                        availableValues: [
                            { value: 'text', label: '文本' },
                            { value: 'image', label: '图片' },
                            { value: 'system', label: '系统' },
                        ]
                    },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                },
            },
        },
        {
            resource: Favorite,
            options: {
                navigation: {
                    name: '收藏管理',
                    icon: 'Heart',
                },
                properties: {
                    id: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    userId: { isVisible: true },
                    propertyId: { isVisible: true },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                },
            },
        },
    ],
    rootPath: '/admin',
    branding: {
        companyName: 'Nottingham 房源管理',
        logo: false,
        softwareBrothers: false,
    },
    locale: {
        language: 'zh-CN',
        translations: {
            labels: {
                loginWelcome: '欢迎来到 Nottingham 房源管理系统',
            },
            messages: {
                loginWelcome: '请使用管理员账号登录',
            },
        },
    },
};

module.exports = { adminOptions };
