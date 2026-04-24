import { useState, useRef } from 'react';
import { api } from '../api/client';
import { useRecordStore } from '../stores/recordStore';
import { useUserStore } from '../stores/userStore';
import { Button } from "@/components/ui/button";

export default function PhotoUploader() {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const fetchRecords = useRecordStore((s) => s.fetchRecords);
  const currentUser = useUserStore((s) => s.currentUser);

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length > 0) {
            handleFile(files[0]);
          }
          e.target.value = '';
        }}
      />
      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg text-xl"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? '⏳' : '+'}
      </Button>
    </div>
  );
}
