# 亲属身份选择器设计文档

## 背景

在宝宝的成长记录应用中，上传照片或撰写日记时，需要记录是谁创建/上传的这条内容。当前系统已有一个 `createdBy` 字符串字段（默认值"爸爸"），但前端没有提供选择身份的界面。

## 目标

为照片上传和日记编辑功能添加必填的亲属身份选择器，支持从预设选项中选择，或选择"其他"后手动输入。

## 预设亲属选项

核心家庭成员，三代以内：

- 爸爸
- 妈妈
- 爷爷
- 奶奶
- 外公
- 外婆
- 其他（手动输入）

## 方案

采用**纯前端轻量方案（方案A）**：复用现有 `createdBy` 字符串字段，前端增加选择器组件，不做数据库 schema 变更。

## 组件设计

### RelativeSelector 组件

位置：`apps/web/src/components/RelativeSelector.jsx`

- 下拉选择框（`<select>`），显示 7 个预设选项
- 选中"其他"时，下方显示文本输入框，placeholder 为"请输入亲属关系"
- 提供受控组件接口：`value`、`onChange`、必填校验
- 样式：与现有表单风格一致（border rounded-lg focus:ring-blue-500）

### PhotoUploader 修改

- 点击上传按钮后，先弹出模态框/表单，包含 RelativeSelector
- 选择身份后才执行实际上传
- `api.uploadPhoto(file, createdBy)` 传递身份

### DiaryEditor 修改

- 在现有表单中增加 RelativeSelector 字段
- 提交时把 `createdBy` 传入 `addRecord`

## API 修改

### `POST /api/upload/photo`

- 接收 `createdBy` form-data 字段
- 创建 Record 时写入 `createdBy`

### `POST /api/records`

- 已支持 `createdBy` 字段，无需修改

## 验证规则

- `createdBy` 为必填字段
- 前端表单提交前校验，未选择/未输入时提示"请选择上传者身份"

## 数据流

1. 用户选择身份（预设或自定义）
2. 前端校验通过
3. 上传照片/保存日记时，`createdBy` 随请求发送到后端
4. 后端写入数据库 `Record.createdBy`

## 无变更项

- Prisma schema：不新增字段，复用 `createdBy`
- 现有 API 响应格式：保持不变
- 首页展示逻辑：保持不变（`createdBy` 已在数据中）
