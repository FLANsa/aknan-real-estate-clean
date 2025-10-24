'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactStatus, CONTACT_STATUS_LABELS } from '@/types/contact';
import { EvaluationStatus, EVALUATION_STATUS_LABELS } from '@/types/evaluation';
import { updateContactStatus } from '@/app/contact/actions';
import { updateEvaluationStatus } from '@/app/evaluation/actions';

interface StatusSelectProps {
  id: string;
  currentStatus: ContactStatus | EvaluationStatus;
  type: 'contact' | 'evaluation';
  onStatusChange?: (newStatus: string) => void;
}

export function StatusSelect({ id, currentStatus, type, onStatusChange }: StatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const labels = type === 'contact' ? CONTACT_STATUS_LABELS : EVALUATION_STATUS_LABELS;
  const statuses = Object.keys(labels) as (ContactStatus | EvaluationStatus)[];
  
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      let result;
      if (type === 'contact') {
        result = await updateContactStatus(id, newStatus as ContactStatus);
      } else {
        result = await updateEvaluationStatus(id, newStatus as EvaluationStatus);
      }
      
      if (result.success) {
        onStatusChange?.(newStatus);
      } else {
        console.error('Failed to update status:', result.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="اختر الحالة" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {labels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

