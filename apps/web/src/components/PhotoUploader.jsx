import { useState, useRef } from 'react';
import { api } from '../api/client';
import { useRecordStore } from '../stores/recordStore';

export default function PhotoUploader() {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const fetchRecords = useRecordStore((s) => s.fetchRecords);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      await api.uploadPhoto(file);
      await fetchRecords();
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
