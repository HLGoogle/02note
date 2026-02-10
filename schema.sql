-- 游戏排行榜表 (用于 02run - 逃出黑暗森林)
CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 为分数创建索引，优化排行榜查询速度
-- 优先按分数降序排列，分数相同时按时间升序（先达到该分数的排前面）
CREATE INDEX IF NOT EXISTS idx_rankings_score ON rankings (score DESC, created_at ASC);
