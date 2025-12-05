const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const { initDB } = require("./src/config/db");
const { adminOptions } = require("./src/config/admin");
const errorHandler = require("./src/middleware/errorHandler");

// 导入路由
const authRoutes = require("./src/routes/auth");
const propertyRoutes = require("./src/routes/properties");
const teamRoutes = require("./src/routes/teams");
const favoriteRoutes = require("./src/routes/favorites");

const logger = morgan("tiny");
const app = express();

// 重要：先设置cors和logger，但不要设置body-parser
app.use(cors());
app.use(logger);

// Session配置（AdminJS需要）
app.use(session({
  secret: process.env.ADMIN_SESSION_SECRET || 'nottingham-admin-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // 微信云托管使用false，如果是HTTPS则设为true
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// ==================== AdminJS配置 ====================
const admin = new AdminJS(adminOptions);

// 简单的认证配置
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      // 简单的硬编码认证（生产环境应该使用数据库）
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nottingham.com';
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return { email: ADMIN_EMAIL };
      }
      return null;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'nottingham-cookie-secret',
  },
  null,
  {
    resave: false,
    saveUninitialized: true,
    secret: process.env.ADMIN_SESSION_SECRET || 'nottingham-admin-secret-key',
  }
);

// AdminJS必须在body-parser之前
app.use(admin.options.rootPath, adminRouter);
console.log(`📊 AdminJS 已启动在 ${admin.options.rootPath}`);

// ==================== Body Parser ====================
// AdminJS之后才设置body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ==================== API路由 ====================
app.use("/api/auth", authRoutes);
app.use("/api/user", authRoutes);
app.use("/api/users", authRoutes); // 支持复数形式
app.use("/api/properties", propertyRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/favorites", favoriteRoutes);

// 健康检查
app.get("/", (req, res) => {
  res.json({
    code: 200,
    message: "Nottingham房源小程序API服务运行中",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    admin: {
      enabled: true,
      path: admin.options.rootPath
    }
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

const port = process.env.PORT || 80;

async function bootstrap() {
  try {
    console.log('=================================');
    console.log(`🚀 正在启动 Nottingham API 服务... (Deploy Trigger: ${new Date().toISOString()})`);
    console.log('=================================');

    // 先启动HTTP服务器（确保健康检查能通过）
    const server = app.listen(port, () => {
      console.log('✅ Nottingham API服务启动成功');
      console.log(`📡 端口: ${port}`);
      console.log(`🗄️  数据库: nottingham_db`);
      console.log(`📊 管理后台: http://localhost:${port}${admin.options.rootPath}`);
      console.log(`🚀 API文档: 参见 api.md`);
      console.log('=================================');
      console.log('🔐 管理员登录信息:');
      console.log(`   邮箱: ${process.env.ADMIN_EMAIL || 'admin@nottingham.com'}`);
      console.log(`   密码: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
      console.log('=================================');
    });

    // 然后初始化数据库（异步，不阻塞服务启动）
    initDB()
      .then(() => {
        console.log('✅ 数据库初始化完成，服务完全就绪');
      })
      .catch(error => {
        console.error('⚠️  数据库初始化失败，但服务继续运行:', error.message);
        console.error('请检查环境变量配置：MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS');
      });

  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

bootstrap();

// AdminJS后台管理系统 - 中间件顺序已优化