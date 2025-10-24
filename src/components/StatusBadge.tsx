import { Badge } from '@/components/ui/badge';
import { ContactStatus, CONTACT_STATUS_LABELS } from '@/types/contact';
import { EvaluationStatus, EVALUATION_STATUS_LABELS } from '@/types/evaluation';

interface StatusBadgeProps {
  status: ContactStatus | EvaluationStatus;
  type?: 'contact' | 'evaluation';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-500 hover:bg-blue-500 text-white';
    case 'in_progress':
    case 'scheduled':
      return 'bg-yellow-500 hover:bg-yellow-500 text-white';
    case 'replied':
    case 'completed':
      return 'bg-green-500 hover:bg-green-500 text-white';
    case 'cancelled':
      return 'bg-red-500 hover:bg-red-500 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-500 text-white';
  }
};

export function StatusBadge({ status, type = 'contact' }: StatusBadgeProps) {
  const labels = type === 'contact' ? CONTACT_STATUS_LABELS : EVALUATION_STATUS_LABELS;
  const colorClass = getStatusColor(status);
  
  return (
    <Badge className={colorClass}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}

