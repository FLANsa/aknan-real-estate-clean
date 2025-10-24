export type ContactStatus = 'new' | 'in_progress' | 'replied' | 'completed';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: 'general' | 'property_inquiry' | 'evaluation' | 'support' | 'other';
  message: string;
  status: ContactStatus;
  createdAt: Date;
  readAt?: Date;
  updatedAt?: Date;
}

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: 'جديد',
  in_progress: 'قيد المعالجة',
  replied: 'تم الرد',
  completed: 'مكتمل',
};

export const CONTACT_SUBJECT_LABELS: Record<ContactMessage['subject'], string> = {
  general: 'استفسار عام',
  property_inquiry: 'استفسار عن عقار',
  evaluation: 'طلب تقييم عقار',
  support: 'دعم فني',
  other: 'أخرى',
};

