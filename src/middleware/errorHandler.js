const { error } = require("../utils/response");

/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
    console.error('错误详情:', err);

    // Sequelize验证错误
    if (err.name === 'SequelizeValidationError') {
        return error(res, 400, err.errors[0].message);
    }

    // Sequelize唯一约束错误
    if (err.name === 'SequelizeUniqueConstraintError') {
        return error(res, 400, "数据重复");
    }

    // 默认错误
    error(res, 500, err.message || "服务器内部错误");
}

module.exports = errorHandler;
