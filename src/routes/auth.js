const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { login, refreshToken, updateProfile } = require("../controllers/authController");

// 微信登录
router.post("/login", login);

// 刷新Token
router.post("/refresh", authenticate, refreshToken);

// 更新用户信息
router.put("/profile", authenticate, updateProfile);

module.exports = router;
