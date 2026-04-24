import { useEffect } from 'react';
import { useRecordStore } from '../stores/recordStore';
import PhotoCard from '../components/PhotoCard';

export default function HomePage() {
  const { records, loading, fetchRecords } = useRecordStore();

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {['全部', '照片', '日记'].map((label) => (
          <button
            key={label}
            onClick={() => fetchRecords(label === '全部' ? '' : label === '照片' ? 'PHOTO' : 'DIARY')}
            className="px-3 py-1.5 text-sm rounded-full bg-white border hover:bg-gray-50"
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-center py-8">加载中...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {records.map((record) => (
          <PhotoCard key={record.id} record={record} />
        ))}
      </div>

      {!loading && records.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📸</p>
          <p>还没有记录，去上传第一张照片吧！</p>
        </div>
      )}
    </div>
  );
}
