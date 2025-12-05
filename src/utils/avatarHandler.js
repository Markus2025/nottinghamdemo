const axios = require('axios');
const AWS = require('aws-sdk');

// 配置COS客户端
const s3 = new AWS.S3({
    endpoint: process.env.COS_ENDPOINT || 'https://cos.ap-shanghai.myqcloud.com',
    accessKeyId: process.env.COS_SECRET_ID,
    secretAccessKey: process.env.COS_SECRET_KEY,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: process.env.COS_REGION || 'ap-shanghai',
});

/**
 * 检测是否为微信临时头像URL
 * @param {string} url - 头像URL
 * @returns {boolean}
 */
function isWechatTempUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    return (
        url.startsWith('http://tmp/') ||
        url.startsWith('https://tmp/') ||
        url.includes('wx.qlogo.cn') || // 微信头像域名
        url.includes('thirdwx.qlogo.cn') // 第三方微信头像域名
    );
}

/**
 * 下载图片
 * @param {string} url - 图片URL
 * @returns {Promise<Buffer>} - 图片Buffer
 */
async function downloadImage(url) {
    try {
        console.log('📥 开始下载头像:', url);

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000, // 10秒超时
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log('✅ 头像下载成功，大小:', response.data.length, 'bytes');
        return Buffer.from(response.data);
    } catch (error) {
        console.error('❌ 头像下载失败:', error.message);
        throw new Error(`下载头像失败: ${error.message}`);
    }
}

/**
 * 上传图片到COS
 * @param {Buffer} imageBuffer - 图片Buffer
 * @param {number} userId - 用户ID
 * @returns {Promise<string>} - 永久URL
 */
async function uploadToCOS(imageBuffer, userId) {
    try {
        const bucket = process.env.COS_BUCKET;
        const region = process.env.COS_REGION || 'ap-shanghai';
        const timestamp = Date.now();
        const key = `avatars/user-${userId}-${timestamp}.jpg`;

        console.log('📤 开始上传到COS:', key);

        await s3.putObject({
            Bucket: bucket,
            Key: key,
            Body: imageBuffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read' // 公开可读
        }).promise();

        // 构建永久URL
        const permanentUrl = `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
        console.log('✅ 上传成功，永久URL:', permanentUrl);

        return permanentUrl;
    } catch (error) {
        console.error('❌ 上传到COS失败:', error.message);
        throw new Error(`上传头像失败: ${error.message}`);
    }
}

/**
 * 处理头像URL - 主函数
 * 如果是微信临时URL，下载并上传到COS，返回永久URL
 * 如果是永久URL，直接返回
 * @param {string} avatarUrl - 原始头像URL
 * @param {number} userId - 用户ID
 * @returns {Promise<string>} - 处理后的URL
 */
async function processAvatarUrl(avatarUrl, userId) {
    try {
        // 检查是否为空或无效
        if (!avatarUrl || avatarUrl.trim() === '') {
            console.log('⚠️  头像URL为空，跳过处理');
            return avatarUrl;
        }

        // 检查是否为微信临时URL
        if (!isWechatTempUrl(avatarUrl)) {
            console.log('✅ 头像已是永久URL，无需处理:', avatarUrl);
            return avatarUrl;
        }

        console.log('🔄 检测到微信临时头像，开始自动处理...');
        console.log('   原URL:', avatarUrl);
        console.log('   用户ID:', userId);

        // 下载图片
        const imageBuffer = await downloadImage(avatarUrl);

        // 上传到COS
        const permanentUrl = await uploadToCOS(imageBuffer, userId);

        console.log('🎉 头像处理完成！');
        console.log('   临时URL:', avatarUrl);
        console.log('   永久URL:', permanentUrl);

        return permanentUrl;

    } catch (error) {
        console.error('❌ 头像处理失败:', error.message);
        console.error('   保留原URL:', avatarUrl);

        // 失败时返回原URL，不影响登录流程
        return avatarUrl;
    }
}

module.exports = {
    isWechatTempUrl,
    processAvatarUrl
};
