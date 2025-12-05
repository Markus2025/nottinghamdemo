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
    sendTeamMessage,
    getTeamDetail,
    updateMemberNote
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

// 更新成员备注（必须在 /:teamId 之前）
router.put("/:teamId/members/:userId/note", updateMemberNote);

// 获取指定组队详情（必须放在最后，避免路由冲突）
router.get("/:teamId", getTeamDetail);

module.exports = router;
