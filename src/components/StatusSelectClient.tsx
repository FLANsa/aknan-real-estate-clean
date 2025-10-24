'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactStatus } from '@/types/contact';
import { EvaluationStatus } from '@/types/evaluation';
import { useRouter } from 'next/navigation';

interface StatusSelectClientProps {
  currentStatus: ContactStatus | EvaluationStatus | string;
  statuses: { value: ContactStatus | EvaluationStatus | 'all'; label: string }[];
  baseUrl: string;
}

const StatusSelectClient = ({ currentStatus, statuses, baseUrl }: StatusSelectClientProps) => {
  const router = useRouter();

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams();
    if (newStatus !== 'all') {
      params.set('status', newStatus);
    }
    const newUrl = `${baseUrl}?${params.toString()}`;
    router.push(newUrl);
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="تغيير الحالة" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelectClient;

