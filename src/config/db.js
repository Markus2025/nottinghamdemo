const { Sequelize } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

// 创建Sequelize实例
const sequelize = new Sequelize("nottingham_db", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
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
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步所有模型
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initDB
};
