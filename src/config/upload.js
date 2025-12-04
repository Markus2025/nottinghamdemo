const uploadFeature = require('@adminjs/upload');
const AWS = require('aws-sdk');

// 配置腾讯云COS
const s3 = new AWS.S3({
    endpoint: process.env.COS_ENDPOINT || 'https://cos.ap-shanghai.myqcloud.com',
    accessKeyId: process.env.COS_SECRET_ID,
    secretAccessKey: process.env.COS_SECRET_KEY,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: process.env.COS_REGION || 'ap-shanghai',
});

// 获取COS公网URL
function getPublicUrl(key) {
    const bucket = process.env.COS_BUCKET;
    const region = process.env.COS_REGION || 'ap-shanghai';
    return `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
}

// 上传配置
const uploadConfig = {
    provider: {
        aws: {
            bucket: process.env.COS_BUCKET,
            region: process.env.COS_REGION || 'ap-shanghai',
            s3,
        },
    },
    validation: {
        maxSize: 5 * 1024 * 1024, // 5MB
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },
};

// 为Property配置图片上传功能
const propertyImageUploadFeature = uploadFeature({
    ...uploadConfig,
    properties: {
        key: 'imageFiles',
        multiple: true,
    },
    // 关键：指定上传路径
    uploadPath: (record, filename) => {
        const timestamp = Date.now();
        const propertyId = record.id || 'new';
        return `properties/${propertyId}/${timestamp}-${filename}`;
    },
});

module.exports = {
    s3,
    uploadConfig,
    propertyImageUploadFeature,
    getPublicUrl,
};
