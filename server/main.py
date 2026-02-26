"""
PixelSurvivor Backend Server
提供排行榜和云存档API
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import hashlib
import json
from datetime import datetime
import os

app = FastAPI(title="PixelSurvivor API", version="1.0.0")

# 数据库路径
DB_PATH = "/data/pixelsurvivor.db"

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════
#  数据模型
# ═══════════════════════════════════════════════════════

class ScoreSubmit(BaseModel):
    player_id: str
    player_name: str
    mode: str  # endless, campaign
    level_index: Optional[int] = 0
    score: int
    kills: int
    level: int
    time: int
    achieved_at: str  # ISO format timestamp

class SaveData(BaseModel):
    player_id: str
    data: dict  # JSON data
    checksum: str  # MD5 of data for integrity

class ScoreResponse(BaseModel):
    rank: int
    player_id: str
    player_name: str
    mode: str
    level_index: Optional[int]
    score: int
    kills: int
    level: int
    time: int
    achieved_at: str

# ═══════════════════════════════════════════════════════
#  数据库初始化
# ═══════════════════════════════════════════════════════

def get_db():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化数据库表"""
    conn = get_db()
    cursor = conn.cursor()

    # 排行榜表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT NOT NULL,
            player_name TEXT NOT NULL,
            mode TEXT NOT NULL,
            level_index INTEGER DEFAULT 0,
            score INTEGER NOT NULL,
            kills INTEGER NOT NULL,
            level INTEGER NOT NULL,
            time INTEGER NOT NULL,
            achieved_at TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 云存档表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS saves (
            player_id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            checksum TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 索引优化查询
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_mode_level ON scores(mode, level_index, score DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id)")

    conn.commit()
    conn.close()

# 启动时初始化数据库
@app.on_event("startup")
def startup():
    os.makedirs("/data", exist_ok=True)
    init_db()

# ═══════════════════════════════════════════════════════
#  API密钥验证 (简单版本)
# ═══════════════════════════════════════════════════════

API_KEY = "pixel-survivor-2024-secret"

def verify_api_key(x_api_key: str = None):
    """验证API密钥"""
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

# ═══════════════════════════════════════════════════════
#  健康检查
# ═══════════════════════════════════════════════════════

@app.get("/health")
async def health():
    return {"status": "ok", "service": "pixelsurvivor", "version": "1.0.0"}

# ═══════════════════════════════════════════════════════
#  排行榜 API
# ═══════════════════════════════════════════════════════

@app.post("/api/scores/submit")
async def submit_score(score: ScoreSubmit, x_api_key: str = Header(None)):
    """提交分数到排行榜"""
    verify_api_key(x_api_key)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO scores (player_id, player_name, mode, level_index, score, kills, level, time, achieved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        score.player_id,
        score.player_name,
        score.mode,
        score.level_index,
        score.score,
        score.kills,
        score.level,
        score.time,
        score.achieved_at
    ))

    conn.commit()
    score_id = cursor.lastrowid
    conn.close()

    return {"success": True, "score_id": score_id}


@app.get("/api/scores/leaderboard", response_model=List[ScoreResponse])
async def get_leaderboard(
    mode: str = "endless",
    level_index: int = 0,
    limit: int = 100,
    offset: int = 0
):
    """获取排行榜"""
    conn = get_db()
    cursor = conn.cursor()

    if mode == "campaign":
        cursor.execute("""
            SELECT s.*, (
                SELECT COUNT(*) + 1 FROM scores s2
                WHERE s2.mode = ? AND s2.level_index = ? AND s2.score > s.score
            ) as rank
            FROM scores s
            WHERE s.mode = ? AND s.level_index = ?
            ORDER BY s.score DESC
            LIMIT ? OFFSET ?
        """, (mode, level_index, mode, level_index, limit, offset))
    else:
        cursor.execute("""
            SELECT s.*, (
                SELECT COUNT(*) + 1 FROM scores s2
                WHERE s2.mode = ? AND s2.score > s.score
            ) as rank
            FROM scores s
            WHERE s.mode = ?
            ORDER BY s.score DESC
            LIMIT ? OFFSET ?
        """, (mode, mode, limit, offset))

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "rank": row["rank"],
            "player_id": row["player_id"],
            "player_name": row["player_name"],
            "mode": row["mode"],
            "level_index": row["level_index"],
            "score": row["score"],
            "kills": row["kills"],
            "level": row["level"],
            "time": row["time"],
            "achieved_at": row["achieved_at"]
        }
        for row in rows
    ]


@app.get("/api/scores/player/{player_id}")
async def get_player_scores(player_id: str):
    """获取玩家的历史分数"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT mode, level_index, MAX(score) as best_score, MAX(kills) as best_kills,
               MAX(level) as best_level, MIN(time) as best_time
        FROM scores
        WHERE player_id = ?
        GROUP BY mode, level_index
    """, (player_id,))

    rows = cursor.fetchall()
    conn.close()

    return {
        "player_id": player_id,
        "best_scores": [
            {
                "mode": row["mode"],
                "level_index": row["level_index"],
                "best_score": row["best_score"],
                "best_kills": row["best_kills"],
                "best_level": row["best_level"],
                "best_time": row["best_time"]
            }
            for row in rows
        ]
    }


@app.get("/api/scores/rank/{player_id}")
async def get_player_rank(player_id: str, mode: str = "endless", level_index: int = 0):
    """获取玩家在指定模式的排名"""
    conn = get_db()
    cursor = conn.cursor()

    # 获取玩家最高分
    cursor.execute("""
        SELECT MAX(score) as max_score
        FROM scores
        WHERE player_id = ? AND mode = ? AND level_index = ?
    """, (player_id, mode, level_index))
    result = cursor.fetchone()

    if not result or not result["max_score"]:
        conn.close()
        return {"player_id": player_id, "rank": None, "score": None}

    max_score = result["max_score"]

    # 计算排名
    cursor.execute("""
        SELECT COUNT(*) + 1 as rank
        FROM scores
        WHERE mode = ? AND level_index = ? AND score > ?
    """, (mode, level_index, max_score))

    rank_result = cursor.fetchone()
    conn.close()

    return {
        "player_id": player_id,
        "mode": mode,
        "level_index": level_index,
        "rank": rank_result["rank"],
        "score": max_score
    }

# ═══════════════════════════════════════════════════════
#  云存档 API
# ═══════════════════════════════════════════════════════

@app.post("/api/saves/save")
async def save_game(save_data: SaveData, x_api_key: str = Header(None)):
    """保存游戏数据"""
    verify_api_key(x_api_key)

    # 验证校验和
    data_str = json.dumps(save_data.data, sort_keys=True)
    expected_checksum = hashlib.md5(data_str.encode()).hexdigest()
    if save_data.checksum != expected_checksum:
        raise HTTPException(status_code=400, detail="Checksum mismatch")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR REPLACE INTO saves (player_id, data, checksum, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    """, (save_data.player_id, json.dumps(save_data.data), save_data.checksum))

    conn.commit()
    conn.close()

    return {"success": True}


@app.get("/api/saves/load/{player_id}")
async def load_game(player_id: str):
    """加载游戏数据"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT data, checksum, updated_at
        FROM saves
        WHERE player_id = ?
    """, (player_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Save not found")

    return {
        "player_id": player_id,
        "data": json.loads(row["data"]),
        "updated_at": row["updated_at"]
    }


@app.delete("/api/saves/delete/{player_id}")
async def delete_save(player_id: str, x_api_key: str = Header(None)):
    """删除游戏存档"""
    verify_api_key(x_api_key)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM saves WHERE player_id = ?", (player_id,))
    conn.commit()
    conn.close()

    return {"success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
