# PixelSurvivor - 像素幸存者

一款基于Web的像素风格生存割草游戏，使用Phaser 3引擎开发。

![Version](https://img.shields.io/badge/version-1.1-green)
![Phaser](https://img.shields.io/badge/Phaser-3.60-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 游戏特色

- **像素艺术风格** - 纯代码生成所有图形，无需外部素材
- **多种武器系统** - 魔法弹、飞刀、火球、闪电、大蒜光环、旋转斧
- **技能升级** - 升级时三选一随机技能/被动
- **两种游戏模式** - 关卡模式（5个关卡）+ 无尽模式
- **移动端支持** - 虚拟摇杆控制，适配手机竖屏
- **音效系统** - Web Audio API合成音效，可开关

## 在线体验

游戏部署在 Docker 端口 **8082**

## 本地运行

### 方法1: 直接打开
```bash
cd game
python -m http.server 8082
# 浏览器访问 http://localhost:8082
```

### 方法2: Docker部署
```bash
docker build -t pixel-survivor .
docker run -d -p 8082:80 --name pixel-survivor pixel-survivor
```

## 游戏操作

### 键盘
- `WASD` 或 `方向键` - 移动
- `ESC` - 暂停游戏

### 触屏
- 左下角虚拟摇杆 - 移动
- 右上角暂停按钮 - 暂停游戏

## 游戏说明

详见 [游戏说明书](MANUAL.md)

## 项目结构

```
game/
├── index.html           # 入口文件
└── src/
    ├── main.js          # Phaser初始化
    ├── config.js        # 全局配置常量
    ├── data/            # 游戏数据
    │   ├── skills.js    # 武器/技能定义
    │   ├── enemies.js   # 敌人类型定义
    │   └── levels.js    # 关卡配置
    ├── entities/        # 游戏实体
    │   ├── Player.js
    │   ├── Enemy.js
    │   └── ExpOrb.js
    ├── scenes/          # 场景
    │   ├── BootScene.js
    │   ├── MenuScene.js
    │   ├── GameScene.js
    │   ├── LevelUpScene.js
    │   ├── PauseScene.js
    │   └── GameOverScene.js
    ├── weapons/         # 武器系统
    │   ├── BaseWeapon.js
    │   ├── MagicBolt.js
    │   ├── ThrowingKnife.js
    │   ├── Fireball.js
    │   ├── Lightning.js
    │   ├── GarlicAura.js
    │   └── RotatingAxe.js
    └── systems/         # 系统模块
        ├── SkillSystem.js
        ├── WaveSystem.js
        ├── ObjectPool.js
        └── SettingsManager.js
```

## 技术栈

- **Phaser 3.60** - 游戏引擎
- **nipplejs** - 虚拟摇杆
- **ES Modules** - 纯JavaScript模块化
- **Web Audio API** - 音效合成
- **localStorage** - 设置持久化

## 更新日志

### v1.1 (2026-02-26)
- 性能优化：对象池系统、敌人HP条优化、碰撞检测优化
- 游戏体验：音效开关、摇杆位置设置
- 代码质量：提取配置常量

### v1.0
- 初始版本发布
- 完整游戏流程实现

## 开源协议

MIT License
