-- 1. 游戏排行榜表 (用于 逃出黑暗森林)
CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 为分数创建索引，优化查询速度
CREATE INDEX IF NOT EXISTS idx_rankings_score ON rankings (score DESC);

-- 2. 笔记数据表 (用于 02note 笔记本功能)
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0, -- 0: 未置顶, 1: 已置顶
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 为置顶和时间创建复合索引
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes (is_pinned DESC, created_at DESC);
