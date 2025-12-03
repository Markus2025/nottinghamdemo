const express = require("express");
const router = express.Router();
const { getProperties, getPropertyById, searchProperties } = require("../controllers/propertyController");

// 搜索房源（必须放在/:id之前）
router.get("/search", searchProperties);

// 获取房源列表
router.get("/", getProperties);

// 获取房源详情
router.get("/:id", getPropertyById);

module.exports = router;
