/**
 * 统一响应格式工具函数
 */

/**
 * 成功响应
 * @param {Object} res - Express response对象
 * @param {*} data - 返回的数据
 * @param {String} message - 消息
 */
function success(res, data = null, message = "success") {
    res.json({
        code: 200,
        message,
        data
    });
}

/**
 * 错误响应
 * @param {Object} res - Express response对象
 * @param {Number} code - 错误码
 * @param {String} message - 错误消息
 */
function error(res, code = 500, message = "服务器内部错误") {
    // 业务逻辑错误(code >= 1000)使用200 HTTP状态
    // HTTP错误(400-599)使用对应的HTTP状态
    const httpStatus = code >= 1000 ? 200 : (code >= 500 ? 500 : (code >= 400 ? code : 200));

    res.status(httpStatus).json({
        code,
        message,
        data: null
    });
}

module.exports = {
    success,
    error
};
