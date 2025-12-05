-- 修复Property ID=2的images字段格式
-- 将字符串格式改为正确的JSON数组

UPDATE Properties 
SET images = JSON_ARRAY(
  'https://nottingham-1371262252.cos.ap-shanghai.myqcloud.com/house2.png',
  'https://nottingham-1371262252.cos.ap-shanghai.myqcloud.com/house.png',
  'https://nottingham-1371262252.cos.ap-shanghai.myqcloud.com/house3.png'
)
WHERE id = 2;

-- 验证修复结果
SELECT id, title, images, JSON_TYPE(images) as images_type 
FROM Properties 
WHERE id = 2;
