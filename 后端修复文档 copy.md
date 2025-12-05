# 后端修复需求文档

## 问题总结

前端测试发现需要后端配合的问题：
1. ~~**创建组队时的500错误**~~（✅ 已修复）
2. **用户信息更新API缺失**（🔴 需要立即添加）

---

## ✅ 问题1：POST /api/teams 返回500错误（已修复）

此问题已由后端修复。当用户已在组队时，现在能正确返回1001错误码。

---

## 🔴 问题2：需要添加用户信息更新API（必须添加）

## 🔴 问题2：需要添加用户信息更新API（必须添加）

### 问题描述

前端用户在"我的"页面修改了昵称和校区，但这些信息只保存在前端localStorage，没有同步到后端数据库。导致：
- 组队详情页显示的是数据库中的旧数据（"微信用户"，campus为null）
- 而不是用户修改后的新数据（"Markus "，campus为"University of Nottingham(Jubilee)"）

### 需要添加的API

**接口**：`PUT /api/users/profile`

**请求参数**：
```javascript
{
  "nickname": "Markus",  // 可选
  "avatar": "https://xxx",  // 可选
  "campus": "University of Nottingham(Park)"  // 可选
}
```

**响应**：
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "nickname": "Markus",
    "avatar": "https://xxx",
    "campus": "University of Nottingham(Park)",
    "openId": "xxx"
  }
}
```

### 实现建议

```javascript
// routes/users.js
router.put('/users/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { nickname, avatar, campus } = req.body

    // 构建更新对象（只更新提供的字段）
    const updates = {}
    if (nickname !== undefined) updates.nickname = nickname
    if (avatar !== undefined) updates.avatar = avatar
    if (campus !== undefined) updates.campus = campus

    // 更新用户信息
    await User.update(updates, {
      where: { id: userId }
    })

    // 返回更新后的用户信息
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nickname', 'avatar', 'campus', 'openId']
    })

    return res.status(200).json({
      code: 200,
      message: 'success',
      data: user
    })

  } catch (error) {
    console.error('更新用户信息失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    })
  }
})
```

### 关键点

1. **需要验证token**：使用auth中间件
2. **部分更新**：只更新前端传来的字段
3. **返回完整信息**：更新后返回最新的用户信息
4. **立即生效**：更新后，下次获取组队信息时应该显示新的昵称和校区

---

## 📋 总结

**当前唯一需要后端添加的功能**：
- ✅ PUT /api/users/profile 接口（用于更新用户昵称、头像、校区）

**已完成**：
- ✅ 前端已添加调用逻辑（`api.js` 和 `profile.js`）
- ✅ 创建组队500错误已修复

**下一步**：
1. 后端添加 PUT /api/users/profile 接口
2. 前端测试：修改昵称和校区后，组队详情页应显示新信息
