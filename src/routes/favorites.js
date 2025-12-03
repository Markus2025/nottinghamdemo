const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
    getFavorites,
    addFavorite,
    removeFavorite
} = require("../controllers/favoriteController");

// 所有收藏接口都需要认证
router.use(authenticate);

// 获取收藏列表
router.get("/", getFavorites);

// 添加收藏
router.post("/", addFavorite);

// 取消收藏
router.delete("/:propertyId", removeFavorite);

module.exports = router;
