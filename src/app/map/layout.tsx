import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'خارطة العقارات - أكنان القمة العقارية',
  description: 'اكتشف جميع العقارات المتاحة لدينا في مواقعها الجغرافية. تصفح العقارات على الخريطة واعثر على العقار المثالي لك.',
  keywords: 'خارطة العقارات، عقارات السعودية، مواقع العقارات، خرائط جوجل، عقارات للبيع، عقارات للإيجار',
  openGraph: {
    title: 'خارطة العقارات - أكنان القمة العقارية',
    description: 'اكتشف جميع العقارات المتاحة لدينا في مواقعها الجغرافية',
    type: 'website',
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
