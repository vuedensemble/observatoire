import { formatDateShort } from '@/lib/utils';

interface TimelineItem {
  id: string;
  date: string;
  content: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`timeline-item ${index === items.length - 1 ? 'pb-0' : ''}`}
        >
          <div className="text-sm text-[var(--neutre)] mb-2">
            {formatDateShort(item.date)}
          </div>
          <div>{item.content}</div>
        </div>
      ))}
    </div>
  );
}
