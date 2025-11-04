'use client';

import { useState } from 'react';
import { logger } from '@/lib/performance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactStatus, CONTACT_STATUS_LABELS } from '@/types/contact';
import { updateContactStatus } from '@/app/contact/actions';

interface StatusSelectProps {
  id: string;
  currentStatus: ContactStatus;
  onStatusChange?: (newStatus: string) => void;
}

export function StatusSelect({ id, currentStatus, onStatusChange }: StatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const labels = CONTACT_STATUS_LABELS;
  const statuses = Object.keys(labels) as ContactStatus[];
  
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      const result = await updateContactStatus(id, newStatus as ContactStatus);
      
      if (result.success) {
        onStatusChange?.(newStatus);
      } else {
        logger.error('Failed to update status:', result.message);
      }
    } catch (error) {
      logger.error('Error updating status:', error);
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






