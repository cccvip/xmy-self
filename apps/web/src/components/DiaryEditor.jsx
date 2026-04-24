import { useState, useEffect } from 'react';
import { useRecordStore } from '../stores/recordStore';
import { useUserStore } from '../stores/userStore';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RelativeSelector from './RelativeSelector';

export default function DiaryEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const currentUser = useUserStore((s) => s.currentUser);
  const [createdBy, setCreatedBy] = useState(currentUser);
  const [createdByError, setCreatedByError] = useState('');
  const addRecord = useRecordStore((s) => s.addRecord);

  useEffect(() => {
    if (currentUser && !createdBy) {
      setCreatedBy(currentUser);
    }
  }, [currentUser]);

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
      toast.success('日记保存成功！');
    } catch (err) {
      alert('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>写日记</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>标题（可选）</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="今天的主题..."
            />
          </div>
          <div className="space-y-2">
            <RelativeSelector
              value={createdBy}
              onChange={(val) => {
                setCreatedBy(val);
                setCreatedByError('');
              }}
              label="记录者身份"
            />
            {createdByError && (
              <p className="text-sm text-destructive">{createdByError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>内容</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="记录今天发生的趣事..."
              rows={8}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !content.trim()}>
              {saving ? '保存中...' : '保存日记'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
