const axios = require("axios");

const { WX_APP_ID, WX_APP_SECRET } = process.env;

/**
 * 通过code获取微信openId
 * @param {String} code - wx.login获取的code
 * @returns {Promise<Object>} - {openid, session_key}
 */
async function getOpenId(code) {
    try {
        const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: WX_APP_ID,
                secret: WX_APP_SECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        const { openid, session_key, errcode, errmsg } = response.data;

        if (errcode) {
            throw new Error(`微信API错误: ${errmsg}`);
        }

        return { openid, session_key };
    } catch (error) {
        console.error('获取openId失败:', error);
        throw error;
    }
}

module.exports = {
    getOpenId
};
