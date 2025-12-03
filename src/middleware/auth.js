const jwt = require("jsonwebtoken");
const { error } = require("../utils/response");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "nottingham-secret-key";

/**
 * JWT认证中间件
 */
async function authenticate(req, res, next) {
    try {
        // 获取token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return error(res, 401, "未授权，请先登录");
        }

        const token = authHeader.substring(7);

        // 验证token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 查询用户
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return error(res, 401, "用户不存在");
        }

        // 将用户信息挂载到req对象
        req.user = user;
        req.userId = user.id;

        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return error(res, 401, "Token无效");
        }
        if (err.name === 'TokenExpiredError') {
            return error(res, 401, "Token已过期");
        }
        return error(res, 500, "认证失败");
    }
}

/**
 * 生成JWT token
 * @param {Number} userId - 用户ID
 * @returns {String} - JWT token
 */
function generateToken(userId) {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '7d' } // 7天有效期
    );
}

module.exports = {
    authenticate,
    generateToken
};
