# API 测试和前后端联调指南

## 一、后端服务状态检查

### 1. 验证服务是否正常启动

访问健康检查端点：
```bash
curl http://localhost/
```

**预期结果**：
```json
{
  "code": 200,
  "message": "Nottingham房源小程序API服务运行中",
  "version": "1.0.0",
  "timestamp": "...",
  "admin": {
    "enabled": true,
    "path": "/admin"
  }
}
```

---

## 二、API 功能测试

### 测试准备

1. **获取登录 token**：
   - 打开微信小程序，登录账号
   - 或者使用现有的测试 token

2. **替换测试命令中的变量**：
   - `{token}` - 替换为实际的 JWT token
   - `{teamId}` - 替换为实际的组队ID（如：1）
   - `{userId}` - 替换为实际的用户ID

### 测试用例 1: 获取组队详情

**目的**：验证 GET /api/teams/:teamId 是否正常工作

```bash
# Windows PowerShell
curl -Method GET `
  -Uri "http://localhost/api/teams/1" `
  -Headers @{"Authorization"="Bearer {YOUR_TOKEN}"}

# Linux/Mac
curl -X GET 'http://localhost/api/teams/1' \
  -H 'Authorization: Bearer {YOUR_TOKEN}'
```

**预期成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "propertyId": 1,
    "propertyTitle": "市中心豪华公寓",
    "creator": {
      "id": 1,
      "nickname": "张三",
      "avatar": "...",
      "campus": "University Park",
      "note": ""  // ✅ 包含 note 字段
    },
    "members": [
      {
        "id": 1,
        "nickname": "张三",
        "avatar": "...",
        "campus": "University Park",
        "note": "",  // ✅ 包含 note 字段
        "joinedAt": "2024-01-01T10:00:00Z"
      }
    ],
    "maxMembers": 3,
    "description": "寻找室友...",
    "status": "active"
  }
}
```

**预期错误响应** (如果不是组队成员)：
```json
{
  "code": 403,
  "message": "您不是该组队成员，无法查看详情"
}
```

---

### 测试用例 2: 更新个人备注（成功场景）

**目的**：验证用户可以更新自己的备注

```bash
# Windows PowerShell
curl -Method PUT `
  -Uri "http://localhost/api/teams/1/members/1/note" `
  -Headers @{
    "Authorization"="Bearer {YOUR_TOKEN}";
    "Content-Type"="application/json"
  } `
  -Body '{"note":"我是计算机专业学生，作息规律，喜欢安静。微信：test123"}'

# Linux/Mac
curl -X PUT 'http://localhost/api/teams/1/members/1/note' \
  -H 'Authorization: Bearer {YOUR_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{"note":"我是计算机专业学生，作息规律，喜欢安静。微信：test123"}'
```

**预期成功响应**：
```json
{
  "code": 200,
  "message": "备注更新成功",
  "data": {
    "id": 1,
    "nickname": "张三",
    "avatar": "...",
    "campus": "University Park",
    "note": "我是计算机专业学生，作息规律，喜欢安静。微信：test123",
    "joinedAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### 测试用例 3: 权限验证（尝试修改他人备注）

**目的**：验证用户不能修改其他成员的备注

```bash
# 用 userId=1 的 token 尝试修改 userId=2 的备注
curl -X PUT 'http://localhost/api/teams/1/members/2/note' \
  -H 'Authorization: Bearer {USER1_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{"note":"尝试修改他人备注"}'
```

**预期错误响应**：
```json
{
  "code": 403,
  "message": "您只能编辑自己的备注"
}
```

---

### 测试用例 4: 长度验证

**目的**：验证备注长度限制（最大500字符）

```bash
# 创建一个超过500字符的备注
curl -X PUT 'http://localhost/api/teams/1/members/1/note' \
  -H 'Authorization: Bearer {YOUR_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{"note":"这是一段很长的文本，超过500字符的内容..."}'
```

**预期错误响应**：
```json
{
  "code": 400,
  "message": "备注内容不能超过500字符"
}
```

---

### 测试用例 5: 验证现有 API 包含 note 字段

**目的**：确保其他 API 也返回 note 字段

```bash
# 测试获取我的组队
curl -X GET 'http://localhost/api/teams/my' \
  -H 'Authorization: Bearer {YOUR_TOKEN}'

# 测试获取组队列表
curl -X GET 'http://localhost/api/teams' \
  -H 'Authorization: Bearer {YOUR_TOKEN}'
```

**检查点**：返回的成员数组中应包含 `note` 字段

---

## 三、前后端联调步骤

### 步骤 1: 确认前端配置

打开 `utils/api.js`，确认：
```javascript
const USE_MOCK_DATA = false  // ✅ 必须是 false
```

### 步骤 2: 启动微信开发者工具

1. 打开微信开发者工具
2. 确保后端服务地址配置正确
3. 清除缓存（工具 → 清除缓存）
4. 重新编译

### 步骤 3: 测试组队详情页面

1. **进入组队列表**
   - 点击小程序底部"组队"
   - 切换到"我的组队" tab

2. **查看组队详情**
   - 点击组队卡片
   - 应该能看到组队详情页面
   - 验证房源信息、组队说明都正常显示

3. **查看成员信息**
   - 检查是否显示所有成员
   - 每个成员应该有头像、昵称、校区
   - 应该有备注区域（即使为空）

### 步骤 4: 测试编辑备注功能

1. **找到自己的备注区域**
   - 在成员列表中找到自己
   - 应该看到"编辑"按钮

2. **编辑备注**
   - 点击"编辑"按钮
   - 输入框应该弹出
   - 输入备注内容，例如：
     ```
     计算机专业研一，作息规律，爱干净。
     希望找到志同道合的室友。
     微信：zhang123
     ```

3. **保存备注**
   - 点击"保存"
   - 应该显示"保存成功"提示
   - 备注内容应该立即显示

4. **验证只读限制**
   - 查看其他成员的备注区域
   - 应该只能查看，不能编辑
   - 不应该有"编辑"按钮

### 步骤 5: 测试数据持久化

1. 退出组队详情页面
2. 重新进入组队详情
3. 验证备注内容是否保存成功

---

## 四、常见问题排查

### 问题 1: API 返回 403 或 401 错误

**原因**：token 无效或已过期

**解决**：
1. 在小程序中重新登录
2. 检查 token 是否正确传递
3. 查看后端日志确认认证状态

### 问题 2: 提示"组队不存在"

**原因**：
- teamId 不存在
- 用户不是该组队成员

**解决**：
1. 检查数据库中是否有对应的组队记录
2. 验证用户是否在 TeamMembers 表中
3. 查看后端日志

### 问题 3: note 字段显示 undefined

**原因**：数据库迁移未执行

**解决**：
```sql
-- 检查字段是否存在
DESCRIBE TeamMembers;

-- 如果不存在，执行迁移
ALTER TABLE TeamMembers 
ADD COLUMN note VARCHAR(500) DEFAULT '' COMMENT '成员个人备注';
```

### 问题 4: 前端无法保存备注

**原因**：
- API 请求失败
- 权限验证失败
- 字段验证失败

**解决**：
1. 打开浏览器控制台查看网络请求
2. 检查请求参数和响应
3. 查看后端日志
4. 验证 userId 是否匹配

### 问题 5: 后端服务无法启动

**解决**：
1. 检查端口 80 是否被占用
2. 验证数据库连接配置
3. 查看控制台错误信息

---

## 五、调试技巧

### 1. 查看后端日志

后端服务启动后会输出详细日志，关注：
- 数据库连接状态
- API 请求日志
- 错误信息

### 2. 使用浏览器开发者工具

在微信开发者工具中：
1. 打开"调试器"
2. 查看"Network"网络请求
3. 检查 API 请求和响应

### 3. 数据库直接查询

```sql
-- 查看组队成员和备注
SELECT 
  tm.teamId,
  tm.userId,
  u.nickname,
  tm.note,
  tm.joinedAt
FROM TeamMembers tm
JOIN Users u ON tm.userId = u.id
WHERE tm.teamId = 1;
```

---

## 六、验证清单

完成测试后，请确认：

- ✅ 后端服务正常启动
- ✅ GET /api/teams/:teamId 正常返回数据
- ✅ PUT /api/teams/:teamId/members/:userId/note 可以更新备注
- ✅ 权限验证正常（不能修改他人备注）
- ✅ 长度验证正常（超过500字符报错）
- ✅ 前端可以正常查看组队详情
- ✅ 前端可以正常编辑个人备注
- ✅ 备注保存后立即显示
- ✅ 备注数据持久化成功

---

## 七、后续优化建议

1. **备注格式化**
   - 自动识别微信号、电话号码
   - 添加链接点击功能

2. **敏感词过滤**
   - 添加敏感词检测
   - 防止恶意内容

3. **字数统计**
   - 在输入框显示剩余字数
   - 实时提示字数限制

4. **备注模板**
   - 提供常用备注模板
   - 快速填写个人信息

---

如有任何问题，请随时联系！🚀
