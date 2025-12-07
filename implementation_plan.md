# 房源搜索筛选功能实现方案

## 🎯 问题分析

### 问题1：价格搜索无效
**现状**：用户设置价格区间(0-1000)，但1800的房源仍然显示

**根本原因**：
- filter-bar设置了价格参数：`priceRange: [minPrice, maxPrice]`
- index.js接收了参数：`filters: { type, priceRange }`
- ❌ **但没有传递给API**：`api.getPropertyList({ page, limit })` - 缺少价格参数

### 问题2：户型和位置功能未开发
- `showBedroomFilter()`: 显示"功能开发中"
- `showLocationFilter()`: 显示"功能开发中"

---

## ✅ 解决方案

### 方案1：修复价格搜索

#### 前端修改

**文件**：[pages/index/index.js](file:///d:/Wechat_MiniPrograms/Nottingham/pages/index/index.js)

```javascript
// 修改 loadPropertyList 函数
async loadPropertyList(refresh = false) {
  // ...
  
  const data = await api.getPropertyList({
    page: this.data.page,
    limit: 10,
    // ✅ 添加价格参数
    minPrice: this.data.filters.priceRange[0],
    maxPrice: this.data.filters.priceRange[1],
    // ✅ 添加户型参数（后续）
    bedrooms: this.data.filters.bedrooms,
    // ✅ 添加位置参数（后续）
    location: this.data.filters.location
  })
  
  // ...
}
```

**无需后端修改**（如果API已支持这些参数）

---

### 方案2：实现户型筛选

#### 2.1 定义户型选项

**固定选项**：1居室、2居室、3居室、4居室、5居室、6居室

#### 2.2 前端修改

**文件**：[components/filter-bar/filter-bar.js](file:///d:/Wechat_MiniPrograms/Nottingham/components/filter-bar/filter-bar.js)

```javascript
data: {
  // ...已有字段
  selectedBedrooms: 0, // 0表示不限
  bedroomsOptions: [
    { label: '不限', value: 0 },
    { label: '1居室', value: 1 },
    { label: '2居室', value: 2 },
    { label: '3居室', value: 3 },
    { label: '4居室', value: 4 },
    { label: '5居室', value: 5 },
    { label: '6居室', value: 6 }
  ]
},

methods: {
  showBedroomFilter() {
    this.setData({ showBedroom: true })  // 修改，显示筛选器
  },
  
  handleBedroomsSelect(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ selectedBedrooms: value })
  },
  
  confirmBedrooms() {
    this.hideAllFilters()
    this.triggerFilterChange()
  },
  
  triggerFilterChange() {
    this.triggerEvent('change', {
      type: this.data.activeType,
      priceRange: [this.data.minPrice, this.data.maxPrice],
      bedrooms: this.data.selectedBedrooms  // ✅ 添加
    })
  }
}
```

**文件**：[components/filter-bar/filter-bar.wxml](file:///d:/Wechat_MiniPrograms/Nottingham/components/filter-bar/filter-bar.wxml)

添加户型选择器弹窗：
```xml
<!-- 户型筛选弹窗 -->
<view class="filter-popup" wx:if="{{showBedroom}}" bindtap="hideAllFilters">
  <view class="popup-content" catchtap="stopPropagation">
    <view class="popup-title">选择户型</view>
    <view class="bedrooms-list">
      <view 
        class="bedroom-item {{selectedBedrooms === item.value ? 'active' : ''}}"
        wx:for="{{bedroomsOptions}}" 
        wx:key="value"
        data-value="{{item.value}}"
        bindtap="handleBedroomsSelect">
        {{item.label}}
      </view>
    </view>
    <view class="popup-actions">
      <button bindtap="hideAllFilters">取消</button>
      <button type="primary" bindtap="confirmBedrooms">确定</button>
    </view>
  </view>
</view>
```

---

### 方案3：实现位置筛选

#### 3.1 定义位置选项

**固定选项**（7个区域）：
- Lenton
- Beeston
- Wollaton
- Dunkirk
- City Centre
- Arboretum
- Radford

#### 3.2 前端修改

**文件**：[components/filter-bar/filter-bar.js](file:///d:/Wechat_MiniPrograms/Nottingham/components/filter-bar/filter-bar.js)

```javascript
data: {
  // ...
  selectedLocation: '', // 空表示不限
  locationOptions: [
    { label: '不限', value: '' },
    { label: 'Lenton', value: 'Lenton' },
    { label: 'Beeston', value: 'Beeston' },
    { label: 'Wollaton', value: 'Wollaton' },
    { label: 'Dunkirk', value: 'Dunkirk' },
    { label: 'City Centre', value: 'City Centre' },
    { label: 'Arboretum', value: 'Arboretum' },
    { label: 'Radford', value: 'Radford' }
  ]
},

methods: {
  showLocationFilter() {
    this.setData({ showLocation: true })  // 修改
  },
  
  handleLocationSelect(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ selectedLocation: value })
  },
  
  confirmLocation() {
    this.hideAllFilters()
    this.triggerFilterChange()
  },
  
  triggerFilterChange() {
    this.triggerEvent('change', {
      type: this.data.activeType,
      priceRange: [this.data.minPrice, this.data.maxPrice],
      bedrooms: this.data.selectedBedrooms,
      location: this.data.selectedLocation  // ✅ 添加
    })
  }
}
```

**WXML添加位置选择器**（类似户型）

---

## 🔄 后端需求

### 需要后端配合的部分

> [!IMPORTANT]
> 以下修改需要后端开发人员配合实现

### 1. 数据库字段规范

**表**：`properties`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `bedrooms` | INTEGER | 1-6 | ✅ 固定范围，后台管理使用下拉选择 |
| `location` | VARCHAR(50) | ENUM | ✅ 固定7个值，后台管理使用下拉选择 |
| `price` | DECIMAL | ≥0 | 用于价格筛选 |

**location枚举值**：
```sql
ENUM('Lenton', 'Beeston', 'Wollaton', 'Dunkirk', 'City Centre', 'Arboretum', 'Radford')
```

### 2. API修改

#### GET /api/properties

**现有参数**（推测）：
```javascript
{
  page: 1,
  limit: 10
}
```

**需要支持的新参数**：
```javascript
{
  page: 1,
  limit: 10,
  minPrice: 0,      // 可选，最低价格
  maxPrice: 2000,   // 可选，最高价格
  bedrooms: 2,      // 可选，户型（1-6）
  location: 'Lenton' // 可选，位置
}
```

**后端查询逻辑**：
```javascript
// 示例（Node.js + Sequelize）
let where = { status: 'active' }

if (minPrice !== undefined) {
  where.price = { ...where.price, $gte: minPrice }
}
if (maxPrice !== undefined) {
  where.price = { ...where.price, $lte: maxPrice }
}
if (bedrooms) {
  where.bedrooms = bedrooms
}
if (location) {
  where.location = location
}

const properties = await Property.findAll({ where })
```

### 3. 后台管理系统修改

#### 添加/编辑房源表单

**户型字段**：
```html
<!-- 从文本输入改为下拉选择 -->
<select name="bedrooms" required>
  <option value="1">1居室</option>
  <option value="2">2居室</option>
  <option value="3">3居室</option>
  <option value="4">4居室</option>
  <option value="5">5居室</option>
  <option value="6">6居室</option>
</select>
```

**位置字段**：
```html
<!-- 从文本输入改为下拉选择 -->
<select name="location" required>
  <option value="Lenton">Lenton</option>
  <option value="Beeston">Beeston</option>
  <option value="Wollaton">Wollaton</option>
  <option value="Dunkirk">Dunkirk</option>
  <option value="City Centre">City Centre</option>
  <option value="Arboretum">Arboretum</option>
  <option value="Radford">Radford</option>
</select>
```

---

## 📝 实施步骤

### Phase 1：前端修复价格搜索（无需后端）
1. 修改 `index.js` - 传递价格参数到API
2. 测试价格筛选功能

### Phase 2：前端实现户型和位置（需后端配合）
1. 修改 `filter-bar.js` - 添加户型和位置数据
2. 修改 `filter-bar.wxml` - 添加UI组件
3. 修改 `filter-bar.wxss` - 添加样式
4. 修改 `index.js` - 传递参数到API

### Phase 3：后端配合（交给后端）
1. 修改API支持新参数
2. 修改数据库字段为固定值
3. 修改后台管理系统表单

---

## ✅ 验证清单

- [ ] 价格筛选：设置0-1000，只显示该范围房源
- [ ] 户型筛选：选择2居室，只显示2居室房源
- [ ] 位置筛选：选择Lenton，只显示该区域房源
- [ ] 组合筛选：价格+户型+位置同时生效
- [ ] 重置功能：清空筛选条件
