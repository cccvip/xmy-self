# 全局操作人选择器实现计划

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将操作人选择从组件内弹窗改为全局顶部选择器，一次选择全局生效，刷新不丢失。

**Architecture:** 新增 zustand store 管理 `currentUser` 并持久化到 localStorage；Layout 顶部展示选择器；PhotoUploader 和 DiaryEditor 消费 store 中的操作人。

**Tech Stack:** React, zustand, shadcn/ui Select, localStorage

---

### Task 1: 创建 userStore

**Files:**
- Create: `apps/web/src/stores/userStore.js`

- [ ] **Step 1: 编写 store**

```javascript
import { create } from 'zustand';

const STORAGE_KEY = 'baby-current-user';

function getStoredUser() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, user);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export const useUserStore = create((set, get) => ({
  currentUser: getStoredUser(),
  setCurrentUser: (user) => {
    setStoredUser(user);
    set({ currentUser: user });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/stores/userStore.js
git commit -m "feat:创建userStore管理全局操作人"
```

### Task 2: Layout 添加顶部操作人选择器

**Files:**
- Modify: `apps/web/src/components/Layout.jsx`

- [ ] **Step 1: 引入依赖和组件**

在 Layout.jsx 顶部添加：
```javascript
import { useUserStore } from '../stores/userStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRESET_RELATIVES = ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆'];
```

- [ ] **Step 2: 在选择器组件前添加当前操作人显示**

在 `<nav>` 标签之前（或右侧）添加 Select：
```jsx
<Select
  value={currentUser}
  onValueChange={setCurrentUser}
>
  <SelectTrigger className="w-[100px] h-8 text-sm">
    <SelectValue placeholder="选择操作人" />
  </SelectTrigger>
  <SelectContent>
    {PRESET_RELATIVES.map((name) => (
      <SelectItem key={name} value={name}>{name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Layout.jsx
git commit -m "feat:Layout顶部添加操作人选择器"
```

### Task 3: PhotoUploader 移除弹窗，使用全局操作人

**Files:**
- Modify: `apps/web/src/components/PhotoUploader.jsx`

- [ ] **Step 1: 引入 store，移除弹窗相关状态**

移除 Dialog 和 RelativeSelector 的 import，保留 Button。改为：
```javascript
import { useUserStore } from '../stores/userStore';
```

移除状态：`showModal`, `pendingFile`, `createdBy`, `createdByError`
移除函数：`handleConfirmUpload`, `handleClose`

添加：`const currentUser = useUserStore((s) => s.currentUser);`

- [ ] **Step 2: 简化 handleFile 和上传逻辑**

`handleFile` 直接上传，不再需要弹窗：
```javascript
const handleFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) return;
  if (!currentUser) {
    alert('请先选择操作人');
    return;
  }
  setUploading(true);
  try {
    await api.uploadPhoto(file, currentUser);
    await fetchRecords();
  } catch (err) {
    alert('上传失败: ' + err.message);
  } finally {
    setUploading(false);
  }
};
```

- [ ] **Step 3: 移除 Dialog JSX，简化渲染**

移除整个 `<Dialog>...</Dialog>` 部分。

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/PhotoUploader.jsx
git commit -m "refactor:PhotoUploader使用全局操作人，移除弹窗"
```

### Task 4: DiaryEditor 默认操作人来自全局

**Files:**
- Modify: `apps/web/src/components/DiaryEditor.jsx`

- [ ] **Step 1: 引入 store，设置默认值**

在顶部添加：
```javascript
import { useUserStore } from '../stores/userStore';
```

将 `createdBy` 的初始化改为：
```javascript
const currentUser = useUserStore((s) => s.currentUser);
const [createdBy, setCreatedBy] = useState(currentUser);
```

- [ ] **Step 2: 添加 useEffect 同步 store 变化**

```javascript
useEffect(() => {
  if (currentUser && !createdBy) {
    setCreatedBy(currentUser);
  }
}, [currentUser]);
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/DiaryEditor.jsx
git commit -m "update:DiaryEditor操作人默认值来自全局store"
```

---

## Spec 覆盖检查

| 需求 | 任务 |
|------|------|
| 全局操作人选择器 | Task 2 |
| 持久化到 localStorage | Task 1 |
| PhotoUploader 移除弹窗 | Task 3 |
| DiaryEditor 默认全局操作人 | Task 4 |
| 后端无需改动 | 不涉及 |

## 自评

- 无 TBD/TODO
- 类型一致：`currentUser` 始终为字符串
- 每个任务可独立提交
