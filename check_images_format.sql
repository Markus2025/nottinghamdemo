-- 检查Property表中images字段的实际存储格式
SELECT id, title, images FROM Properties WHERE id IN (1, 2);

-- 如果images是字符串，需要确保存储的是有效的JSON数组
-- 正确格式示例：
-- ["https://example.com/img1.jpg","https://example.com/img2.jpg"]
