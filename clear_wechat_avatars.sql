-- 清空数据库中所有微信头像URL
-- 执行此脚本后，所有用户都将使用前端的默认头像系统

-- 清空微信头像URL（thirdwx.qlogo.cn）
UPDATE users 
SET avatar = NULL 
WHERE avatar LIKE 'https://thirdwx.qlogo.cn/%';

-- 清空微信头像URL（wx.qlogo.cn）
UPDATE users 
SET avatar = NULL 
WHERE avatar LIKE 'https://wx.qlogo.cn/%' 
   OR avatar LIKE 'http://wx.qlogo.cn/%';

-- 清空临时头像URL
UPDATE users 
SET avatar = NULL 
WHERE avatar LIKE 'http://tmp/%' 
   OR avatar LIKE 'https://tmp/%';

-- 清空COS上传的头像URL（如果不需要的话）
-- UPDATE users 
-- SET avatar = NULL 
-- WHERE avatar LIKE '%.cos.%myqcloud.com/%';

-- 查看更新后的结果
SELECT id, nickname, avatar, campus 
FROM users 
ORDER BY id;
