-- =============================================
-- Nottingham 组队功能测试数据
-- =============================================

-- 1. 插入测试用户（3个室友）
INSERT INTO Users (openId, nickname, avatar, campus, motto, createdAt, updatedAt) VALUES
('test_user_001', '张三', 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132', 'University of Nottingham(Park)', '爱干净，作息规律，找室友一起租房', NOW(), NOW()),
('test_user_002', '李四', 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKcRSibJvia8mvuDiar8R3EakcdcPdSSmMibibfYmv88bsNx9gN0hFjA1yplZSZqHJaKZGxicTJ6NqRibMXA/132', 'University of Nottingham(Jubilee)', '研一学生，喜欢安静环境', NOW(), NOW()),
('test_user_003', '王五', 'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoj0hHXhgJNOTSOFsS4uZs8x1ConecaVOB8eIl115xmJZcT4oCicvia7wMEufibKtTLqiaJeanU2Lpg3w/132', 'Nottingham Trent University(City)', '本科生，找室友拼房', NOW(), NOW());

-- 2. 创建组队（基于已有的房源 ID=1）
-- 假设房源ID=1是一个3室的公寓
INSERT INTO Teams (propertyId, propertyTitle, creatorId, maxMembers, description, status, createdAt, updatedAt) VALUES
(1, '【测试】市中心豪华公寓', 1, 3, '寻找爱干净、作息规律的室友，我是研一学生，平时比较安静。房子在市中心，交通方便，步行5分钟到地铁站。希望找到志同道合的小伙伴一起租房！', 'active', NOW(), NOW());

-- 3. 添加组队成员
-- 发起人（张三，userId=1）自动加入
INSERT INTO TeamMembers (teamId, userId, joinedAt) VALUES
(1, 1, NOW());

-- 第二个成员（李四，userId=2）加入
INSERT INTO TeamMembers (teamId, userId, joinedAt) VALUES
(1, 2, DATE_ADD(NOW(), INTERVAL 2 HOUR));

-- 4. 添加组队消息（聊天记录）
INSERT INTO TeamMessages (teamId, userId, content, type, createdAt) VALUES
(1, 1, '大家好！我是张三，很高兴和大家一起组队找房😊', 'text', NOW()),
(1, 2, '你好张三！我是李四，研一学生，请多关照🙂', 'text', DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(1, 1, '李四你好！我们现在还差一个人，等凑齐了就可以联系房东了', 'text', DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 HOUR), INTERVAL 5 MINUTE)),
(1, 2, '好的！这个房子位置确实很不错，离学校也近👍', 'text', DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 HOUR), INTERVAL 10 MINUTE));

-- =============================================
-- 创建第二个组队（已满员的示例）
-- =============================================

-- 如果有第二个房源（假设ID=2，或者你可以修改为实际存在的房源ID）
-- 取消下面的注释来创建第二个组队

/*
INSERT INTO Teams (propertyId, propertyTitle, creatorId, maxMembers, description, status, createdAt, updatedAt) VALUES
(2, '另一个测试房源', 2, 2, '两人房源，现已满员', 'full', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO TeamMembers (teamId, userId, joinedAt) VALUES
(2, 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 3, DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 3 HOUR));

INSERT INTO TeamMessages (teamId, userId, content, type, createdAt) VALUES
(2, 2, '我们这个组队已经满员了！', 'text', DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 4 HOUR));
*/

-- =============================================
-- 验证查询（可选）
-- =============================================

-- 查看所有用户
SELECT * FROM Users;

-- 查看所有组队
SELECT * FROM Teams;

-- 查看组队成员
SELECT 
    t.id as team_id,
    t.propertyTitle,
    t.status,
    u.nickname,
    u.campus,
    tm.joinedAt
FROM Teams t
JOIN TeamMembers tm ON t.id = tm.teamId
JOIN Users u ON tm.userId = u.id
ORDER BY t.id, tm.joinedAt;

-- 查看组队消息
SELECT 
    t.propertyTitle,
    u.nickname,
    msg.content,
    msg.createdAt
FROM TeamMessages msg
JOIN Teams t ON msg.teamId = t.id
JOIN Users u ON msg.userId = u.id
ORDER BY msg.createdAt;

-- 查看组队统计
SELECT 
    t.id,
    t.propertyTitle,
    t.status,
    COUNT(tm.userId) as current_members,
    t.maxMembers,
    CONCAT(COUNT(tm.userId), '/', t.maxMembers) as progress
FROM Teams t
LEFT JOIN TeamMembers tm ON t.id = tm.teamId
GROUP BY t.id;
