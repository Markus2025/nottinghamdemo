const { Property } = require("../models");
const { success, error } = require("../utils/response");
const { Op } = require("sequelize");

/**
 * 获取房源列表
 * GET /api/properties
 */
async function getProperties(req, res, next) {
    try {
        const {
            page = 1,
            limit = 10,
            type = 'all',
            minPrice,
            maxPrice,
            bedrooms,
            location
        } = req.query;

        // 添加调试日志
        console.log('==================');
        console.log('📥 收到房源列表请求');
        console.log('请求来源:', req.headers['user-agent']);
        console.log('请求参数:', req.query);
        console.log('==================');

        // 构建查询条件
        const where = { status: 'available' };

        // 优化type参数处理：只有明确传入且不是'all'时才过滤
        if (type && type !== 'all' && type !== 'undefined') {
            where.type = type;
            console.log('🔍 添加type过滤:', type);
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        if (bedrooms) {
            where.bedrooms = parseInt(bedrooms);
        }

        if (location) {
            where.location = { [Op.like]: `%${location}%` };
        }

        console.log('🔍 最终查询条件:', JSON.stringify(where, null, 2));

        // 分页查询
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        console.log('✅ 查询结果:', count, '条数据');
        console.log('📤 返回数据:', {
            list: rows.length,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        success(res, {
            list: rows,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('❌ 查询房源失败:', err);
        next(err);
    }
}

/**
 * 获取房源详情
 * GET /api/properties/:id
 */
async function getPropertyById(req, res, next) {
    try {
        const { id } = req.params;

        const property = await Property.findByPk(id);

        if (!property) {
            return error(res, 404, "房源不存在");
        }

        success(res, property);
    } catch (err) {
        next(err);
    }
}

/**
 * 搜索房源
 * GET /api/properties/search
 */
async function searchProperties(req, res, next) {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;

        if (!keyword) {
            return error(res, 400, "缺少搜索关键词");
        }

        // 构建搜索条件
        const where = {
            status: 'available',
            [Op.or]: [
                { title: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } },
                { location: { [Op.like]: `%${keyword}%` } },
                { address: { [Op.like]: `%${keyword}%` } }
            ]
        };

        // 分页查询
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        success(res, {
            list: rows,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getProperties,
    getPropertyById,
    searchProperties
};
