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
