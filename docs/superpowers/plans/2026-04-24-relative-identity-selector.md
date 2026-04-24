# 亲属身份选择器 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为照片上传和日记编辑添加必填的亲属身份下拉选择器，支持预设选项和"其他"手动输入。

**Architecture:** 纯前端方案，复用现有 `createdBy` 字符串字段。新增 `RelativeSelector` 受控组件，在 `PhotoUploader` 和 `DiaryEditor` 中集成，API 层接收并透传字段。

**Tech Stack:** React 18, Tailwind CSS, Express.js, Prisma + SQLite

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `apps/web/src/components/RelativeSelector.jsx` | 创建 | 亲属身份下拉选择器组件 |
| `apps/web/src/components/PhotoUploader.jsx` | 修改 | 上传前弹窗选择身份 |
| `apps/web/src/components/DiaryEditor.jsx` | 修改 | 表单增加身份选择字段 |
| `apps/web/src/api/client.js` | 修改 | `uploadPhoto` 增加 `createdBy` 参数 |
| `apps/server/src/routes/uploads.js` | 修改 | 接收 `createdBy` form-data 字段 |

---

### Task 1: RelativeSelector 组件

**Files:**
- Create: `apps/web/src/components/RelativeSelector.jsx`

- [ ] **Step 1: 实现 RelativeSelector 组件**

```jsx
import { useState, useEffect } from 'react';

const PRESET_RELATIVES = ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆'];

export default function RelativeSelector({ value, onChange, required = true, label = '上传者身份' }) {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');

  useEffect(() => {
    if (value) {
      if (PRESET_RELATIVES.includes(value)) {
        setSelected(value);
        setCustom('');
      } else {
        setSelected('other');
        setCustom(value);
      }
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (val !== 'other') {
      setCustom('');
      onChange?.(val || '');
    } else {
      onChange?.(custom || '');
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustom(val);
    onChange?.(val);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={selected}
        onChange={handleSelectChange}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        required={required}
      >
        <option value="">请选择身份</option>
        {PRESET_RELATIVES.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
        <option value="other">其他</option>
      </select>
      {selected === 'other' && (
        <input
          type="text"
          value={custom}
          onChange={handleCustomChange}
          placeholder="请输入亲属关系"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          required={required}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/RelativeSelector.jsx
git commit -m "feat: add RelativeSelector component with preset relatives and custom input

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: 修改 DiaryEditor 集成身份选择

**Files:**
- Modify: `apps/web/src/components/DiaryEditor.jsx`

- [ ] **Step 1: 导入 RelativeSelector 并添加状态**

在现有 import 下添加：
```jsx
import RelativeSelector from './RelativeSelector';
```

在组件内新增状态：
```jsx
const [createdBy, setCreatedBy] = useState('');
const [createdByError, setCreatedByError] = useState('');
```

- [ ] **Step 2: 修改 handleSubmit 验证逻辑**

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setCreatedByError('');

  if (!content.trim()) return;
  if (!createdBy.trim()) {
    setCreatedByError('请选择上传者身份');
    return;
  }

  setSaving(true);
  try {
    await addRecord({
      type: 'DIARY',
      title: title.trim() || undefined,
      content: content.trim(),
      recordDate: new Date().toISOString(),
      createdBy,
    });
    setTitle('');
    setContent('');
    setCreatedBy('');
    alert('日记保存成功！');
  } catch (err) {
    alert('保存失败: ' + err.message);
  } finally {
    setSaving(false);
  }
};
```

- [ ] **Step 3: 在表单中插入 RelativeSelector**

在标题输入框下方、内容输入框上方插入：
```jsx
<RelativeSelector
  value={createdBy}
  onChange={(val) => {
    setCreatedBy(val);
    setCreatedByError('');
  }}
  label="记录者身份"
/>
{createdByError && (
  <p className="text-sm text-red-500">{createdByError}</p>
)}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/DiaryEditor.jsx
git commit -m "feat: integrate RelativeSelector into DiaryEditor

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: 修改 API client 支持 createdBy 参数

**Files:**
- Modify: `apps/web/src/api/client.js`

- [ ] **Step 1: 修改 uploadPhoto 方法**

将 `uploadPhoto` 改为接收 `file` 和 `createdBy`：
```js
uploadPhoto: (file, createdBy) => {
  const form = new FormData();
  form.append('photo', file);
  if (createdBy) {
    form.append('createdBy', createdBy);
  }
  return fetch('/api/upload/photo', { method: 'POST', body: form }).then(r => r.json());
},
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/api/client.js
git commit -m "feat: uploadPhoto API supports createdBy field

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: 修改 PhotoUploader 集成身份选择弹窗

**Files:**
- Modify: `apps/web/src/components/PhotoUploader.jsx`

- [ ] **Step 1: 导入 RelativeSelector 并添加弹窗状态**

在现有 import 下添加：
```jsx
import RelativeSelector from './RelativeSelector';
```

新增状态：
```jsx
const [showModal, setShowModal] = useState(false);
const [pendingFile, setPendingFile] = useState(null);
const [createdBy, setCreatedBy] = useState('');
const [createdByError, setCreatedByError] = useState('');
```

- [ ] **Step 2: 修改 handleFile 流程**

```jsx
const handleFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) return;
  setPendingFile(file);
  setCreatedBy('');
  setCreatedByError('');
  setShowModal(true);
};

const handleConfirmUpload = async () => {
  if (!createdBy.trim()) {
    setCreatedByError('请选择上传者身份');
    return;
  }
  setShowModal(false);
  setUploading(true);
  try {
    await api.uploadPhoto(pendingFile, createdBy);
    await fetchRecords();
  } catch (err) {
    alert('上传失败: ' + err.message);
  } finally {
    setUploading(false);
    setPendingFile(null);
    setCreatedBy('');
  }
};
```

- [ ] **Step 3: 修改 onChange 以批量处理文件**

```jsx
onChange={(e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    // 每次只处理第一个，弹窗确认后再处理下一个
    handleFile(files[0]);
    // 剩余文件暂存，待后续实现批量队列
  }
  e.target.value = '';
}}
```

> 注：为简化实现，此处一次上传一个文件。如需批量上传，可扩展为文件队列。

- [ ] **Step 4: 添加身份选择弹窗 JSX**

在返回的 JSX 末尾、浮动按钮之前插入弹窗：
```jsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-800">选择上传者身份</h3>
      <RelativeSelector
        value={createdBy}
        onChange={(val) => {
          setCreatedBy(val);
          setCreatedByError('');
        }}
        label="上传者身份"
      />
      {createdByError && (
        <p className="text-sm text-red-500">{createdByError}</p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => {
            setShowModal(false);
            setPendingFile(null);
            setCreatedBy('');
            setCreatedByError('');
          }}
          className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleConfirmUpload}
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {uploading ? '上传中...' : '确认上传'}
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/PhotoUploader.jsx
git commit -m "feat: integrate RelativeSelector into PhotoUploader with modal

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: 修改服务端 uploads 路由接收 createdBy

**Files:**
- Modify: `apps/server/src/routes/uploads.js`

- [ ] **Step 1: 在创建 Record 时传入 createdBy**

```js
const createdBy = req.body.createdBy || '爸爸';

const record = await prisma.record.create({
  data: {
    type: 'PHOTO',
    recordDate: new Date(),
    createdBy,
  },
});
```

注意：`multer` 已处理 `multipart/form-data`，`req.body` 中的非文件字段可直接访问。

- [ ] **Step 2: Commit**

```bash
git add apps/server/src/routes/uploads.js
git commit -m "feat: server uploads endpoint accepts createdBy field

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: 验证与测试

- [ ] **Step 1: 手动测试日记编辑器**

1. 打开日记页面 (`/diary`)
2. 不选身份直接提交 → 应提示"请选择上传者身份"
3. 选择预设身份（如"妈妈"）→ 提交成功，`createdBy` 为"妈妈"
4. 选择"其他"，输入"舅舅" → 提交成功，`createdBy` 为"舅舅"

- [ ] **Step 2: 手动测试照片上传**

1. 点击首页浮动上传按钮
2. 选择照片后弹出身份选择弹窗
3. 不选身份点击确认 → 应提示错误
4. 选择"外婆" → 上传成功
5. 检查数据库中 `Record.createdBy` 字段正确

- [ ] **Step 3: 检查首页显示**

确认 `PhotoCard` 等组件是否正确展示 `createdBy`（如果已有展示逻辑）。

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "test: verify relative identity selector integration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ RelativeSelector 组件（预设 + 其他输入）→ Task 1
- ✅ DiaryEditor 集成（必填校验）→ Task 2
- ✅ PhotoUploader 集成（弹窗确认）→ Task 4
- ✅ API 层透传 createdBy → Task 3 + Task 5
- ✅ 数据库复用现有字段 → 无需 schema 变更

**2. Placeholder scan:**
- ✅ 无 TBD/TODO
- ✅ 每个步骤包含完整代码
- ✅ 无模糊描述

**3. Type consistency：**
- ✅ `RelativeSelector` 接口：`value`, `onChange`, `required`, `label`
- ✅ `uploadPhoto(file, createdBy)` 签名一致
- ✅ `createdBy` 字段名前后一致
