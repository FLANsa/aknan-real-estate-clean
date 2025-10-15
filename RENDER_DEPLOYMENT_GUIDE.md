# دليل نشر موقع أكنان العقارية على Render

## المتطلبات الأساسية

### 1. حساب Render
- إنشاء حساب على [render.com](https://render.com)
- ربط حساب GitHub مع Render

### 2. متغيرات البيئة المطلوبة

يجب إضافة المتغيرات التالية في إعدادات المشروع على Render:

#### متغيرات Firebase العامة (للعميل)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### متغيرات Firebase Admin (للخادم)
```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

#### متغيرات إضافية
```
ADMIN_EMAILS=admin@example.com,another@example.com
GOOGLE_CLOUD_PROJECT=your_project_id
GCS_BUCKET=your_bucket_name
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## خطوات النشر

### 1. رفع الكود إلى GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. إنشاء خدمة جديدة على Render

1. تسجيل الدخول إلى [render.com](https://render.com)
2. النقر على "New +" ثم "Web Service"
3. ربط المستودع من GitHub
4. اختيار المستودع: `aknan-real-estate-clean`

### 3. إعدادات الخدمة

#### Basic Settings:
- **Name**: `aknan-real-estate`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Runtime**: `Node 18`

#### Build & Deploy:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. إضافة متغيرات البيئة

في قسم "Environment Variables" أضف جميع المتغيرات المذكورة أعلاه.

**ملاحظة مهمة**: 
- تأكد من إضافة `\n` في نهاية كل سطر من `FIREBASE_ADMIN_PRIVATE_KEY`
- لا تضع علامات اقتباس حول القيم إلا إذا كانت مطلوبة

### 5. إعدادات إضافية

#### Advanced Settings:
- **Auto-Deploy**: `Yes` (للنشر التلقائي عند push)
- **Health Check Path**: `/` (اختياري)

## التحقق من النشر

### 1. مراقبة البناء
- راقب logs البناء في Render Dashboard
- تأكد من نجاح `npm run build`

### 2. اختبار الموقع
- افتح الرابط المقدم من Render
- اختبر الصفحات الأساسية:
  - الصفحة الرئيسية: `/`
  - صفحة العقارات: `/properties`
  - صفحة الإدارة: `/admin` (تتطلب تسجيل دخول)

### 3. اختبار الوظائف
- رفع الصور
- إنشاء وتعديل العقارات
- إنشاء المشاريع والقطع
- عرض الخرائط

## استكشاف الأخطاء

### مشاكل شائعة:

#### 1. خطأ في البناء
```
Error: Cannot find module
```
**الحل**: تأكد من أن جميع dependencies موجودة في `package.json`

#### 2. خطأ في Firebase
```
Firebase: Error (auth/invalid-api-key)
```
**الحل**: تأكد من صحة `NEXT_PUBLIC_FIREBASE_API_KEY`

#### 3. خطأ في Google Maps
```
Google Maps JavaScript API error: BillingNotEnabledMapError
```
**الحل**: تفعيل الفوترة في Google Cloud Console

#### 4. خطأ في الصور
```
Error loading image
```
**الحل**: تأكد من إعدادات `next.config.ts` و Firebase Storage

## نصائح مهمة

### 1. الأمان
- لا تضع مفاتيح API في الكود
- استخدم متغيرات البيئة دائماً
- تأكد من إعدادات Firebase Security Rules

### 2. الأداء
- استخدم `output: 'standalone'` في `next.config.ts`
- تحسين الصور باستخدام Next.js Image component
- تفعيل compression في Render

### 3. المراقبة
- راقب logs في Render Dashboard
- استخدم Firebase Analytics لتتبع الاستخدام
- راقب استهلاك Google Maps API

## الدعم

في حالة وجود مشاكل:
1. راجع logs في Render Dashboard
2. تحقق من إعدادات Firebase
3. تأكد من صحة متغيرات البيئة
4. راجع هذا الدليل مرة أخرى

---

**تاريخ الإنشاء**: أكتوبر 2024  
**الإصدار**: 1.0  
**المشروع**: أكنان القمة العقارية

