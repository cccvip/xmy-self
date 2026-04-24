import { useEffect } from 'react';
import { useRecordStore } from '../stores/recordStore';

export default function GalleryPage() {
  const { records, loading, fetchRecords } = useRecordStore();

  useEffect(() => {
    fetchRecords('PHOTO');
  }, []);

  const photos = records.filter((r) => r.type === 'PHOTO' && r.photo);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">相册</h2>
      {loading && <p className="text-gray-400 text-center py-8">加载中...</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((record) => (
          <div key={record.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={record.photo.thumbPath}
              alt={record.title || '照片'}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      {!loading && photos.length === 0 && (
        <p className="text-center py-16 text-gray-400">暂无照片</p>
      )}
    </div>
  );
}
