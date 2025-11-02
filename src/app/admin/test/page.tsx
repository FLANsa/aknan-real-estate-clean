export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">صفحة اختبار الخريطة الإدارية</h1>
      <p>هذه صفحة اختبار للتأكد من أن النظام يعمل بشكل صحيح.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">المكونات المطلوبة:</h2>
        <ul className="list-disc list-inside mt-2">
          <li>MapLibre GL JS</li>
          <li>Zustand</li>
          <li>@turf/turf</li>
          <li>Firebase Admin SDK</li>
        </ul>
      </div>
    </div>
  );
}





