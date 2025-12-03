const { Favorite, Property } = require("../models");
const { success, error } = require("../utils/response");

/**
 * 获取收藏列表
 * GET /api/favorites
 */
async function getFavorites(req, res, next) {
    try {
        const userId = req.userId;

        const favorites = await Favorite.findAll({
            where: { userId },
            include: [{
                model: Property,
                as: 'property'
            }],
            order: [['createdAt', 'DESC']]
        });

        const list = favorites.map(fav => fav.property);

        success(res, list);
    } catch (err) {
        next(err);
    }
}

/**
 * 添加收藏
 * POST /api/favorites
 */
async function addFavorite(req, res, next) {
    try {
        const { propertyId } = req.body;
        const userId = req.userId;

        if (!propertyId) {
            return error(res, 400, "缺少propertyId参数");
        }

        // 检查房源是否存在
        const property = await Property.findByPk(propertyId);
        if (!property) {
            return error(res, 404, "房源不存在");
        }

        // 检查是否已收藏
        const existing = await Favorite.findOne({
            where: { userId, propertyId }
        });

        if (existing) {
            return error(res, 400, "已收藏该房源");
        }

        // 创建收藏记录
        await Favorite.create({ userId, propertyId });

        success(res, null, "收藏成功");
    } catch (err) {
        next(err);
    }
}

/**
 * 取消收藏
 * DELETE /api/favorites/:propertyId
 */
async function removeFavorite(req, res, next) {
    try {
        const { propertyId } = req.params;
        const userId = req.userId;

        const favorite = await Favorite.findOne({
            where: { userId, propertyId }
        });

        if (!favorite) {
            return error(res, 404, "未收藏该房源");
        }

        await favorite.destroy();

        success(res, null, "取消收藏成功");
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite
};
