# دليل الاختبار - نظام أكنان العقارية

## نظرة عامة

هذا الدليل يحتوي على جميع المعلومات اللازمة لاختبار نظام أكنان العقارية بشكل شامل.

## الملفات

- **TEST_REPORT.md**: تقرير الاختبارات الآلية
- **MANUAL_TESTING_GUIDE.md**: دليل الاختبار اليدوي
- **PERFORMANCE_TESTING_GUIDE.md**: دليل قياس الأداء
- **scripts/test-comprehensive.js**: سكريبت الاختبارات الآلية

## الاختبارات الآلية

### تشغيل الاختبارات

```bash
npm run test
```

أو

```bash
npm run test:comprehensive
```

### ما يتم اختباره

1. ✅ استخدام Next.js Image بدلاً من `<img>` tags
2. ✅ استخدام logger بدلاً من console.log في client components
3. ✅ استخدام optimizeImages utility
4. ✅ استخدام React.memo
5. ✅ استخدام blur placeholder
6. ✅ نجاح البناء
7. ✅ استخدام lazy loading
8. ✅ وجود متغيرات البيئة

### النتائج

بعد تشغيل الاختبارات، ستحصل على:
- تقرير مفصل في Console
- قائمة بالمشاكل المكتشفة
- توصيات للتحسين

## الاختبارات اليدوية

راجع **MANUAL_TESTING_GUIDE.md** للتفاصيل الكاملة.

### الاختبارات الأساسية

1. الصفحة الرئيسية
2. صفحة العقارات (مع الفلاتر)
3. صفحة تفاصيل العقار
4. صفحة المشاريع
5. صفحة تفاصيل المشروع
6. الخريطة التفاعلية
7. صفحات الإدارة

## قياس الأداء

راجع **PERFORMANCE_TESTING_GUIDE.md** للتفاصيل الكاملة.

### الأدوات المطلوبة

- Chrome DevTools
- Lighthouse
- React DevTools (اختياري)
- WebPageTest (اختياري)

### المعايير المستهدفة

| المقياس | الهدف |
|---------|-------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| FCP | < 1.8s |
| TTI | < 3.8s |
| Bundle Size | < 500KB |

## سريع البدء

### 1. اختبارات آلية
```bash
npm run test
```

### 2. بناء المشروع
```bash
npm run build
```

### 3. تشغيل المشروع
```bash
npm run dev
```

### 4. قياس الأداء
1. افتح التطبيق في Chrome
2. اضغط F12 لفتح DevTools
3. انتقل إلى تبويب Lighthouse
4. اضغط "Generate report"

## المشاكل المعروفة

### console.log في client components
- **الحالة**: وجد 14 ملف يستخدم console.log
- **الحل**: استبدال بـ logger من `@/lib/performance`
- **الأولوية**: عالية

### `<img>` tags في HTML strings
- **الحالة**: وجد 2 استخدامات في HTML strings
- **التقييم**: مقبول (لأنها في Google Maps InfoWindow)
- **الإجراء**: لا إجراء مطلوب

## التحسينات المطبقة

✅ استخدام Next.js Image في جميع المكونات
✅ استخدام optimizeImages utility
✅ استخدام React.memo للمكونات الكبيرة
✅ استخدام lazy loading للصور
✅ استخدام blur placeholder
✅ تحسين Bundle sizes
✅ تحسين next.config.ts

## الخطوات التالية

1. ✅ إصلاح console.log في client components
2. ⚠️ قياس Core Web Vitals باستخدام Lighthouse
3. ⚠️ اختبار يدوي شامل
4. ⚠️ اختبار التوافق مع المتصفحات
5. ⚠️ إعداد monitoring في production

## المساعدة

إذا واجهت أي مشاكل:
1. راجع **TEST_REPORT.md** للتفاصيل
2. راجع **MANUAL_TESTING_GUIDE.md** للاختبارات اليدوية
3. راجع **PERFORMANCE_TESTING_GUIDE.md** لقياس الأداء

## التحديثات

- **2024-01-XX**: إضافة اختبارات شاملة
- **2024-01-XX**: إضافة دليل الاختبار اليدوي
- **2024-01-XX**: إضافة دليل قياس الأداء

---

**آخر تحديث**: $(date +"%Y-%m-%d")


