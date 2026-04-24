# 宝宝成长记录系统 - 设计方案

## 1. 项目概述

为家庭打造的本地化成长记录系统，支持照片、视频、文字日记、成长数据、语音/视频留言的全方位记录。核心场景是"全家一起看"：家里电视/大屏浏览，出门在外手机随时访问，数据完全本地存储保障隐私。

## 2. 核心需求

| 需求 | 说明 |
|------|------|
| 多内容类型 | 照片、视频、文字日记、成长数据（身高/体重等）、语音/视频留言 |
| 多设备访问 | 手机、电视/浏览器、电脑、平板 |
| 家庭共享 | 多位家庭成员可查看和添加记录 |
| 完全本地存储 | 所有数据存储在家庭服务器，不依赖第三方云服务 |
| 远程访问 | 老人在外地也能安全访问 |
| 易于迁移 | 后续可无缝迁移到 NAS |

## 3. 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户设备层                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐   │
│  │ 手机    │  │ 电视    │  │ 电脑    │  │ 平板     │   │
│  │ (PWA)   │  │ (浏览器)│  │ (浏览器)│  │ (PWA)    │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬─────┘   │
│       └──────────────┴────────────┴─────────────┘        │
│                       Tailscale                          │
│                    （虚拟局域网）                          │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   家庭服务器（闲置电脑）                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │              本地 Web 服务 (PWA)                  │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │   │
│  │  │ 照片   │ │ 视频   │ │ 日记   │ │ 成长数据 │  │   │
│  │  │ 管理   │ │ 播放   │ │ 编辑器 │ │ 统计     │  │   │
│  │  └────────┘ └────────┘ └────────┘ └──────────┘  │   │
│  │  ┌────────┐ ┌────────┐ ┌──────────────────────┐  │   │
│  │  │ 时间线 │ │ 里程碑 │ │ 语音/视频留言        │  │   │
│  │  └────────┘ └────────┘ └──────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                      SQLite 数据库                        │
│                   本地文件系统存储                         │
└─────────────────────────────────────────────────────────┘
```

## 4. 技术栈

| 层级 | 技术 | 版本/说明 |
|------|------|-----------|
| 前端框架 | React | 18.x |
| 构建工具 | Vite | 5.x |
| UI 组件 | shadcn/ui | 基于 Radix UI + Tailwind CSS |
| 样式 | Tailwind CSS | 3.x |
| PWA | vite-plugin-pwa | 支持 Service Worker、离线缓存、添加到桌面 |
| 状态管理 | Zustand | 轻量状态管理 |
| 路由 | React Router | v6 |
| 后端框架 | Express.js | 4.x |
| ORM | Prisma | 5.x |
| 数据库 | SQLite | 文件型，单文件备份 |
| 文件上传 | Multer | Express 中间件 |
| 内网穿透 | Tailscale | 虚拟组网，零配置 |

## 5. 数据库设计

### 5.1 数据模型

```prisma
// Record 是统一入口，所有内容类型共享基础字段
model Record {
  id          String    @id @default(cuid())
  type        RecordType
  title       String?
  content     String?   // 纯文本摘要或日记正文
  recordDate  DateTime  // 事件发生的日期（用户可编辑）
  tags        String?   // 逗号分隔的标签
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   String    // 创建者名称（简化权限）

  photo       Photo?
  video       Video?
  diary       Diary?
  milestone   Milestone?
  voiceMessage VoiceMessage?
}

enum RecordType {
  PHOTO
  VIDEO
  DIARY
  MILESTONE
  VOICE_MESSAGE
}

model Photo {
  id           String   @id @default(cuid())
  recordId     String   @unique
  record       Record   @relation(fields: [recordId], references: [id])
  originalPath String   // 原图路径
  thumbPath    String   // 缩略图路径
  width        Int?
  height       Int?
  fileSize     Int?
  location     String?  // 拍摄地点
}

model Video {
  id           String   @id @default(cuid())
  recordId     String   @unique
  record       Record   @relation(fields: [recordId], references: [id])
  filePath     String
  thumbPath    String   // 视频封面
  duration     Int      // 秒
  fileSize     Int?
}

model Diary {
  id           String   @id @default(cuid())
  recordId     String   @unique
  record       Record   @relation(fields: [recordId], references: [id])
  weather      String?  // 天气
  mood         String?  // 心情
}

model Milestone {
  id           String   @id @default(cuid())
  recordId     String   @unique
  record       Record   @relation(fields: [recordId], references: [id])
  category     String   // 运动、语言、认知、社交等
}

model VoiceMessage {
  id           String   @id @default(cuid())
  recordId     String   @unique
  record       Record   @relation(fields: [recordId], references: [id])
  filePath     String
  duration     Int      // 秒
  fromWho      String   // 留言人
  toWho        String   // 给谁的留言
}

// 成长数据独立表，不通过 Record 关联（是定期记录，不是事件）
model GrowthData {
  id               String   @id @default(cuid())
  date             DateTime
  height           Float?   // cm
  weight           Float?   // kg
  headCircumference Float?  // cm
  note             String?
  createdAt        DateTime @default(now())
}
```

### 5.2 文件存储结构

```
data/
├── db/
│   └── baby.db              # SQLite 数据库文件
└── uploads/
    ├── photos/
    │   └── 2026/
    │       └── 04/
    │           └── 24/
    │               ├── xxxxxx.jpg      # 原图
    │               └── xxxxxx-thumb.jpg # 缩略图
    ├── videos/
    │   └── 2026/
    │       └── 04/
    │           └── 24/
    │               ├── xxxxxx.mp4
    │               └── xxxxxx-thumb.jpg
    └── voices/
        └── 2026/
            └── 04/
                └── 24/
                    └── xxxxxx.mp3
```

按 `YYYY/MM/DD` 分目录，便于手动浏览和备份。

## 6. 前端页面设计

### 6.1 页面清单

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页/时间线 | `/` | 按时间倒序展示所有记录，支持按类型筛选 |
| 相册 | `/gallery` | 照片/视频网格浏览，支持标签筛选 |
| 写日记 | `/diary/new` | 图文日记编辑器 |
| 成长数据 | `/growth` | 数据录入 + 生长曲线图 |
| 里程碑 | `/milestones` | 里程碑列表与新增 |
| 留言板 | `/messages` | 语音/视频留言列表与录制 |
| 大屏模式 | `/bigscreen` | 全屏自动轮播，适配电视 |
| 设置 | `/settings` | 数据备份/恢复、关于 |

### 6.2 核心交互

**首页时间线**
- 瀑布流/卡片列表展示记录
- 顶部快速筛选：全部 | 照片 | 视频 | 日记 | 里程碑 | 留言
- 点击卡片进入详情页
- 右下角悬浮"+"按钮快速添加

**相册**
- 响应式网格布局（手机 2 列，平板 3 列，电脑 4 列）
- 点击照片进入 Lightbox 浏览，支持左右滑动
- 支持按日期范围、标签筛选

**写日记**
- 标题 + 富文本正文（支持 Markdown）
- 可关联当天已上传的照片
- 天气、心情快捷选择

**成长数据**
- 表单录入身高/体重/头围
- 折线图展示生长趋势（对比 WHO 标准曲线）
- 支持录入历史数据

**大屏模式**
- 自动全屏，隐藏所有 UI 控件
- 间隔 5 秒轮播照片
- 底部显示日期和标题
- 按任意键/点击退出

## 7. API 设计

### 7.1 REST API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/records` | 获取记录列表（支持 type、date、tag 筛选）|
| GET | `/api/records/:id` | 获取单条记录详情 |
| POST | `/api/records` | 创建记录（照片/视频需先上传文件）|
| PUT | `/api/records/:id` | 更新记录 |
| DELETE | `/api/records/:id` | 删除记录 |
| POST | `/api/upload/photo` | 上传照片（返回文件路径）|
| POST | `/api/upload/video` | 上传视频 |
| POST | `/api/upload/voice` | 上传语音/视频留言 |
| GET | `/api/growth` | 获取成长数据列表 |
| POST | `/api/growth` | 录入成长数据 |
| PUT | `/api/growth/:id` | 更新成长数据 |
| DELETE | `/api/growth/:id` | 删除成长数据 |
| GET | `/api/stats` | 获取统计信息（总照片数、视频数等）|

### 7.2 文件上传响应

```json
{
  "success": true,
  "filePath": "/uploads/photos/2026/04/24/xxxxxx.jpg",
  "thumbPath": "/uploads/photos/2026/04/24/xxxxxx-thumb.jpg",
  "originalName": "IMG_1234.jpg"
}
```

## 8. PWA 配置

- **Service Worker**：缓存静态资源，支持离线浏览已加载内容
- **Web App Manifest**：名称、图标、主题色，支持"添加到主屏幕"
- **离线策略**：
  - 静态资源：Cache First
  - API 数据：Network First，失败时回退缓存
  - 新上传内容：队列机制，离线时暂存，联网后自动同步

## 9. 部署与访问

### 9.1 部署流程

1. 在闲置电脑上克隆项目
2. 安装 Node.js 依赖（前端 + 后端）
3. 运行 `npx prisma migrate dev` 初始化数据库
4. 启动服务：`npm run start`（同时启动前端构建和后端服务）
5. 服务监听 `0.0.0.0:3000`

### 9.2 内网访问
- 同网络设备直接访问 `http://<服务器IP>:3000`

### 9.3 外网访问（Tailscale）
1. 在服务器和移动设备上安装 Tailscale
2. 使用同一账号登录
3. 通过 Tailscale 分配的虚拟 IP（如 `http://100.x.x.x:3000`）访问
4. 无需公网 IP，无需端口映射，流量端到端加密

### 9.4 电视访问
- 电视浏览器打开内网地址
- 或使用投屏功能将手机/Pad 内容投到电视

## 10. 数据备份与迁移

### 10.1 备份
- 数据库：直接复制 `data/db/baby.db` 文件
- 文件：复制整个 `data/uploads/` 目录
- 可通过设置页面一键导出压缩包

### 10.2 迁移到 NAS
1. 复制 `data/` 目录到 NAS
2. 在 NAS 上安装 Node.js 或直接运行 Docker 镜像
3. 修改数据目录路径配置
4. 启动服务

## 11. 安全与权限

**当前阶段（MVP）简化设计：**
- 无登录系统，通过家庭局域网/Tailscale 虚拟网络控制访问
- 创建记录时填写创建者名称，用于标识
- 后续可扩展：简单密码保护、基于角色的权限管理

## 12. 开发阶段规划

### MVP（第一阶段）
- [ ] 项目脚手架搭建（React + Express + Prisma + SQLite）
- [ ] 照片上传与浏览（含缩略图生成）
- [ ] 时间线首页（瀑布流展示）
- [ ] 写日记（纯文本 + 关联照片，MVP 阶段暂不支持 Markdown）
- [ ] PWA 基础配置（离线访问、添加到桌面）
- [ ] Tailscale 访问验证

### 第二阶段
- [ ] 视频上传与播放
- [ ] 相册网格浏览 + Lightbox
- [ ] 里程碑功能
- [ ] 语音/视频留言

### 第三阶段
- [ ] 成长数据录入与曲线图
- [ ] 大屏模式（电视适配）
- [ ] 数据导出/备份功能
- [ ] 多宝宝支持
- [ ] 搜索与高级筛选

## 13. 项目结构

```
baby/
├── apps/
│   ├── web/                  # React 前端
│   │   ├── src/
│   │   │   ├── components/   # 公共组件
│   │   │   ├── pages/        # 页面组件
│   │   │   ├── stores/       # Zustand 状态
│   │   │   ├── api/          # API 请求封装
│   │   │   └── utils/        # 工具函数
│   │   ├── public/
│   │   └── package.json
│   └── server/               # Express 后端
│       ├── src/
│       │   ├── routes/       # API 路由
│       │   ├── services/     # 业务逻辑
│       │   ├── utils/        # 工具函数
│       │   └── app.js        # 入口
│       ├── prisma/
│       │   └── schema.prisma # 数据库模型
│       └── package.json
├── data/                     # 运行时数据（gitignore）
│   ├── db/
│   └── uploads/
└── package.json              # 根目录 workspace 配置
```

---

*设计日期：2026-04-24*
*版本：v1.0*
