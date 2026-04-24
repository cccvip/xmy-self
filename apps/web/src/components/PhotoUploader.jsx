import { useState, useRef } from 'react';
import { api } from '../api/client';
import { useRecordStore } from '../stores/recordStore';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

  const handleClose = () => {
    setShowModal(false);
    setPendingFile(null);
    setCreatedBy('');
    setCreatedByError('');
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择上传者身份</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <RelativeSelector
              value={createdBy}
              onChange={(val) => {
                setCreatedBy(val);
                setCreatedByError('');
              }}
              label="上传者身份"
            />
            {createdByError && (
              <p className="text-sm text-destructive">{createdByError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button onClick={handleConfirmUpload} disabled={uploading}>
              {uploading ? '上传中...' : '确认上传'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
