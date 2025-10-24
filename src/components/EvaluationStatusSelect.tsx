'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EvaluationStatus } from '@/types/evaluation';
import { useState } from 'react';

interface EvaluationStatusSelectProps {
  id: string;
  currentStatus: EvaluationStatus;
}

const EvaluationStatusSelect = ({ id, currentStatus }: EvaluationStatusSelectProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: EvaluationStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/evaluations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusLabels = {
    new: 'جديد',
    scheduled: 'مجدول',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="تغيير الحالة" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EvaluationStatusSelect;

