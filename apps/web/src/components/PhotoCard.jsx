export default function PhotoCard({ record }) {
  const photo = record.photo;
  const typeUpper = (record.type || '').toUpperCase();
  const typeLabel = typeUpper === 'PHOTO' ? '照片' : typeUpper === 'DIARY' ? '日记' : record.type;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {photo && (
        <img
          src={photo.thumbPath}
          alt={record.title || '照片'}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
            {typeLabel}
          </span>
          <span className="text-xs text-gray-400">{record.createdBy}</span>
        </div>
        {record.title && (
          <h3 className="font-semibold text-gray-800 mb-1">{record.title}</h3>
        )}
        {record.content && (
          <p className="text-sm text-gray-600 line-clamp-2">{record.content}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(record.recordDate).toLocaleDateString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
