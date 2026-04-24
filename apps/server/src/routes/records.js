const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Valid record types (since SQLite doesn't support enums, validate at app level)
const VALID_TYPES = ['PHOTO', 'VIDEO', 'DIARY', 'MILESTONE', 'VOICE_MESSAGE'];

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET /api/records - 获取记录列表
router.get('/', asyncHandler(async (req, res) => {
  const { type } = req.query;
  const where = type ? { type } : {};
  const records = await prisma.record.findMany({
    where,
    orderBy: { recordDate: 'desc' },
    include: { photo: true },
  });
  res.json(records);
}));

// GET /api/records/:id - 获取单条记录
router.get('/:id', asyncHandler(async (req, res) => {
  const record = await prisma.record.findUnique({
    where: { id: req.params.id },
    include: { photo: true },
  });
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
}));

// POST /api/records - 创建记录
router.post('/', asyncHandler(async (req, res) => {
  const { type, title, content, recordDate, tags, createdBy, photoId } = req.body;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
  }

  const parsedDate = new Date(recordDate);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Invalid recordDate' });
  }

  const record = await prisma.record.create({
    data: {
      type,
      title,
      content,
      recordDate: parsedDate,
      tags,
      createdBy,
      ...(photoId && {
        photo: { connect: { id: photoId } },
      }),
    },
    include: { photo: true },
  });
  res.status(201).json(record);
}));

// PUT /api/records/:id - 更新记录
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, content, recordDate, tags } = req.body;

  let parsedDate;
  if (recordDate) {
    parsedDate = new Date(recordDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid recordDate' });
    }
  }

  const record = await prisma.record.update({
    where: { id: req.params.id },
    data: {
      title,
      content,
      recordDate: parsedDate || undefined,
      tags,
    },
    include: { photo: true },
  });
  res.json(record);
}));

// DELETE /api/records/:id - 删除记录
router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.record.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

module.exports = router;
