# Nottingham 房源小程序 - 前端接口对接文档

## 基础配置

### 服务器地址
```
BASE_URL: https://express-17k0-204181-4-1371262252.sh.run.tcloudbase.com
```

### 请求头配置

**不需要认证的接口**：
```javascript
{
  'Content-Type': 'application/json'
}
```

**需要认证的接口**：
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}'
}
```

### 统一响应格式

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，请先登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 1001 | 用户已在其他组队中 |
| 1002 | 组队已满 |
| 1003 | 只有创建者可以解散组队 |
| 1004 | 您不在该组队中 |
| 500 | 服务器内部错误 |

---

## 一、认证接口

### 1.1 微信登录

**接口地址**：`POST /api/auth/login`

**是否需要认证**：❌ 否

**请求参数**：
```json
{
  "code": "wx.login获取的code",
  "userInfo": {
    "nickName": "微信昵称",
    "avatarUrl": "微信头像URL"
  }
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "openId": "oABCD1234567890",
      "nickname": "张三",
      "avatar": "https://xxx.com/avatar.png",
      "campus": "University of Nottingham(Park)",
      "motto": "找个好室友"
    }
  }
}
```

**失败响应**：
```json
{
  "code": 400,
  "message": "缺少code参数",
  "data": null
}
```

**小程序调用示例**：
```javascript
// 1. 先调用wx.login获取code
wx.login({
  success: (loginRes) => {
    // 2. 再调用wx.getUserProfile获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        // 3. 调用后端登录接口
        wx.request({
          url: 'https://express-17k0-204181-4-1371262252.sh.run.tcloudbase.com/api/auth/login',
          method: 'POST',
          data: {
            code: loginRes.code,
            userInfo: {
              nickName: profileRes.userInfo.nickName,
              avatarUrl: profileRes.userInfo.avatarUrl
            }
          },
          success: (res) => {
            if (res.data.code === 200) {
              // 保存token
              wx.setStorageSync('token', res.data.data.token);
              // 保存用户信息
              wx.setStorageSync('userInfo', res.data.data.user);
            }
          }
        });
      }
    });
  }
});
```

---

### 1.2 刷新Token

**接口地址**：`POST /api/auth/refresh`

**是否需要认证**：✅ 是

**请求参数**：无需body参数，但需要在Header中携带旧token

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**失败响应**：
```json
{
  "code": 401,
  "message": "Token已过期",
  "data": null
}
```

---

### 1.3 更新用户信息

**接口地址**：`PUT /api/user/profile`

**是否需要认证**：✅ 是

**请求参数**：
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL",
  "campus": "University of Nottingham(Jubilee)",
  "motto": "个性签名"
}
```
> 注：所有字段都是可选的，只传需要更新的字段

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openId": "oABCD1234567890",
    "nickname": "新昵称",
    "avatar": "新头像URL",
    "campus": "University of Nottingham(Jubilee)",
    "motto": "个性签名"
  }
}
```

**失败响应**：
```json
{
  "code": 401,
  "message": "未授权，请先登录",
  "data": null
}
```

---

## 二、房源接口

### 2.1 获取房源列表

**接口地址**：`GET /api/properties`

**是否需要认证**：❌ 否

**请求参数**（Query参数）：
```
page=1              // 页码，默认1
limit=10            // 每页数量，默认10
type=all            // 房型：all | apartment | house
minPrice=500        // 最低价格（£）
maxPrice=1000       // 最高价格（£）
bedrooms=2          // 卧室数
location=Lenton     // 位置关键词
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "Lenton市中心精装公寓",
        "description": "交通便利，设施齐全",
        "type": "apartment",
        "price": 650.00,
        "deposit": 650.00,
        "location": "Lenton",
        "address": "123 Lenton Boulevard, NG7 2BY",
        "bedrooms": 3,
        "bathrooms": 2,
        "area": 85.50,
        "floor": 5,
        "totalFloors": 10,
        "images": [
          "https://xxx.com/img1.jpg",
          "https://xxx.com/img2.jpg"
        ],
        "tags": ["包Bill", "近学校", "全新装修"],
        "facilities": ["洗衣机", "烘干机", "冰箱", "微波炉"],
        "contactName": "李经理",
        "contactPhone": "+44 7123456789",
        "contactQRCode": "https://xxx.com/qrcode.jpg",
        "status": "available",
        "createdAt": "2025-12-01T10:00:00.000Z",
        "updatedAt": "2025-12-01T10:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

**失败响应**：
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

**小程序调用示例**：
```javascript
wx.request({
  url: 'https://express-17k0-204181-4-1371262252.sh.run.tcloudbase.com/api/properties',
  method: 'GET',
  data: {
    page: 1,
    limit: 10,
    type: 'apartment',
    minPrice: 500,
    maxPrice: 1000
  },
  success: (res) => {
    if (res.data.code === 200) {
      this.setData({
        properties: res.data.data.list,
        total: res.data.data.total
      });
    }
  }
});
```

---

### 2.2 获取房源详情

**接口地址**：`GET /api/properties/:id`

**是否需要认证**：❌ 否

**请求参数**：
```
id: 房源ID（路径参数）
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "Lenton市中心精装公寓",
    "description": "交通便利，设施齐全，步行5分钟到University Park校区",
    "type": "apartment",
    "price": 650.00,
    "deposit": 650.00,
    "location": "Lenton",
    "address": "123 Lenton Boulevard, NG7 2BY",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 85.50,
    "floor": 5,
    "totalFloors": 10,
    "images": [
      "https://xxx.com/img1.jpg",
      "https://xxx.com/img2.jpg"
    ],
    "tags": ["包Bill", "近学校", "全新装修"],
    "facilities": ["洗衣机", "烘干机", "冰箱", "微波炉", "独立卫浴"],
    "contactName": "李经理",
    "contactPhone": "+44 7123456789",
    "contactQRCode": "https://xxx.com/qrcode.jpg",
    "status": "available",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-01T10:00:00.000Z"
  }
}
```

**失败响应**：
```json
{
  "code": 404,
  "message": "房源不存在",
  "data": null
}
```

---

### 2.3 搜索房源

**接口地址**：`GET /api/properties/search`

**是否需要认证**：❌ 否

**请求参数**（Query参数）：
```
keyword=Lenton      // 搜索关键词（必填）
page=1              // 页码，默认1
limit=10            // 每页数量，默认10
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "Lenton市中心精装公寓",
        // ... 其他字段同房源列表
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

**失败响应**：
```json
{
  "code": 400,
  "message": "缺少搜索关键词",
  "data": null
}
```

---

## 三、组队接口

### 3.1 创建组队

**接口地址**：`POST /api/teams`

**是否需要认证**：✅ 是

**请求参数**：
```json
{
  "propertyId": 1,
  "description": "想找两个爱干净的室友，我是研一学生，作息规律"
}
```
> 注：description是可选的

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "propertyId": 1,
    "propertyTitle": "Lenton市中心精装公寓",
    "creator": {
      "id": 1,
      "nickname": "张三",
      "avatar": "https://xxx.com/avatar.png",
      "campus": "University of Nottingham(Park)"
    },
    "members": [
      {
        "id": 1,
        "nickname": "张三",
        "avatar": "https://xxx.com/avatar.png",
        "campus": "University of Nottingham(Park)",
        "joinedAt": "2025-12-03T12:00:00.000Z"
      }
    ],
    "maxMembers": 3,
    "description": "想找两个爱干净的室友，我是研一学生，作息规律",
    "status": "active",
    "createdAt": "2025-12-03T12:00:00.000Z",
    "updatedAt": "2025-12-03T12:00:00.000Z"
  }
}
```

**失败响应**：
```json
{
  "code": 1001,
  "message": "用户已在其他组队中",
  "data": null
}
```

---

### 3.2 获取组队列表

**接口地址**：`GET /api/teams`

**是否需要认证**：✅ 是

**请求参数**（Query参数）：
```
type=all            // all | my（all=全部组队，my=我的组队）
page=1              // 页码，默认1
limit=10            // 每页数量，默认10
status=active       // active | full | closed
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "propertyId": 1,
        "propertyTitle": "Lenton市中心精装公寓",
        "creator": {
          "id": 1,
          "nickname": "张三",
          "avatar": "https://xxx.com/avatar.png",
          "campus": "University of Nottingham(Park)"
        },
        "members": [
          {
            "id": 1,
            "nickname": "张三",
            "avatar": "https://xxx.com/avatar.png",
            "campus": "University of Nottingham(Park)",
            "joinedAt": "2025-12-03T12:00:00.000Z"
          },
          {
            "id": 2,
            "nickname": "李四",
            "avatar": "https://xxx.com/avatar2.png",
            "campus": "University of Nottingham(Jubilee)",
            "joinedAt": "2025-12-03T13:00:00.000Z"
          }
        ],
        "maxMembers": 3,
        "description": "想找两个爱干净的室友",
        "status": "active",
        "createdAt": "2025-12-03T12:00:00.000Z",
        "updatedAt": "2025-12-03T13:00:00.000Z"
      }
    ],
    "total": 20
  }
}
```

**失败响应**：
```json
{
  "code": 401,
  "message": "未授权，请先登录",
  "data": null
}
```

---

### 3.3 获取我的组队

**接口地址**：`GET /api/teams/my`

**是否需要认证**：✅ 是

**请求参数**：无

**成功响应（已加入组队）**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "propertyId": 1,
    "propertyTitle": "Lenton市中心精装公寓",
    "creator": {
      "id": 1,
      "nickname": "张三",
      "avatar": "https://xxx.com/avatar.png",
      "campus": "University of Nottingham(Park)"
    },
    "members": [
      {
        "id": 1,
        "nickname": "张三",
        "avatar": "https://xxx.com/avatar.png",
        "campus": "University of Nottingham(Park)",
        "joinedAt": "2025-12-03T12:00:00.000Z"
      }
    ],
    "maxMembers": 3,
    "description": "想找两个爱干净的室友",
    "status": "active",
    "createdAt": "2025-12-03T12:00:00.000Z",
    "updatedAt": "2025-12-03T12:00:00.000Z"
  }
}
```

**成功响应（未加入组队）**：
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**失败响应**：
```json
{
  "code": 401,
  "message": "未授权，请先登录",
  "data": null
}
```

---

### 3.4 加入组队

**接口地址**：`POST /api/teams/:teamId/join`

**是否需要认证**：✅ 是

**请求参数**：
```
teamId: 组队ID（路径参数）
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "propertyId": 1,
    "propertyTitle": "Lenton市中心精装公寓",
    "creator": {
      "id": 1,
      "nickname": "张三",
      "avatar": "https://xxx.com/avatar.png",
      "campus": "University of Nottingham(Park)"
    },
    "members": [
      {
        "id": 1,
        "nickname": "张三",
        "avatar": "https://xxx.com/avatar.png",
        "campus": "University of Nottingham(Park)",
        "joinedAt": "2025-12-03T12:00:00.000Z"
      },
      {
        "id": 2,
        "nickname": "李四",
        "avatar": "https://xxx.com/avatar2.png",
        "campus": "University of Nottingham(Jubilee)",
        "joinedAt": "2025-12-03T13:00:00.000Z"
      }
    ],
    "maxMembers": 3,
    "description": "想找两个爱干净的室友",
    "status": "active",
    "createdAt": "2025-12-03T12:00:00.000Z",
    "updatedAt": "2025-12-03T13:00:00.000Z"
  }
}
```

**失败响应示例**：

**用户已在其他组队**：
```json
{
  "code": 1001,
  "message": "用户已在其他组队中",
  "data": null
}
```

**组队已满**：
```json
{
  "code": 1002,
  "message": "组队已满",
  "data": null
}
```

**组队不存在**：
```json
{
  "code": 404,
  "message": "组队不存在",
  "data": null
}
```

---

### 3.5 退出组队

**接口地址**：`DELETE /api/teams/:teamId/leave`

**是否需要认证**：✅ 是

**请求参数**：
```
teamId: 组队ID（路径参数）
```

**成功响应**：
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

**失败响应示例**：

**不在该组队**：
```json
{
  "code": 1004,
  "message": "您不在该组队中",
  "data": null
}
```

**组队不存在**：
```json
{
  "code": 404,
  "message": "组队不存在",
  "data": null
}
```

---

### 3.6 获取组队消息

**接口地址**：`GET /api/teams/:teamId/messages`

**是否需要认证**：✅ 是

**请求参数**（Query参数）：
```
teamId: 组队ID（路径参数）
page=1              // 页码，默认1
limit=50            // 每页数量，默认50
sinceId=100         // 获取此ID之后的消息（用于增量获取）
```

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "teamId": 1,
        "userId": 1,
        "content": "大家好，我是张三",
        "type": "text",
        "createdAt": "2025-12-03T12:00:00.000Z",
        "sender": {
          "id": 1,
          "nickname": "张三",
          "avatar": "https://xxx.com/avatar.png"
        }
      },
      {
        "id": 2,
        "teamId": 1,
        "userId": 2,
        "content": "你好，我是李四",
        "type": "text",
        "createdAt": "2025-12-03T12:05:00.000Z",
        "sender": {
          "id": 2,
          "nickname": "李四",
          "avatar": "https://xxx.com/avatar2.png"
        }
      }
    ],
    "total": 2
  }
}
```

**失败响应**：
```json
{
  "code": 403,
  "message": "您不在该组队中",
  "data": null
}
```

---

### 3.7 发送组队消息

**接口地址**：`POST /api/teams/:teamId/messages`

**是否需要认证**：✅ 是

**请求参数**：
```json
{
  "content": "大家好，我是新成员",
  "type": "text"
}
```
> 注：type可选值：text | image | system，默认text

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 3,
    "teamId": 1,
    "userId": 3,
    "content": "大家好，我是新成员",
    "type": "text",
    "createdAt": "2025-12-03T14:00:00.000Z",
    "sender": {
      "id": 3,
      "nickname": "王五",
      "avatar": "https://xxx.com/avatar3.png"
    }
  }
}
```

**失败响应示例**：

**消息内容为空**：
```json
{
  "code": 400,
  "message": "消息内容不能为空",
  "data": null
}
```

**不在该组队**：
```json
{
  "code": 403,
  "message": "您不在该组队中",
  "data": null
}
```

---

## 四、收藏接口

### 4.1 获取收藏列表

**接口地址**：`GET /api/favorites`

**是否需要认证**：✅ 是

**请求参数**：无

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "Lenton市中心精装公寓",
      "description": "交通便利，设施齐全",
      "type": "apartment",
      "price": 650.00,
      "deposit": 650.00,
      "location": "Lenton",
      "address": "123 Lenton Boulevard, NG7 2BY",
      "bedrooms": 3,
      "bathrooms": 2,
      "area": 85.50,
      "images": [
        "https://xxx.com/img1.jpg"
      ],
      "tags": ["包Bill", "近学校"],
      "status": "available",
      "createdAt": "2025-12-01T10:00:00.000Z"
    }
  ]
}
```

**失败响应**：
```json
{
  "code": 401,
  "message": "未授权，请先登录",
  "data": null
}
```

---

### 4.2 添加收藏

**接口地址**：`POST /api/favorites`

**是否需要认证**：✅ 是

**请求参数**：
```json
{
  "propertyId": 1
}
```

**成功响应**：
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": null
}
```

**失败响应示例**：

**房源不存在**：
```json
{
  "code": 404,
  "message": "房源不存在",
  "data": null
}
```

**已收藏**：
```json
{
  "code": 400,
  "message": "已收藏该房源",
  "data": null
}
```

---

### 4.3 取消收藏

**接口地址**：`DELETE /api/favorites/:propertyId`

**是否需要认证**：✅ 是

**请求参数**：
```
propertyId: 房源ID（路径参数）
```

**成功响应**：
```json
{
  "code": 200,
  "message": "取消收藏成功",
  "data": null
}
```

**失败响应**：
```json
{
  "code": 404,
  "message": "未收藏该房源",
  "data": null
}
```

---

## 五、小程序请求封装示例

### 封装统一请求方法

在小程序的`utils/api.js`中：

```javascript
const BASE_URL = 'https://express-17k0-204181-4-1371262252.sh.run.tcloudbase.com';

/**
 * 统一请求方法
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data.data);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

// 导出API方法
module.exports = {
  // 认证
  login: (data) => request({ url: '/api/auth/login', method: 'POST', data }),
  updateProfile: (data) => request({ url: '/api/user/profile', method: 'PUT', data }),
  
  // 房源
  getProperties: (data) => request({ url: '/api/properties', data }),
  getPropertyDetail: (id) => request({ url: `/api/properties/${id}` }),
  searchProperties: (data) => request({ url: '/api/properties/search', data }),
  
  // 组队
  createTeam: (data) => request({ url: '/api/teams', method: 'POST', data }),
  getTeams: (data) => request({ url: '/api/teams', data }),
  getMyTeam: () => request({ url: '/api/teams/my' }),
  joinTeam: (teamId) => request({ url: `/api/teams/${teamId}/join`, method: 'POST' }),
  leaveTeam: (teamId) => request({ url: `/api/teams/${teamId}/leave`, method: 'DELETE' }),
  getTeamMessages: (teamId, data) => request({ url: `/api/teams/${teamId}/messages`, data }),
  sendTeamMessage: (teamId, data) => request({ url: `/api/teams/${teamId}/messages`, method: 'POST', data }),
  
  // 收藏
  getFavorites: () => request({ url: '/api/favorites' }),
  addFavorite: (data) => request({ url: '/api/favorites', method: 'POST', data }),
  removeFavorite: (propertyId) => request({ url: `/api/favorites/${propertyId}`, method: 'DELETE' })
};
```

### 使用示例

在页面中调用：

```javascript
const api = require('../../utils/api.js');

Page({
  data: {
    properties: []
  },
  
  // 加载房源列表
  async loadProperties() {
    try {
      const data = await api.getProperties({
        page: 1,
        limit: 10,
        type: 'all'
      });
      this.setData({
        properties: data.list,
        total: data.total
      });
    } catch (error) {
      console.error('加载失败', error);
    }
  },
  
  // 收藏房源
  async addToFavorite(propertyId) {
    try {
      await api.addFavorite({ propertyId });
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('收藏失败', error);
    }
  }
});
```

---

## 六、常见问题

### 1. Token过期怎么办？

当接口返回`code: 401`且`message`包含"Token"时，需要：
1. 清除本地token
2. 跳转到登录页面重新登录

```javascript
if (res.data.code === 401 && res.data.message.includes('Token')) {
  wx.removeStorageSync('token');
  wx.navigateTo({
    url: '/pages/login/login'
  });
}
```

### 2. 如何处理业务错误码（1001-1004）？

根据不同的错误码进行相应的提示：

```javascript
const ERROR_MESSAGES = {
  1001: '您已在其他组队中，需要先退出才能加入新组队',
  1002: '该组队已满员',
  1003: '只有创建者可以解散组队',
  1004: '您不在该组队中'
};

if (res.data.code >= 1001 && res.data.code <= 1004) {
  wx.showModal({
    title: '提示',
    content: ERROR_MESSAGES[res.data.code],
    showCancel: false
  });
}
```

### 3. 如何调试接口？

1. 使用微信开发者工具的Network面板查看请求
2. 在`request`方法中添加`console.log`打印请求和响应
3. 使用Postman测试后端接口

---

**文档版本**：v1.0  
**更新日期**：2025-12-03  
**联系方式**：如有疑问请联系后端开发团队
