-- 清空数据库中所有微信头像URL
-- 执行此脚本后，所有用户都将使用前端的默认头像系统

-- 注意：Sequelize创建的表名首字母大写，使用 Users 而不是 users

-- 清空微信头像URL（thirdwx.qlogo.cn）
UPDATE Users 
SET avatar = NULL 
WHERE avatar LIKE 'https://thirdwx.qlogo.cn/%';

-- 清空微信头像URL（wx.qlogo.cn）
UPDATE Users 
SET avatar = NULL 
WHERE avatar LIKE 'https://wx.qlogo.cn/%' 
   OR avatar LIKE 'http://wx.qlogo.cn/%';

-- 清空临时头像URL
UPDATE Users 
SET avatar = NULL 
WHERE avatar LIKE 'http://tmp/%' 
   OR avatar LIKE 'https://tmp/%';

-- 清空COS上传的头像URL（如果不需要的话，可选）
-- UPDATE Users 
-- SET avatar = NULL 
-- WHERE avatar LIKE '%.cos.%myqcloud.com/%';

-- 查看更新后的结果
SELECT id, nickname, avatar, campus 
FROM Users 
ORDER BY id;
