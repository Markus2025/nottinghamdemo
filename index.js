const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { initDB } = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

// 导入路由
const authRoutes = require("./src/routes/auth");
const propertyRoutes = require("./src/routes/properties");
const teamRoutes = require("./src/routes/teams");
const favoriteRoutes = require("./src/routes/favorites");

const logger = morgan("tiny");
const app = express();

// 中间件
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// API路由
app.use("/api/auth", authRoutes);
app.use("/api/user", authRoutes); // /api/user/profile 也在 authRoutes 中
app.use("/api/properties", propertyRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/favorites", favoriteRoutes);

// 健康检查
app.get("/", (req, res) => {
  res.json({
    code: 200,
    message: "Nottingham房源小程序API服务运行中",
    version: "1.0.0"
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

const port = process.env.PORT || 80;

async function bootstrap() {
  try {
    // 初始化数据库
    await initDB();

    // 启动服务器
    app.listen(port, () => {
      console.log(`✅ Nottingham API服务启动成功`);
      console.log(`📡 端口: ${port}`);
      console.log(`🗄️  数据库: nottingham_db`);
      console.log(`🚀 API文档: 参见 api.md`);
    });
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

bootstrap();
