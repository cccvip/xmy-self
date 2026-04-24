# 全局当前操作人选择器设计

## 背景

当前 PhotoUploader 和 DiaryEditor 都已支持 `createdBy` 字段，但交互方式不一致：
- PhotoUploader：上传图片后弹出 Dialog 选择操作人
- DiaryEditor：表单内直接选择操作人

用户希望改为**先选操作人，再上传**的交互方式，即全局选择一次操作人后，后续所有上传/写日记操作默认使用该身份。

## 设计目标

1. 操作人选择一次，全局生效，刷新不丢失
2. PhotoUploader 移除弹窗选择操作人的步骤，直接上传
3. DiaryEditor 表单中操作人字段默认值来自全局选择，但仍可手动修改
4. 后端 API 无需改动（已支持 `createdBy` 字段）

## 数据流

```
Layout 顶部操作人选择器
    │
    ▼
userStore (zustand + localStorage 持久化)
    │ currentUser
    ├─► PhotoUploader ──► api.uploadPhoto(file, currentUser)
    └─► DiaryEditor ────► addRecord({ ..., createdBy: currentUser })
```

## 组件变更

### 新增：stores/userStore.js

- 使用 zustand 创建 `useUserStore`
- 状态：`currentUser`（字符串，操作人名称）
- 初始化时从 `localStorage` 读取 `baby-current-user`
- 变更时持久化到 `localStorage`
- 提供 `setCurrentUser(user)` action

### 修改：Layout.jsx

- 在顶部 header 右侧导航区域添加紧凑型操作人选择器
- 使用 Select 组件，选项来源：`RelativeSelector.PRESET_RELATIVES`
- 显示文本：`👤 爸爸 ▼` 或简洁为 `爸爸 ▼`
- 未选择时显示提示：`请选择操作人`（deuteranopia 色/灰色）

### 修改：PhotoUploader.jsx

- 移除 Dialog 选择操作人相关状态：`showModal`, `pendingFile`, `createdBy`, `createdByError`
- 移除 `handleConfirmUpload` 和 `handleClose`
- 上传时直接从 `useUserStore` 读取 `currentUser`
- 若未设置操作人，点击上传按钮时给出提示（toast 或 alert），不阻断但不执行上传

### 修改：DiaryEditor.jsx

- 引入 `useUserStore` 获取 `currentUser`
- `createdBy` state 默认值从 `currentUser` 初始化（通过 useEffect 或初始化参数）
- 表单中保留 RelativeSelector 字段，允许用户临时修改为其他操作人
- 提交时仍使用表单中的 `createdBy` 值

## 边界处理

- **首次使用**：未选择操作人时，上传按钮点击提示"请先选择操作人"，引导用户到顶部选择
- **localStorage 失效**：读取失败时静默处理，`currentUser` 为空字符串
- **持久化键冲突**：使用 `baby-current-user` 作为键名，避免与其他项目冲突

## API 变更

无。后端 `/api/upload/photo` 和 `/api/records` 均已支持 `createdBy` 字段。
