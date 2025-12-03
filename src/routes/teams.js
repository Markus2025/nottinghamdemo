const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
    createTeam,
    getTeams,
    getMyTeam,
    joinTeam,
    leaveTeam,
    getTeamMessages,
    sendTeamMessage
} = require("../controllers/teamController");

// 所有组队接口都需要认证
router.use(authenticate);

// 获取我的组队（必须放在/:teamId之前）
router.get("/my", getMyTeam);

// 创建组队
router.post("/", createTeam);

// 获取组队列表
router.get("/", getTeams);

// 加入组队
router.post("/:teamId/join", joinTeam);

// 退出组队
router.delete("/:teamId/leave", leaveTeam);

// 获取组队消息
router.get("/:teamId/messages", getTeamMessages);

// 发送组队消息
router.post("/:teamId/messages", sendTeamMessage);

module.exports = router;
