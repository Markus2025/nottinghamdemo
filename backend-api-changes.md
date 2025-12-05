# 后端API变更文档

> **发布日期:** 2025-12-05  
> **变更原因:** 配合前端组队详情页面改造  
> **影响范围:** 组队相关API

---

## 变更概述

前端组队详情页面进行了重大改造，移除了聊天功能，改为显示成员个人备注。后端需要配合以下变更：

1. **新增API:** 获取指定组队详情
2. **新增API:** 更新成员个人备注
3. **数据结构变更:** Member对象增加 `note` 字段
4. **Bug修复:** 检查并修复propertyId关联问题

---

## 新增API

### 1. 获取指定组队详情

**用途:** 支持根据teamId获取组队详情（不仅限于"我的组队"）

#### 请求

```
GET /api/teams/:teamId
```

**路径参数:**
- `teamId` (number, required): 组队ID

**请求头:**
```
Authorization: Bearer {token}
```

#### 响应

**成功响应 (200):**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "propertyId": 123,
    "propertyTitle": "市中心豪华公寓",
    "maxMembers": 4,
    "status": "active",
    "description": "寻找爱干净的室友",
    "creator": {
      "id": 1,
      "nickname": "张三",
      "avatar": "https://example.com/avatar1.jpg",
      "campus": "Jubilee Campus",
      "note": "我是计算机专业大二学生，喜欢安静，作息规律。希望找到同样爱干净的室友，微信：zhangsan123"
    },
    "members": [
      {
        "id": 1,
        "nickname": "张三",
        "avatar": "https://example.com/avatar1.jpg",
        "campus": "Jubilee Campus",
        "note": "我是计算机专业大二学生，喜欢安静，作息规律。希望找到同样爱干净的室友，微信：zhangsan123",
        "joinedAt": "2024-01-01T10:00:00Z"
      },
      {
        "id": 2,
        "nickname": "李四",
        "avatar": "https://example.com/avatar2.jpg",
        "campus": "University Park",
        "note": "商学院研一，性格开朗，喜欢运动。对室友无特殊要求，互相尊重即可。VX: lisi456",
        "joinedAt": "2024-01-02T11:30:00Z"
      }
    ],
    "createdTime": "2024-01-01T10:00:00Z"
  }
}
```

**错误响应:**

```json
// 404 - 组队不存在
{
  "code": 404,
  "message": "组队不存在"
}

// 403 - 无权访问（如果需要权限控制）
{
  "code": 403,
  "message": "您不是该组队成员，无法查看详情"
}
```

#### 权限说明

- 建议只允许组队成员查看详情
- 或者允许所有人查看，但隐藏成员的敏感信息（如备注中的微信号）

---

### 2. 更新成员个人备注

**用途:** 成员更新自己在组队中的个人备注

#### 请求

```
PUT /api/teams/:teamId/members/:userId/note
```

**路径参数:**
- `teamId` (number, required): 组队ID
- `userId` (number, required): 用户ID（必须是当前登录用户）

**请求头:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体:**

```json
{
  "note": "我是计算机专业大二学生，喜欢安静，作息规律。希望找到同样爱干净的室友，微信：zhangsan123"
}
```

**字段说明:**
- `note` (string, required): 个人备注内容，最大长度500字符

#### 响应

**成功响应 (200):**

```json
{
  "code": 200,
  "message": "备注更新成功",
  "data": {
    "id": 1,
    "nickname": "张三",
    "avatar": "https://example.com/avatar1.jpg",
    "campus": "Jubilee Campus",
    "note": "我是计算机专业大二学生，喜欢安静，作息规律。希望找到同样爱干净的室友，微信：zhangsan123",
    "joinedAt": "2024-01-01T10:00:00Z"
  }
}
```

**错误响应:**

```json
// 400 - 参数错误
{
  "code": 400,
  "message": "备注内容不能超过500字符"
}

// 403 - 权限不足
{
  "code": 403,
  "message": "您只能编辑自己的备注"
}

// 404 - 组队或成员不存在
{
  "code": 404,
  "message": "组队不存在或您不是该组队成员"
}
```

#### 权限验证

**必须验证:**
1. 用户已登录
2. 用户是该组队的成员
3. 只能修改自己的备注（`userId` 必须等于 `token.userId`）

---

## 数据结构变更

### Member对象

**原有结构:**

```typescript
interface Member {
  id: number;
  nickname: string;
  avatar: string;
  campus?: string;
  joinedAt: string;  // ISO 8601格式
}
```

**新增字段:**

```typescript
interface Member {
  id: number;
  nickname: string;
  avatar: string;
  campus?: string;
  note?: string;      // 新增：个人备注
  joinedAt: string;
}
```

**字段说明:**
- `note` (string, optional): 成员的个人备注
  - 默认值: 空字符串或null
  - 最大长度: 500字符
  - 用途: 成员自我介绍、对室友的要求、联系方式等

### 数据库Schema变更（参考）

如果使用关系型数据库，建议添加字段：

```sql
ALTER TABLE team_members 
ADD COLUMN note VARCHAR(500) DEFAULT '' COMMENT '成员个人备注';
```

---

## 需要修改的现有API

### GET /api/teams（获取组队列表）

**变更:** 在返回的成员列表中包含 `note` 字段

**示例响应（修改后）:**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "propertyTitle": "市中心豪华公寓",
        "members": [
          {
            "id": 1,
            "nickname": "张三",
            "avatar": "...",
            "campus": "Jubilee Campus",
            "note": "我是计算机专业..."  // 新增
          }
        ]
        // ... 其他字段
      }
    ]
  }
}
```

---

### GET /api/teams/my（获取我的组队）

**变更:** 在返回的成员列表中包含 `note` 字段

**影响:** 与上述相同

---

## Bug修复

### PropertyId关联问题

**问题描述:**  
用户反馈添加了测试房源后，点击进入组队却进入了"市中心豪华公寓"的组队，说明propertyId关联有误。

**需要检查的地方:**

1. **创建组队API (`POST /api/teams`)**
   - 确保正确保存 `propertyId`
   - 验证 `propertyId` 对应的房源存在

2. **数据库数据**
   - 检查现有组队记录的 `propertyId` 是否正确
   - 是否存在多个组队指向同一个 `propertyId` 的异常情况

3. **前端传参**
   - 前端创建组队时是否正确传递了 `propertyId`

**建议修复方案:**

```javascript
// 创建组队API示例
async createTeam(req, res) {
  const { propertyId, maxMembers, description } = req.body;
  const userId = req.user.id;
  
  // 1. 验证房源存在
  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      code: 404,
      message: '房源不存在'
    });
  }
  
  // 2. 检查用户是否已在其他组队
  const existingTeam = await TeamMember.findOne({
    where: { userId, status: 'active' }
  });
  
  if (existingTeam) {
    return res.status(400).json({
      code: 1001,
      message: '您已在其他组队中'
    });
  }
  
  // 3. 创建组队，确保propertyId正确保存
  const team = await Team.create({
    propertyId: propertyId,  // 明确保存
    propertyTitle: property.title,
    maxMembers,
    description,
    creatorId: userId,
    status: 'active'
  });
  
  // ...
}
```

---

## 测试建议

### 测试用例

#### 1. 获取组队详情
```bash
# 成功获取
curl -X GET \
  'http://localhost:3000/api/teams/1' \
  -H 'Authorization: Bearer {token}'

# 组队不存在
curl -X GET \
  'http://localhost:3000/api/teams/99999' \
  -H 'Authorization: Bearer {token}'
```

#### 2. 更新个人备注
```bash
# 成功更新
curl -X PUT \
  'http://localhost:3000/api/teams/1/members/1/note' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "note": "这是我的个人备注"
  }'

# 尝试修改他人备注（应失败）
curl -X PUT \
  'http://localhost:3000/api/teams/1/members/2/note' \
  -H 'Authorization: Bearer {user1_token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "note": "尝试修改他人备注"
  }'

# 备注过长（应失败）
curl -X PUT \
  'http://localhost:3000/api/teams/1/members/1/note' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "note": "超过500字符的内容..."
  }'
```

---

## 兼容性说明

**向后兼容:**
- 新增的 `note` 字段为可选字段，不影响现有API调用
- 旧版前端不使用 `note` 字段不会报错
- 新增的API不影响现有功能

**建议:**
- 为已存在的组队成员，将 `note` 默认值设为空字符串
- 在API响应中始终包含 `note` 字段（即使为空）

---

## 实施优先级

### 高优先级（必须实现）
1. ✅ 新增 `note` 字段到Member数据结构
2. ✅ 实现 `PUT /api/teams/:teamId/members/:userId/note` API
3. ✅ 修改现有API返回 `note` 字段

### 中优先级（建议实现）
1. ✅ 实现 `GET /api/teams/:teamId` API
2. ✅ 修复propertyId关联bug

### 低优先级（可选）
1. 为备注添加敏感词过滤
2. 为备注添加格式化（自动识别微信号、电话等）

---

## 联系方式

如有疑问，请联系前端开发团队。
