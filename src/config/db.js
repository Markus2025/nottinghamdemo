const { Sequelize } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

// 解析数据库地址
let host, port;
if (MYSQL_ADDRESS) {
  [host, port] = MYSQL_ADDRESS.split(":");
} else {
  console.warn('⚠️  警告：MYSQL_ADDRESS环境变量未配置');
  host = 'localhost';
  port = 3306;
}

console.log('📊 数据库配置信息:');
console.log('  - Host:', host);
console.log('  - Port:', port);
console.log('  - Database: nottingham_db');
console.log('  - Username:', MYSQL_USERNAME ? '已配置' : '未配置');

// 创建Sequelize实例
const sequelize = new Sequelize("nottingham_db", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port: parseInt(port) || 3306,
  dialect: "mysql",
  logging: false, // 生产环境关闭日志
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 数据库初始化方法
async function initDB() {
  try {
    console.log('🔄 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 导入所有模型（确保模型关系被加载）
    require('../models');

    // 同步所有模型
    console.log('🔄 正在同步数据库模型...');
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库模型同步成功');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error('详细错误:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initDB
};
