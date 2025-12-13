const { Team, TeamMember, User, Property, TeamMessage } = require("../models");
const { success, error } = require("../utils/response");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");

/**
 * 创建组队
 * POST /api/teams
 */
async function createTeam(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
        const { propertyId, description } = req.body;
        const userId = req.userId;

        if (!propertyId) {
            await transaction.rollback();
            return error(res, 400, "缺少propertyId参数");
        }

        // 检查用户是否已在其他组队中
        const existingMembership = await TeamMember.findOne({
            where: { userId },
            include: [{
                model: Team,
                where: { status: { [Op.in]: ['active', 'full'] } }
            }]
        });

        if (existingMembership) {
            await transaction.rollback();
            return error(res, 1001, "用户已在其他组队中");
        }

        // 获取房源信息
        const property = await Property.findByPk(propertyId);
        if (!property) {
            await transaction.rollback();
            return error(res, 404, "房源不存在");
        }

        // 创建组队
        const team = await Team.create({
            propertyId,
            propertyTitle: property.title,
            creatorId: userId,
            maxMembers: property.bedrooms,
            description: description || '',
            status: property.bedrooms === 1 ? 'full' : 'active'
        }, { transaction });

        // 创建者自动加入成员列表
        await TeamMember.create({
            teamId: team.id,
            userId,
            joinedAt: new Date()
        }, { transaction });

        await transaction.commit();

        // 获取完整的组队信息
        const teamWithDetails = await getTeamDetails(team.id);

        success(res, teamWithDetails);
    } catch (err) {
        await transaction.rollback();
        next(err);
    }
}

/**
 * 获取组队列表
 * GET /api/teams
 */
async function getTeams(req, res, next) {
    try {
        const { type = 'all', page = 1, limit = 10, status = 'active' } = req.query;
        const userId = req.userId;

        let where = {};

        if (status !== 'all') {
            where.status = status;
        }

        // 如果是"我的组队"，筛选用户参与的组队
        let include = [
            {
                model: User,
                as: 'creator',
                attributes: ['id', 'nickname', 'avatar', 'campus']
            },
            {
                model: TeamMember,
                as: 'teamMembers',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'nickname', 'avatar', 'campus']
                }]
            },
            {
                model: Property,
                as: 'property',
                attributes: ['id', 'title', 'images', 'contactQRCode']
            }
        ];

        if (type === 'my') {
            include.push({
                model: TeamMember,
                as: 'teamMembers',
                where: { userId },
                required: true
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Team.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        // 格式化数据
        const list = rows.map(team => formatTeamData(team));

        success(res, {
            list,
            total: count
        });
    } catch (err) {
        next(err);
    }
}

/**
 * 获取我的组队
 * GET /api/teams/my
 */
async function getMyTeam(req, res, next) {
    try {
        const userId = req.userId;

        const membership = await TeamMember.findOne({
            where: { userId },
            include: [{
                model: Team,
                where: { status: { [Op.in]: ['active', 'full'] } },
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'nickname', 'avatar', 'campus']
                    },
                    {
                        model: TeamMember,
                        as: 'teamMembers',
                        include: [{
                            model: User,
                            as: 'user',
                            attributes: ['id', 'nickname', 'avatar', 'campus']
                        }]
                    },
                    {
                        model: Property,
                        as: 'property',
                        attributes: ['id', 'title', 'images', 'contactQRCode']
                    }
                ]
            }]
        });

        if (!membership) {
            return success(res, null);
        }

        const teamData = formatTeamData(membership.Team);
        success(res, teamData);
    } catch (err) {
        next(err);
    }
}

/**
 * 加入组队
 * POST /api/teams/:teamId/join
 */
async function joinTeam(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
        const { teamId } = req.params;
        const userId = req.userId;

        // 检查用户是否已在其他组队中
        const existingMembership = await TeamMember.findOne({
            where: { userId },
            include: [{
                model: Team,
                where: { status: { [Op.in]: ['active', 'full'] } }
            }]
        });

        if (existingMembership) {
            await transaction.rollback();
            return error(res, 1001, "用户已在其他组队中");
        }

        // 获取组队信息
        const team = await Team.findByPk(teamId, {
            include: [{
                model: TeamMember,
                as: 'teamMembers'
            }]
        });

        if (!team) {
            await transaction.rollback();
            return error(res, 404, "组队不存在");
        }

        if (team.status === 'full') {
            await transaction.rollback();
            return error(res, 1002, "组队已满");
        }

        if (team.status === 'closed') {
            await transaction.rollback();
            return error(res, 400, "组队已关闭");
        }

        // 检查是否已满
        const currentMemberCount = team.teamMembers.length;
        if (currentMemberCount >= team.maxMembers) {
            await transaction.rollback();
            return error(res, 1002, "组队已满");
        }

        // 加入组队
        await TeamMember.create({
            teamId,
            userId,
            joinedAt: new Date()
        }, { transaction });

        // 检查加入后是否满员
        if (currentMemberCount + 1 >= team.maxMembers) {
            await team.update({ status: 'full' }, { transaction });
        }

        await transaction.commit();

        // 获取完整的组队信息
        const teamWithDetails = await getTeamDetails(teamId);

        success(res, teamWithDetails);
    } catch (err) {
        await transaction.rollback();
        next(err);
    }
}

/**
 * 退出组队
 * DELETE /api/teams/:teamId/leave
 */
async function leaveTeam(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
        const { teamId } = req.params;
        const userId = req.userId;

        const team = await Team.findByPk(teamId);

        if (!team) {
            await transaction.rollback();
            return error(res, 404, "组队不存在");
        }

        // 检查用户是否在该组队中
        const membership = await TeamMember.findOne({
            where: { teamId, userId }
        });

        if (!membership) {
            await transaction.rollback();
            return error(res, 1004, "您不在该组队中");
        }

        // 如果是创建者退出，解散整个组队
        if (team.creatorId === userId) {
            await team.update({ status: 'closed' }, { transaction });
            await TeamMember.destroy({ where: { teamId }, transaction });
        } else {
            // 成员退出，移除成员
            await membership.destroy({ transaction });

            // 如果之前是满员状态，改为活跃
            if (team.status === 'full') {
                await team.update({ status: 'active' }, { transaction });
            }
        }

        await transaction.commit();
        success(res, null, "退出成功");
    } catch (err) {
        await transaction.rollback();
        next(err);
    }
}

/**
 * 获取组队消息
 * GET /api/teams/:teamId/messages
 */
async function getTeamMessages(req, res, next) {
    try {
        const { teamId } = req.params;
        const { page = 1, limit = 50, sinceId } = req.query;
        const userId = req.userId;

        // 检查用户是否在该组队中
        const membership = await TeamMember.findOne({
            where: { teamId, userId }
        });

        if (!membership) {
            return error(res, 403, "您不在该组队中");
        }

        const where = { teamId };
        if (sinceId) {
            where.id = { [Op.gt]: parseInt(sinceId) };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await TeamMessage.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'nickname', 'avatar']
            }],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'ASC']]
        });

        success(res, {
            list: rows,
            total: count
        });
    } catch (err) {
        next(err);
    }
}

/**
 * 发送组队消息
 * POST /api/teams/:teamId/messages
 */
async function sendTeamMessage(req, res, next) {
    try {
        const { teamId } = req.params;
        const { content, type = 'text' } = req.body;
        const userId = req.userId;

        if (!content) {
            return error(res, 400, "消息内容不能为空");
        }

        // 检查用户是否在该组队中
        const membership = await TeamMember.findOne({
            where: { teamId, userId }
        });

        if (!membership) {
            return error(res, 403, "您不在该组队中");
        }

        // 创建消息
        const message = await TeamMessage.create({
            teamId,
            userId,
            content,
            type
        });

        // 获取消息详情
        const messageWithSender = await TeamMessage.findByPk(message.id, {
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'nickname', 'avatar']
            }]
        });

        success(res, messageWithSender);
    } catch (err) {
        next(err);
    }
}

// 辅助函数：获取组队详情
async function getTeamDetails(teamId) {
    const team = await Team.findByPk(teamId, {
        include: [
            {
                model: User,
                as: 'creator',
                attributes: ['id', 'nickname', 'avatar', 'campus']
            },
            {
                model: TeamMember,
                as: 'teamMembers',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'nickname', 'avatar', 'campus']
                }],
                order: [['joinedAt', 'ASC']]
            },
            {
                model: Property,
                as: 'property',
                attributes: ['id', 'title', 'images', 'contactQRCode']
            }
        ]
    });

    return formatTeamData(team);
}

// 辅助函数：格式化组队数据
function formatTeamData(team) {
    if (!team) return null;

    const members = team.teamMembers.map(tm => ({
        id: tm.user.id,
        nickname: tm.user.nickname,
        avatar: tm.user.avatar,
        campus: tm.user.campus,
        note: tm.note || '',
        joinedAt: tm.joinedAt
    }));

    // 获取房源主图URL
    let propertyImage = null;
    if (team.property && team.property.images) {
        const images = team.property.images;
        // images可能是数组或换行分隔的字符串
        if (Array.isArray(images) && images.length > 0) {
            propertyImage = images[0];
        } else if (typeof images === 'string' && images.includes('\n')) {
            propertyImage = images.split('\n')[0];
        } else if (typeof images === 'string' && images) {
            propertyImage = images;
        }
    }

    // 获取房东二维码
    const landlordQrCode = team.property?.contactQRCode || null;

    return {
        id: team.id,
        propertyId: team.propertyId,
        propertyTitle: team.propertyTitle,
        propertyImage: propertyImage,  // ✅ 新增：房源主图
        landlordQrCode: landlordQrCode,  // ✅ 新增：房东二维码
        creator: {
            id: team.creator.id,
            nickname: team.creator.nickname,
            avatar: team.creator.avatar,
            campus: team.creator.campus,
            note: team.teamMembers.find(tm => tm.user.id === team.creator.id)?.note || ''
        },
        members,
        maxMembers: team.maxMembers,
        description: team.description,
        status: team.status,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
    };
}

/**
 * 获取指定组队详情
 * GET /api/teams/:teamId
 */
async function getTeamDetail(req, res, next) {
    try {
        const { teamId } = req.params;
        const userId = req.userId;

        // 检查用户是否在该组队中
        const membership = await TeamMember.findOne({
            where: { teamId, userId }
        });

        if (!membership) {
            return error(res, 403, "您不是该组队成员，无法查看详情");
        }

        // 获取组队详情
        const teamData = await getTeamDetails(teamId);

        if (!teamData) {
            return error(res, 404, "组队不存在");
        }

        success(res, teamData);
    } catch (err) {
        next(err);
    }
}

/**
 * 更新成员个人备注
 * PUT /api/teams/:teamId/members/:userId/note
 */
async function updateMemberNote(req, res, next) {
    try {
        const { teamId, userId } = req.params;
        const { note } = req.body;
        const currentUserId = req.userId;

        // 验证：只能修改自己的备注
        if (parseInt(userId) !== currentUserId) {
            return error(res, 403, "您只能编辑自己的备注");
        }

        // 验证备注长度
        if (note && note.length > 500) {
            return error(res, 400, "备注内容不能超过500字符");
        }

        // 检查用户是否在该组队中
        const membership = await TeamMember.findOne({
            where: { teamId, userId }
        });

        if (!membership) {
            return error(res, 404, "组队不存在或您不是该组队成员");
        }

        // 更新备注
        await membership.update({ note: note || '' });

        // 获取更新后的成员信息
        const updatedMembership = await TeamMember.findOne({
            where: { teamId, userId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'nickname', 'avatar', 'campus']
            }]
        });

        const memberData = {
            id: updatedMembership.user.id,
            nickname: updatedMembership.user.nickname,
            avatar: updatedMembership.user.avatar,
            campus: updatedMembership.user.campus,
            note: updatedMembership.note || '',
            joinedAt: updatedMembership.joinedAt
        };

        success(res, memberData, "备注更新成功");
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createTeam,
    getTeams,
    getMyTeam,
    joinTeam,
    leaveTeam,
    getTeamMessages,
    sendTeamMessage,
    getTeamDetail,
    updateMemberNote
};
