# Nottingham 房源小程序 - 后端API服务

> 基于Express.js的RESTful API服务，为Nottingham房源小程序提供完整的后端支持

## 项目概述：

本项目是Nottingham房源小程序的后端服务，提供用户认证、房源管理、组队找室友、收藏等核心功能的API接口。

### 技术栈

- **框架**: Express.js 4.16.4
- **数据库**: MySQL (CynosDB)
- **ORM**: Sequelize 6.8.0
- **认证**: JWT (jsonwebtoken 9.0.0)
- **HTTP客户端**: axios 1.6.0
- **日志**: morgan 1.10.0
- **跨域**: cors 2.8.5

## 项目结构

```
nottinghamdemo/
├── src/
│   ├── config/
│   │   └── db.js                 # 数据库配置
│   ├── models/
│   │   ├── index.js              # 模型关系定义
│   │   ├── User.js               # 用户模型
│   │   ├── Property.js           # 房源模型
│   │   ├── Team.js               # 组队模型
│   │   ├── TeamMember.js         # 组队成员模型
│   │   ├── TeamMessage.js        # 组队消息模型
│   │   └── Favorite.js           # 收藏模型
│   ├── controllers/
│   │   ├── authController.js     # 认证控制器
│   │   ├── propertyController.js # 房源控制器
│   │   ├── teamController.js     # 组队控制器
│   │   └── favoriteController.js # 收藏控制器
│   ├── routes/
│   │   ├── auth.js               # 认证路由
│   │   ├── properties.js         # 房源路由
│   │   ├── teams.js              # 组队路由
│   │   └── favorites.js          # 收藏路由
│   ├── middleware/
│   │   ├── auth.js               # JWT认证中间件
│   │   └── errorHandler.js       # 错误处理中间件
│   └── utils/
│       ├── response.js           # 响应格式工具
│       └── wechat.js             # 微信API工具
├── index.js                      # 应用入口
├── package.json                  # 项目配置
└── api.md                        # API详细文档
```

## 环境变量配置

创建`.env`文件或在部署平台配置以下环境变量：

```env
# 数据库配置
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_password
MYSQL_ADDRESS=sh-cynosdbmysql-grp-7xxb7do0.sql.tencentcdb.com:20095

# 微信小程序配置
WX_APP_ID=your_wechat_app_id
WX_APP_SECRET=your_wechat_app_secret

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 服务端口（可选，默认80）
PORT=80
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

确保已正确配置上述环境变量。

### 3. 启动服务

```bash
npm start
```

服务启动后，您将看到：

```
✅ Nottingham API服务启动成功
📡 端口: 80
🗄️  数据库: nottingham_db
🚀 API文档: 参见 api.md
```

## API接口概览

### 认证接口 (3个)

| 方法 | 路径 | 说明 | 是否需要认证 |
|------|------|------|-------------|
| POST | `/api/auth/login` | 微信登录 | ❌ |
| POST | `/api/auth/refresh` | 刷新Token | ✅ |
| PUT | `/api/user/profile` | 更新用户信息 | ✅ |

### 房源接口 (3个)

| 方法 | 路径 | 说明 | 是否需要认证 |
|------|------|------|-------------|
| GET | `/api/properties` | 获取房源列表 | ❌ |
| GET | `/api/properties/:id` | 获取房源详情 | ❌ |
| GET | `/api/properties/search` | 搜索房源 | ❌ |

### 组队接口 (7个)

| 方法 | 路径 | 说明 | 是否需要认证 |
|------|------|------|-------------|
| POST | `/api/teams` | 创建组队 | ✅ |
| GET | `/api/teams` | 获取组队列表 | ✅ |
| GET | `/api/teams/my` | 获取我的组队 | ✅ |
| POST | `/api/teams/:teamId/join` | 加入组队 | ✅ |
| DELETE | `/api/teams/:teamId/leave` | 退出组队 | ✅ |
| GET | `/api/teams/:teamId/messages` | 获取组队消息 | ✅ |
| POST | `/api/teams/:teamId/messages` | 发送组队消息 | ✅ |

### 收藏接口 (3个)

| 方法 | 路径 | 说明 | 是否需要认证 |
|------|------|------|-------------|
| GET | `/api/favorites` | 获取收藏列表 | ✅ |
| POST | `/api/favorites` | 添加收藏 | ✅ |
| DELETE | `/api/favorites/:propertyId` | 取消收藏 | ✅ |

**总计**: 16个API接口

## 数据模型

### User（用户）
- `id`: 用户ID
- `openId`: 微信openId
- `nickname`: 昵称
- `avatar`: 头像URL
- `campus`: 校区
- `motto`: 个性签名

### Property（房源）
- 包含标题、描述、类型、价格、位置、面积、房间数等完整信息
- 支持JSON字段存储图片数组、标签、设施等

### Team（组队）
- 关联房源和创建者
- 包含最大人数限制和状态管理
- 支持active/full/closed三种状态

### TeamMember（组队成员）
- 关联组队和用户
- 记录加入时间
- 唯一约束防止重复加入

### TeamMessage（组队消息）
- 支持文本、图片、系统消息
- 关联组队和发送者

### Favorite（收藏）
- 用户和房源的多对多关系
- 唯一约束防止重复收藏

## 核心业务规则

### 组队规则

1. **每人只能参与一个组队**
   - 创建组队前检查用户是否已在其他组队
   - 加入组队前检查用户是否已在其他组队

2. **组队人数限制**
   - `maxMembers = 房源的bedrooms数`
   - 达到上限后status自动变为'full'

3. **退出规则**
   - 创建者退出 → 解散整个组队（status变为'closed'）
   - 成员退出 → 仅移除该成员
   - 退出后可加入其他组队

## 响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 返回的数据
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 错误码

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权，需要登录
- `403`: 权限不足
- `404`: 资源不存在
- `1001`: 用户已在其他组队中
- `1002`: 组队已满
- `1003`: 只有创建者可以解散组队
- `1004`: 您不在该组队中
- `500`: 服务器内部错误

## 安全性

- ✅ JWT token认证，有效期7天
- ✅ 使用Sequelize ORM防止SQL注入
- ✅ 敏感配置通过环境变量管理
- ✅ 错误信息统一处理，不暴露内部细节

## 数据库

项目使用Sequelize ORM自动同步数据库表结构，首次启动会自动创建以下表：

- `Users`
- `Properties`
- `Teams`
- `TeamMembers`
- `TeamMessages`
- `Favorites`

## 开发建议

1. 使用Postman或Thunder Client测试API
2. 查看`api.md`了解详细的API文档
3. 所有需要认证的接口需在Header中添加：
   ```
   Authorization: Bearer {token}
   ```

## 许可证

Apache-2.0

---

**详细API文档**: 请参阅 [api.md](./api.md)
