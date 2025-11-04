# دليل قياس الأداء - نظام أكنان العقارية

## الأدوات المطلوبة

1. **Google Chrome** (أحدث إصدار)
2. **Lighthouse** (مدمج في Chrome DevTools)
3. **Chrome DevTools**
4. **WebPageTest** (اختياري)

## خطوات القياس

### 1. قياس Core Web Vitals باستخدام Lighthouse

#### الخطوات:
1. افتح التطبيق في Chrome
2. افتح Chrome DevTools (F12)
3. انتقل إلى تبويب "Lighthouse"
4. اختر:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. اختر Device: **Desktop** أو **Mobile**
6. اضغط "Generate report"

#### الصفحات المطلوب قياسها:
- [ ] الصفحة الرئيسية (`/`)
- [ ] صفحة العقارات (`/properties`)
- [ ] صفحة تفاصيل العقار (`/properties/[slug]`)
- [ ] صفحة المشاريع (`/projects`)
- [ ] صفحة تفاصيل المشروع (`/projects/[id]`)
- [ ] الخريطة التفاعلية (`/map`)

#### المعايير المستهدفة:
| المقياس | الهدف | كيفية التحقق |
|---------|-------|--------------|
| **Performance Score** | > 90 | في تقرير Lighthouse |
| **LCP** | < 2.5s | في Core Web Vitals |
| **FID** | < 100ms | في Core Web Vitals |
| **CLS** | < 0.1 | في Core Web Vitals |
| **FCP** | < 1.8s | في Core Web Vitals |
| **TTI** | < 3.8s | في Core Web Vitals |

### 2. تحليل Network Performance

#### الخطوات:
1. افتح Chrome DevTools (F12)
2. انتقل إلى تبويب "Network"
3. اختر "Disable cache"
4. اضغط Ctrl+R (أو Cmd+R) لإعادة تحميل الصفحة
5. راجع النتائج

#### المقاييس المطلوبة:
- [ ] **عدد الطلبات**: يجب أن يكون < 50
- [ ] **حجم البيانات**: يجب أن يكون < 2MB
- [ ] **وقت التحميل**: يجب أن يكون < 3s
- [ ] **أول طلب**: يجب أن يكون < 200ms

#### تحليل الصور:
- [ ] الصور تُحمّل بشكل lazy
- [ ] الصور الرئيسية لها priority
- [ ] استخدام WebP/AVIF format
- [ ] أحجام الصور مناسبة

### 3. تحليل Bundle Size

#### الخطوات:
1. قم ببناء المشروع: `npm run build`
2. راجع output البناء
3. تحقق من أحجام الـ bundles

#### المقاييس:
- [ ] **First Load JS**: يجب أن يكون < 300KB لكل صفحة
- [ ] **Route Size**: يجب أن يكون < 100KB لكل صفحة
- [ ] **Shared Chunks**: يجب أن يكون معقول

### 4. قياس Image Performance

#### استخدام Chrome DevTools:
1. افتح Chrome DevTools
2. انتقل إلى تبويب "Network"
3. رشح بـ "Img"
4. أعد تحميل الصفحة
5. راجع:
   - [ ] وقت تحميل كل صورة
   - [ ] حجم كل صورة
   - [ ] format الصورة (WebP/AVIF)

#### المعايير:
- [ ] الصورة الرئيسية تُحمّل خلال < 1s
- [ ] الصور الأخرى تُحمّل بشكل lazy
- [ ] Blur placeholder يظهر قبل تحميل الصورة

### 5. تحليل React Performance

#### استخدام React DevTools:
1. ثبت React DevTools extension
2. افتح Chrome DevTools
3. انتقل إلى تبويب "React"
4. تحقق من:
   - [ ] عدد re-renders
   - [ ] Props changes
   - [ ] State changes

#### التحسينات:
- [ ] استخدام React.memo للمكونات الكبيرة
- [ ] تقليل re-renders غير الضرورية
- [ ] استخدام useMemo و useCallback عند الحاجة

### 6. قياس Real-World Performance

#### استخدام WebPageTest:
1. افتح [WebPageTest.org](https://www.webpagetest.org/)
2. أدخل URL التطبيق
3. اختر:
   - Location: **Dulles, VA** (أو أقرب موقع)
   - Browser: **Chrome**
   - Connection: **Cable** أو **4G**
4. اضغط "Start Test"

#### المقاييس:
- [ ] **Load Time**: يجب أن يكون < 3s
- [ ] **First Byte**: يجب أن يكون < 600ms
- [ ] **Start Render**: يجب أن يكون < 1.5s
- [ ] **Speed Index**: يجب أن يكون < 3.5

## قالب تسجيل النتائج

```markdown
### صفحة: [اسم الصفحة]
**التاريخ**: [التاريخ]
**المتصفح**: [المتصفح والإصدار]
**الجهاز**: [Desktop/Mobile]

#### Lighthouse Score
- Performance: [درجة]
- Accessibility: [درجة]
- Best Practices: [درجة]
- SEO: [درجة]

#### Core Web Vitals
- LCP: [الوقت]
- FID: [الوقت]
- CLS: [القيمة]
- FCP: [الوقت]
- TTI: [الوقت]

#### Network Performance
- عدد الطلبات: [العدد]
- حجم البيانات: [الحجم]
- وقت التحميل: [الوقت]

#### Bundle Size
- First Load JS: [الحجم]
- Route Size: [الحجم]

#### الملاحظات
[أي ملاحظات أو مشاكل]
```

## نصائح للتحسين

### إذا كانت LCP بطيئة:
1. تحسين الصور (ضغط، format، أحجام)
2. استخدام CDN
3. تحسين server response time
4. إزالة render-blocking resources

### إذا كانت CLS عالية:
1. تحديد أبعاد الصور مسبقاً
2. استخدام placeholder للصور
3. تجنب إدراج محتوى ديناميكي في viewport

### إذا كانت Bundle Size كبيرة:
1. استخدام code splitting
2. إزالة dependencies غير المستخدمة
3. تحسين tree shaking
4. استخدام dynamic imports

## المراجع

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

**ملاحظة**: قم بقياس الأداء في بيئة production أو production-like للنتائج الدقيقة.


