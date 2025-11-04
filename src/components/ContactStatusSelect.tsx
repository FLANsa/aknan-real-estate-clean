'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactStatus } from '@/types/contact';
import { useState } from 'react';
import { logger } from '@/lib/performance';

interface ContactStatusSelectProps {
  id: string;
  currentStatus: ContactStatus;
}

const ContactStatusSelect = ({ id, currentStatus }: ContactStatusSelectProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ContactStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/contacts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
      } else {
        logger.error('Failed to update status');
      }
    } catch (error) {
      logger.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusLabels = {
    new: 'جديد',
    in_progress: 'قيد المعالجة',
    replied: 'تم الرد',
    completed: 'مكتمل',
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

export default ContactStatusSelect;






