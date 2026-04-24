import { useEffect } from 'react';
import { useRecordStore } from '../stores/recordStore';
import PhotoCard from '../components/PhotoCard';
import PhotoUploader from '../components/PhotoUploader';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const { records, loading, fetchRecords } = useRecordStore();

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleTabChange = (value) => {
    fetchRecords(value === 'all' ? '' : value === 'photo' ? 'PHOTO' : 'DIARY');
  };

  return (
    <div>
      <Tabs defaultValue="all" onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="photo">照片</TabsTrigger>
          <TabsTrigger value="diary">日记</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && <p className="text-muted-foreground text-center py-8">加载中...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {records.map((record) => (
          <PhotoCard key={record.id} record={record} />
        ))}
      </div>

      {!loading && records.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📸</p>
          <p>还没有记录，去上传第一张照片吧！</p>
        </div>
      )}
      <PhotoUploader />
    </div>
  );
}
