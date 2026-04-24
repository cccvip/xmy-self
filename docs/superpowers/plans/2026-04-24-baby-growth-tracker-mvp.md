# 宝宝成长记录系统 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个本地部署的宝宝成长记录系统 MVP，支持照片上传/浏览、日记撰写、时间线展示、PWA 离线访问，所有数据存储在家庭服务器上。

**Architecture:** 前端 React + Vite PWA，后端 Express + Prisma + SQLite，照片按日期目录存储并生成缩略图，通过 Tailscale 实现安全的远程访问。

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, shadcn/ui, Zustand, React Router 6, Express 4, Prisma 5, SQLite, Multer, sharp, Tailscale

---

## 文件结构

```
baby/
├── package.json                  # 根 workspace，npm workspaces
├── .gitignore
├── data/                         # 运行时数据 (gitignored)
│   ├── db/
│   └── uploads/
│       ├── photos/
│       └── thumbs/
├── apps/
│   ├── web/                      # React 前端
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   ├── public/
│   │   │   └── manifest.json     # PWA manifest
│   │   └── src/
│   │       ├── main.jsx
│   │       ├── App.jsx
│   │       ├── index.css
│   │       ├── api/
│   │       │   └── client.js     # API 请求封装
│   │       ├── stores/
│   │       │   └── recordStore.js # Zustand 状态
│   │       ├── components/
│   │       │   ├── Layout.jsx    # 导航布局
│   │       │   ├── Timeline.jsx  # 时间线列表
│   │       │   ├── PhotoCard.jsx # 照片卡片
│   │       │   ├── PhotoUploader.jsx # 上传组件
│   │       │   └── DiaryEditor.jsx   # 日记编辑器
│   │       └── pages/
│   │           ├── HomePage.jsx
│   │           ├── GalleryPage.jsx
│   │           ├── DiaryPage.jsx
│   │           └── SettingsPage.jsx
│   └── server/                   # Express 后端
│       ├── package.json
│       ├── .env
│       ├── prisma/
│       │   └── schema.prisma
│       └── src/
│           ├── app.js            # 入口
│           ├── routes/
│           │   ├── records.js    # 记录 CRUD
│           │   └── uploads.js    # 文件上传
│           └── utils/
│               └── thumbnail.js  # 缩略图生成
```

---

## Task 1: 根目录 Workspace 配置

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `data/db/.gitkeep`
- Create: `data/uploads/photos/.gitkeep`
- Create: `data/uploads/thumbs/.gitkeep`

- [ ] **Step 1: 创建根 package.json**

```json
{
  "name": "baby-growth-tracker",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/server\" \"npm run dev -w apps/web\"",
    "build": "npm run build -w apps/web && npm run build -w apps/server",
    "start": "npm run start -w apps/server"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: 创建 .gitignore**

```
node_modules/
data/db/*
!data/db/.gitkeep
data/uploads/*
!data/uploads/photos/
!data/uploads/photos/.gitkeep
!data/uploads/thumbs/
!data/uploads/thumbs/.gitkeep
.env
*.log
dist/
```

- [ ] **Step 3: 创建目录占位文件**

Run: `mkdir -p data/db data/uploads/photos data/uploads/thumbs apps/web/src apps/server/src`

- [ ] **Step 4: Commit**

```bash
git init
git add package.json .gitignore data/
git commit -m "chore: init workspace structure"
```

---

## Task 2: 后端 Express + Prisma 初始化

**Files:**
- Create: `apps/server/package.json`
- Create: `apps/server/.env`
- Create: `apps/server/prisma/schema.prisma`

- [ ] **Step 1: 创建后端 package.json**

```json
{
  "name": "baby-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "cors": "^2.8.5",
    "express": "^4.18.3",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "prisma": "^5.10.0"
  }
}
```

- [ ] **Step 2: 创建 .env**

```env
DATABASE_URL="file:../../data/db/baby.db"
UPLOAD_DIR="../../data/uploads"
PORT=3000
```

- [ ] **Step 3: 创建 Prisma schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Record {
  id         String     @id @default(cuid())
  type       RecordType
  title      String?
  content    String?
  recordDate DateTime
  tags       String?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  createdBy  String     @default("爸爸")

  photo Photo?
}

enum RecordType {
  PHOTO
  VIDEO
  DIARY
  MILESTONE
  VOICE_MESSAGE
}

model Photo {
  id           String @id @default(cuid())
  recordId     String @unique
  record       Record @relation(fields: [recordId], references: [id], onDelete: Cascade)
  originalPath String
  thumbPath    String
  width        Int?
  height       Int?
  fileSize     Int?
}
```

- [ ] **Step 4: 安装依赖并初始化数据库**

Run: `cd apps/server && npm install && npx prisma db push`

Expected: Prisma Client 生成成功，SQLite 数据库文件创建在 `data/db/baby.db`。

- [ ] **Step 5: Commit**

```bash
git add apps/server/
git commit -m "chore: init express server with prisma"
```

---

## Task 3: Express 入口与基础中间件

**Files:**
- Create: `apps/server/src/app.js`
- Create: `apps/server/src/routes/records.js`
- Create: `apps/server/src/routes/uploads.js`

- [ ] **Step 1: 创建入口 app.js**

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const recordsRouter = require('./routes/records');
const uploadsRouter = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 静态文件（上传的照片和缩略图）
app.use('/uploads', express.static(path.join(__dirname, '../../data/uploads')));

// API 路由
app.use('/api/records', recordsRouter);
app.use('/api/upload', uploadsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

- [ ] **Step 2: 创建记录路由框架**

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/records - 获取记录列表
router.get('/', async (req, res) => {
  const { type } = req.query;
  const where = type ? { type } : {};
  const records = await prisma.record.findMany({
    where,
    orderBy: { recordDate: 'desc' },
    include: { photo: true },
  });
  res.json(records);
});

// GET /api/records/:id - 获取单条记录
router.get('/:id', async (req, res) => {
  const record = await prisma.record.findUnique({
    where: { id: req.params.id },
    include: { photo: true },
  });
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
});

// POST /api/records - 创建记录
router.post('/', async (req, res) => {
  const { type, title, content, recordDate, tags, createdBy, photoId } = req.body;
  const record = await prisma.record.create({
    data: {
      type,
      title,
      content,
      recordDate: new Date(recordDate),
      tags,
      createdBy,
      ...(photoId && {
        photo: { connect: { id: photoId } },
      }),
    },
    include: { photo: true },
  });
  res.status(201).json(record);
});

// PUT /api/records/:id - 更新记录
router.put('/:id', async (req, res) => {
  const { title, content, recordDate, tags } = req.body;
  const record = await prisma.record.update({
    where: { id: req.params.id },
    data: {
      title,
      content,
      recordDate: recordDate ? new Date(recordDate) : undefined,
      tags,
    },
    include: { photo: true },
  });
  res.json(record);
});

// DELETE /api/records/:id - 删除记录
router.delete('/:id', async (req, res) => {
  await prisma.record.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
```

- [ ] **Step 3: 创建上传路由框架**

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, '../../data/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const today = new Date();
    const dir = path.join(UPLOAD_DIR, 'photos', String(today.getFullYear()), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0'));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

router.post('/photo', upload.single('photo'), (req, res) => {
  res.json({
    success: true,
    originalName: req.file.originalname,
    filePath: req.file.path.replace(UPLOAD_DIR, '/uploads').replace(/\\/g, '/'),
  });
});

module.exports = router;
```

- [ ] **Step 4: 启动后端测试**

Run: `cd apps/server && npm run dev`

然后新终端测试：
Run: `curl http://localhost:3000/api/health`

Expected: `{"status":"ok","time":"..."}`

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/
git commit -m "feat: express app with records and upload routes"
```

---

## Task 4: 照片上传与缩略图生成

**Files:**
- Create: `apps/server/src/utils/thumbnail.js`
- Modify: `apps/server/src/routes/uploads.js`

- [ ] **Step 1: 创建缩略图工具**

```javascript
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.resolve(__dirname, '../../data/uploads');

async function generateThumbnail(originalPath, width = 400) {
  const relativePath = originalPath.replace('/uploads/', '');
  const fullOriginal = path.join(UPLOAD_DIR, relativePath);

  const dir = path.dirname(fullOriginal).replace('/photos/', '/thumbs/');
  fs.mkdirSync(dir, { recursive: true });

  const filename = path.basename(fullOriginal, path.extname(fullOriginal)) + '-thumb.jpg';
  const thumbPath = path.join(dir, filename);

  await sharp(fullOriginal)
    .resize(width, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);

  return '/uploads/' + path.relative(UPLOAD_DIR, thumbPath).replace(/\\/g, '/');
}

module.exports = { generateThumbnail };
```

- [ ] **Step 2: 更新上传路由**

替换 `apps/server/src/routes/uploads.js` 中 `router.post('/photo', ...)` 的处理逻辑：

```javascript
const { generateThumbnail } = require('../utils/thumbnail');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ... 保留上面的 storage 配置 ...

router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    const filePath = req.file.path.replace(UPLOAD_DIR, '/uploads').replace(/\\/g, '/');
    const thumbPath = await generateThumbnail(filePath, 400);

    const photo = await prisma.photo.create({
      data: {
        originalPath: filePath,
        thumbPath: thumbPath,
        fileSize: req.file.size,
      },
    });

    res.json({
      success: true,
      photoId: photo.id,
      filePath,
      thumbPath,
      originalName: req.file.originalname,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

- [ ] **Step 3: 测试上传 API**

准备一个测试图片 `test.jpg`，然后：

Run: `curl -X POST -F "photo=@test.jpg" http://localhost:3000/api/upload/photo`

Expected: JSON 返回包含 `photoId`, `filePath`, `thumbPath`。

验证文件存在：
Run: `ls data/uploads/photos/2026/04/24/` 和 `ls data/uploads/thumbs/2026/04/24/`

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/
git commit -m "feat: photo upload with thumbnail generation"
```

---

## Task 5: 前端 React + Vite 初始化

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/vite.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.jsx`
- Create: `apps/web/src/App.jsx`
- Create: `apps/web/src/index.css`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`

- [ ] **Step 1: 创建前端 package.json**

```json
{
  "name": "baby-web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4",
    "vite-plugin-pwa": "^0.19.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '宝宝成长记录',
        short_name: '成长记录',
        description: '记录宝宝每一个成长瞬间',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: 创建 Tailwind 配置**

`tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

`postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: 创建入口文件**

`index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>宝宝成长记录</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

`src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8fafc;
}
```

`src/App.jsx`:

```jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import DiaryPage from './pages/DiaryPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
```

- [ ] **Step 5: 安装依赖并启动**

Run: `cd apps/web && npm install && npm run dev`

浏览器访问 `http://localhost:5173`，Expected: 页面正常显示，无报错。

- [ ] **Step 6: Commit**

```bash
git add apps/web/
git commit -m "chore: init react frontend with vite, tailwind, pwa"
```

---

## Task 6: API 客户端与状态管理

**Files:**
- Create: `apps/web/src/api/client.js`
- Create: `apps/web/src/stores/recordStore.js`

- [ ] **Step 1: 创建 API 客户端**

```javascript
const API_BASE = '';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getRecords: (type) => request(`/api/records${type ? `?type=${type}` : ''}`),
  getRecord: (id) => request(`/api/records/${id}`),
  createRecord: (data) => request('/api/records', { method: 'POST', body: JSON.stringify(data) }),
  updateRecord: (id, data) => request(`/api/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecord: (id) => request(`/api/records/${id}`, { method: 'DELETE' }),
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('photo', file);
    return fetch('/api/upload/photo', { method: 'POST', body: form }).then(r => r.json());
  },
};
```

- [ ] **Step 2: 创建 Zustand Store**

```javascript
import { create } from 'zustand';
import { api } from '../api/client';

export const useRecordStore = create((set, get) => ({
  records: [],
  loading: false,
  error: null,

  fetchRecords: async (type) => {
    set({ loading: true, error: null });
    try {
      const records = await api.getRecords(type);
      set({ records, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addRecord: async (data) => {
    const record = await api.createRecord(data);
    set({ records: [record, ...get().records] });
    return record;
  },

  removeRecord: async (id) => {
    await api.deleteRecord(id);
    set({ records: get().records.filter(r => r.id !== id) });
  },
}));
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/api apps/web/src/stores
git commit -m "feat: api client and zustand store"
```

---

## Task 7: 布局导航组件

**Files:**
- Create: `apps/web/src/components/Layout.jsx`

- [ ] **Step 1: 创建 Layout 组件**

```jsx
import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">👶 宝宝成长记录</h1>
          <nav className="flex gap-1">
            <NavLink to="/" className={navClass}>时间线</NavLink>
            <NavLink to="/gallery" className={navClass}>相册</NavLink>
            <NavLink to="/diary" className={navClass}>写日记</NavLink>
            <NavLink to="/settings" className={navClass}>设置</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 验证导航**

浏览器访问 `http://localhost:5173`，点击各个导航链接，Expected: URL 切换，高亮状态正确。

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Layout.jsx
git commit -m "feat: add navigation layout"
```

---

## Task 8: 时间线首页

**Files:**
- Create: `apps/web/src/pages/HomePage.jsx`
- Create: `apps/web/src/components/PhotoCard.jsx`

- [ ] **Step 1: 创建 PhotoCard 组件**

```jsx
export default function PhotoCard({ record }) {
  const photo = record.photo;
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {photo && (
        <img
          src={photo.thumbPath}
          alt={record.title || '照片'}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
            {record.type === 'PHOTO' ? '照片' : record.type === 'DIARY' ? '日记' : record.type}
          </span>
          <span className="text-xs text-gray-400">{record.createdBy}</span>
        </div>
        {record.title && (
          <h3 className="font-semibold text-gray-800 mb-1">{record.title}</h3>
        )}
        {record.content && (
          <p className="text-sm text-gray-600 line-clamp-2">{record.content}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(record.recordDate).toLocaleDateString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 HomePage**

```jsx
import { useEffect } from 'react';
import { useRecordStore } from '../stores/recordStore';
import PhotoCard from '../components/PhotoCard';

export default function HomePage() {
  const { records, loading, fetchRecords } = useRecordStore();

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {['全部', '照片', '日记'].map((label) => (
          <button
            key={label}
            onClick={() => fetchRecords(label === '全部' ? '' : label === '照片' ? 'PHOTO' : 'DIARY')}
            className="px-3 py-1.5 text-sm rounded-full bg-white border hover:bg-gray-50"
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-center py-8">加载中...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {records.map((record) => (
          <PhotoCard key={record.id} record={record} />
        ))}
      </div>

      {!loading && records.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📸</p>
          <p>还没有记录，去上传第一张照片吧！</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 验证时间线**

确保后端运行中（端口 3000），前端 dev server（端口 5173）已启动。通过前面 Task 4 上传的测试照片数据应该能在时间线中显示。

浏览器访问 `http://localhost:5173/`，Expected: 看到上传的测试照片卡片，包含缩略图、标题、日期。

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/HomePage.jsx apps/web/src/components/PhotoCard.jsx
git commit -m "feat: timeline homepage with photo cards"
```

---

## Task 9: 照片上传组件

**Files:**
- Create: `apps/web/src/components/PhotoUploader.jsx`
- Modify: `apps/web/src/pages/HomePage.jsx`

- [ ] **Step 1: 创建 PhotoUploader 组件**

```jsx
import { useState, useRef } from 'react';
import { api } from '../api/client';
import { useRecordStore } from '../stores/recordStore';

export default function PhotoUploader() {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const addRecord = useRecordStore((s) => s.addRecord);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const upload = await api.uploadPhoto(file);
      await addRecord({
        type: 'PHOTO',
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: '',
        recordDate: new Date().toISOString(),
        photoId: upload.photoId,
      });
    } catch (err) {
      alert('上传失败: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          Array.from(e.target.files).forEach(handleFile);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center text-2xl disabled:opacity-60"
      >
        {uploading ? '⏳' : '+'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 在 HomePage 中添加悬浮上传按钮**

修改 `apps/web/src/pages/HomePage.jsx`，在 `return` 的 `div` 最外层末尾添加：

```jsx
import PhotoUploader from '../components/PhotoUploader';

// ... 在 return 的最后添加 ...
<PhotoUploader />
```

- [ ] **Step 3: 测试上传**

点击右下角的 `+` 按钮，选择一张图片。Expected: 上传完成后，时间线自动刷新，新照片出现在列表顶部。

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/PhotoUploader.jsx apps/web/src/pages/HomePage.jsx
git commit -m "feat: floating photo upload button"
```

---

## Task 10: 写日记页面

**Files:**
- Create: `apps/web/src/components/DiaryEditor.jsx`
- Create: `apps/web/src/pages/DiaryPage.jsx`

- [ ] **Step 1: 创建 DiaryEditor 组件**

```jsx
import { useState } from 'react';
import { useRecordStore } from '../stores/recordStore';

export default function DiaryEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const addRecord = useRecordStore((s) => s.addRecord);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await addRecord({
        type: 'DIARY',
        title: title.trim() || undefined,
        content: content.trim(),
        recordDate: new Date().toISOString(),
      });
      setTitle('');
      setContent('');
      alert('日记保存成功！');
    } catch (err) {
      alert('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">写日记</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题（可选）</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="今天的主题..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记录今天发生的趣事..."
            rows={8}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '保存中...' : '保存日记'}
          </button>
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: 创建 DiaryPage**

```jsx
import DiaryEditor from '../components/DiaryEditor';

export default function DiaryPage() {
  return (
    <div className="max-w-xl mx-auto">
      <DiaryEditor />
    </div>
  );
}
```

- [ ] **Step 3: 测试写日记**

浏览器访问 `http://localhost:5173/diary`，填写标题和内容，点击保存。Expected: 提示"日记保存成功"，切换到时间线页面能看到新日记卡片。

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/DiaryEditor.jsx apps/web/src/pages/DiaryPage.jsx
git commit -m "feat: diary editor page"
```

---

## Task 11: 相册浏览页面

**Files:**
- Create: `apps/web/src/pages/GalleryPage.jsx`

- [ ] **Step 1: 创建 GalleryPage**

```jsx
import { useEffect } from 'react';
import { useRecordStore } from '../stores/recordStore';

export default function GalleryPage() {
  const { records, loading, fetchRecords } = useRecordStore();

  useEffect(() => {
    fetchRecords('PHOTO');
  }, []);

  const photos = records.filter((r) => r.type === 'PHOTO' && r.photo);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">相册</h2>
      {loading && <p className="text-gray-400 text-center py-8">加载中...</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((record) => (
          <div key={record.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={record.photo.thumbPath}
              alt={record.title || '照片'}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      {!loading && photos.length === 0 && (
        <p className="text-center py-16 text-gray-400">暂无照片</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证相册**

浏览器访问 `http://localhost:5173/gallery`，Expected: 只显示照片类型的记录，网格布局，hover 有放大效果。

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/GalleryPage.jsx
git commit -m "feat: gallery page with photo grid"
```

---

## Task 12: 设置页面与数据备份

**Files:**
- Create: `apps/web/src/pages/SettingsPage.jsx`

- [ ] **Step 1: 创建 SettingsPage**

```jsx
export default function SettingsPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">设置</h2>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-3">关于</h3>
        <p className="text-sm text-gray-600">
          宝宝成长记录 v1.0
        </p>
        <p className="text-sm text-gray-500 mt-1">
          所有数据存储在本地服务器，不依赖任何云服务。
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-3">数据备份</h3>
        <p className="text-sm text-gray-600 mb-3">
          数据库文件位于 <code className="bg-gray-100 px-1 rounded">data/db/baby.db</code>，上传文件位于 <code className="bg-gray-100 px-1 rounded">data/uploads/</code>。
        </p>
        <p className="text-sm text-gray-500">
          直接复制这些目录即可完成备份。迁移到 NAS 时，将整个 <code className="bg-gray-100 px-1 rounded">data/</code> 目录复制到新服务器即可。
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-800 mb-3">远程访问</h3>
        <p className="text-sm text-gray-600">
          建议使用 <strong>Tailscale</strong> 实现安全的远程访问：
        </p>
        <ol className="text-sm text-gray-600 mt-2 ml-4 list-decimal space-y-1">
          <li>在服务器和手机上安装 Tailscale</li>
          <li>使用同一账号登录</li>
          <li>通过虚拟 IP 访问本系统</li>
        </ol>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/SettingsPage.jsx
git commit -m "feat: settings page with backup info"
```

---

## Task 13: 构建与生产部署

**Files:**
- Modify: `apps/server/src/app.js`
- Modify: `apps/server/package.json`
- Modify: `apps/web/package.json`
- Modify: `package.json`

- [ ] **Step 1: 配置后端静态文件服务**

修改 `apps/server/src/app.js`，在 `app.listen` 之前添加：

```javascript
const path = require('path');

// 生产环境提供前端静态文件
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

注意：确保这段代码在 API 路由之后添加。

- [ ] **Step 2: 配置前端构建输出目录**

修改 `apps/web/vite.config.js`，在 `defineConfig` 中添加：

```javascript
export default defineConfig({
  build: {
    outDir: '../server/dist',
    emptyOutDir: true,
  },
  // ... 保留现有配置
});
```

- [ ] **Step 3: 更新根 package.json 启动脚本**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/server\" \"npm run dev -w apps/web\"",
    "build": "npm run build -w apps/web",
    "start": "npm run start -w apps/server"
  }
}
```

- [ ] **Step 4: 测试生产构建**

Run: `npm run build`

Expected: 前端构建到 `apps/server/dist/` 目录。

Run: `cd apps/server && npm start`

浏览器访问 `http://localhost:3000/`，Expected: 页面正常加载，API 和图片都能正常访问。

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/app.js apps/web/vite.config.js package.json
git commit -m "chore: production build setup"
```

---

## Task 14: Tailscale 访问验证

**Files:**
- 无新增文件，纯验证步骤

- [ ] **Step 1: 安装 Tailscale**

在闲置电脑（服务器）上：
Run: `winget install tailscale`
或访问 https://tailscale.com/download 下载安装。

- [ ] **Step 2: 启动 Tailscale 并登录**

Run: `tailscale up`

按提示用 Google/Microsoft/GitHub 账号登录。Expected: 显示 "Success" 和分配的虚拟 IP（如 100.x.x.x）。

- [ ] **Step 3: 在其他设备安装 Tailscale**

在手机/平板上安装 Tailscale App，用同一账号登录。

- [ ] **Step 4: 验证远程访问**

确保后端以生产模式运行：`cd apps/server && npm start`

在手机上打开浏览器，访问 `http://<服务器TailscaleIP>:3000`

Expected: 能正常打开成长记录系统，上传照片、写日记等功能正常。

- [ ] **Step 5: 记录访问方式**

在设置页面或 README 中记录：
- 内网访问地址：`http://<服务器内网IP>:3000`
- Tailscale 访问地址：`http://<TailscaleIP>:3000`

---

## Task 15: PWA 离线功能验证

**Files:**
- 无新增文件，纯验证步骤

- [ ] **Step 1: 注册 Service Worker**

确认 `apps/web/src/main.jsx` 中已有 PWA 插件自动注入的 Service Worker 注册代码。vite-plugin-pwa 会自动处理，无需手动添加。

- [ ] **Step 2: 验证 PWA 安装**

在 Chrome 浏览器中打开 `http://localhost:5173`（开发模式）或 `http://localhost:3000`（生产模式）。

打开 DevTools → Application → Manifest，Expected: 显示名称"宝宝成长记录"、图标、主题色等信息。

在地址栏右侧应该出现"安装"图标（桌面）或"添加到主屏幕"提示（手机）。

- [ ] **Step 3: 验证离线访问**

安装 PWA 后，断开网络连接。重新打开应用。

Expected: 已加载过的页面仍能显示（Service Worker 缓存了静态资源）。

- [ ] **Step 4: Commit 最终版本**

```bash
git add -A
git commit -m "feat: complete MVP with PWA and tailscale support"
```

---

## Spec Coverage 自检

| Spec 需求 | 对应 Task |
|-----------|----------|
| 照片上传 | Task 4 |
| 缩略图生成 | Task 4 |
| 时间线首页 | Task 8 |
| 写日记 | Task 10 |
| PWA 离线访问 | Task 2, Task 5, Task 15 |
| Tailscale 远程访问 | Task 14 |
| 本地 SQLite 存储 | Task 2 |
| 相册浏览 | Task 11 |
| 设置/备份说明 | Task 12 |
| 生产构建部署 | Task 13 |

所有 MVP 需求均已覆盖，无遗漏。

## Placeholder 自检

- 无 "TBD"、"TODO"、"implement later"
- 无 "Add appropriate error handling" 等模糊描述
- 每个步骤包含具体代码或命令
- 无未定义的类型/函数引用

## Type 一致性自检

- `RecordType` 枚举值前后一致：PHOTO, VIDEO, DIARY, MILESTONE, VOICE_MESSAGE
- API 路径一致：`/api/records`, `/api/upload/photo`
- Store 方法名一致：`fetchRecords`, `addRecord`, `removeRecord`
- 数据库字段名一致：`recordDate`, `createdBy`, `photoId`

---

*计划日期：2026-04-24*
*对应设计文档：docs/superpowers/specs/2026-04-24-baby-growth-tracker-design.md*
