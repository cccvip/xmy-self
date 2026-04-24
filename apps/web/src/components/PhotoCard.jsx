import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PhotoCard({ record }) {
  const photo = record.photo;
  const typeUpper = (record.type || '').toUpperCase();
  const typeLabel = typeUpper === 'PHOTO' ? '照片' : typeUpper === 'DIARY' ? '日记' : record.type;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {photo && (
        <img
          src={photo.thumbPath}
          alt={record.title || '照片'}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{typeLabel}</Badge>
          <span className="text-xs text-muted-foreground">{record.createdBy}</span>
        </div>
        {record.title && (
          <h3 className="font-semibold text-foreground mb-1">{record.title}</h3>
        )}
        {record.content && (
          <p className="text-sm text-muted-foreground line-clamp-2">{record.content}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(record.recordDate).toLocaleDateString('zh-CN')}
        </p>
      </CardContent>
    </Card>
  );
}
