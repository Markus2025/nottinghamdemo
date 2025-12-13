const { User } = require("../models");
const { success, error } = require("../utils/response");
const { getOpenId } = require("../utils/wechat");
const { generateToken } = require("../middleware/auth");

/**
 * 微信登录
 * POST /api/auth/login
 */
async function login(req, res, next) {
    try {
        const { code, userInfo } = req.body;

        if (!code) {
            return error(res, 400, "缺少code参数");
        }

        // 获取openId
        const { openid } = await getOpenId(code);

        // 查找或创建用户
        let user = await User.findOne({ where: { openId: openid } });

        if (!user) {
            // 新用户，创建记录
            // ✅ 可选保存微信头像，或由用户后续上传
            user = await User.create({
                openId: openid,
                nickname: userInfo?.nickName || '微信用户',
                avatar: userInfo?.avatarUrl || null  // 可选保存微信头像
            });
            console.log('✅ 新用户创建成功');
        } else if (userInfo) {
            // 更新用户信息
            // ✅ 只更新昵称，不保存微信头像
            await user.update({
                nickname: userInfo.nickName
            });
            console.log('✅ 用户信息已更新（仅昵称，头像保持null）');
        }

        // 生成token
        const token = generateToken(user.id);

        success(res, {
            token,
            user: {
                id: user.id,
                openId: user.openId,
                nickname: user.nickname,
                avatar: user.avatar,  // ✅ 返回实际头像值
                campus: user.campus,
                motto: user.motto
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * 刷新Token
 * POST /api/auth/refresh
 */
async function refreshToken(req, res, next) {
    try {
        // 从当前token中获取用户ID（需要先经过auth中间件）
        const userId = req.userId;

        // 生成新token
        const token = generateToken(userId);

        success(res, { token });
    } catch (err) {
        next(err);
    }
}

/**
 * 更新用户信息
 * PUT /api/user/profile
 */
async function updateProfile(req, res, next) {
    try {
        const { nickname, campus, motto } = req.body;
        const user = req.user;

        // 更新用户信息
        const updateData = {};
        if (nickname !== undefined) updateData.nickname = nickname;
        if (req.body.avatar !== undefined) updateData.avatar = req.body.avatar;  // ✅ 接受头像更新
        if (campus !== undefined) updateData.campus = campus;
        if (motto !== undefined) updateData.motto = motto;

        await user.update(updateData);

        success(res, {
            id: user.id,
            openId: user.openId,
            nickname: user.nickname,
            avatar: user.avatar,  // ✅ 返回实际头像值
            campus: user.campus,
            motto: user.motto
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    refreshToken,
    updateProfile
};
