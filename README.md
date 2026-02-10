02Run & 逃出黑暗森林 (Cloudflare D1 版)
这是一个集成了 个人跑酷/记录系统 (02Run) 和 网页游戏 (逃出黑暗森林) 的全栈项目，完全运行在 Cloudflare 生态系统（Workers + D1 数据库）之上。
目录结构
/src/index.js: Cloudflare Worker 后端逻辑（处理游戏排行）。
/functions/api/: Cloudflare Pages 后端逻辑（处理数据接口）。
/index.html: 游戏前端页面（已关联 D1 排行榜）。
schema.sql: D1 数据库初始化 SQL 脚本。
wrangler.toml: Cloudflare 项目部署配置文件。
快速开始
1. 准备数据库
在 Cloudflare 控制台创建 D1 数据库，并根据 schema.sql 初始化表：
# 创建数据库
npx wrangler d1 create dark-forest-db

# 运行初始化脚本
npx wrangler d1 execute dark-forest-db --file=./schema.sql


2. 配置部署
编辑 wrangler.toml，填入你的 database_id。
3. 部署后端
npm install
npm run deploy


功能特性
游戏排行：实时保存玩家最高距离，自动展示 Top 50。
云端记录：支持 Markdown 内容存储、置顶功能及管理员删除保护（原 02Note 功能已整合为 02Run 核心）。

#  https://run.wow80.eu.cc/snow/snow
