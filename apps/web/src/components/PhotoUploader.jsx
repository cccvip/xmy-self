import { useState, useRef } from 'react';
import { api } from '../api/client';
import { useRecordStore } from '../stores/recordStore';
import RelativeSelector from './RelativeSelector';

export default function PhotoUploader() {
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [createdBy, setCreatedBy] = useState('');
  const [createdByError, setCreatedByError] = useState('');
  const inputRef = useRef(null);
  const fetchRecords = useRecordStore((s) => s.fetchRecords);

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
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center text-2xl disabled:opacity-60"
      >
        {uploading ? '⏳' : '+'}
      </button>
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
    </div>
  );
}
