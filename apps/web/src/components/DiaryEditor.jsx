import { useState } from 'react';
import { useRecordStore } from '../stores/recordStore';
import RelativeSelector from './RelativeSelector';

export default function DiaryEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdBy, setCreatedBy] = useState('');
  const [createdByError, setCreatedByError] = useState('');
  const addRecord = useRecordStore((s) => s.addRecord);

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
