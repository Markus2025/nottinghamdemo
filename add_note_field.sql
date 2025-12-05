-- =============================================
-- 添加 note 字段到 TeamMembers 表
-- 用于存储成员个人备注信息
-- =============================================

-- 添加 note 字段
ALTER TABLE TeamMembers 
ADD COLUMN note VARCHAR(500) DEFAULT '' COMMENT '成员个人备注';

-- 验证字段是否添加成功
DESCRIBE TeamMembers;
