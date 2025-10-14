# أكنان القمة العقارية - موقع العقارات

موقع عقارات متكامل باللغة العربية مع لوحة تحكم إدارية محمية، مبني باستخدام Next.js 14 و Firebase.

## المميزات

- 🏠 **صفحة رئيسية جذابة** مع قسم البطل والإحصائيات والعقارات المميزة
- 🔍 **صفحة العقارات** مع فلاتر متقدمة وبحث ذكي
- 📱 **صفحات تفاصيل العقارات** مع معرض صور ومعلومات شاملة
- 🔐 **لوحة تحكم محمية** لإدارة العقارات
- 📸 **رفع صور متعدد** مع معاينة وتقدم التحميل
- 🌐 **دعم كامل للغة العربية** مع اتجاه RTL
- 📱 **تصميم متجاوب** يعمل على جميع الأجهزة
- 🔒 **أمان عالي** مع Firebase Admin SDK

## التقنيات المستخدمة

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Authentication**: Firebase Auth مع حماية Admin SDK
- **Forms**: React Hook Form + Zod validation
- **Styling**: TailwindCSS مع دعم RTL
- **Fonts**: Cairo (Google Fonts)

## التثبيت والإعداد

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd aknan-website
npm install
```

### 2. إعداد Firebase

#### إنشاء مشروع Firebase جديد:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد
3. فعّل Authentication → Email/Password
4. أنشئ Firestore Database
5. فعّل Storage

#### الحصول على مفاتيح Firebase:

1. **Client Config** (من Project Settings → General → Your apps):
   - انسخ Web Config إلى `.env.local`

2. **Admin SDK** (من Project Settings → Service Accounts):
   - أنشئ Service Account جديد
   - حمّل المفتاح الخاص (JSON)
   - انسخ القيم المطلوبة إلى `.env.local`

### 3. إعداد متغيرات البيئة

انسخ `.env.example` إلى `.env.local` واملأ القيم:

```bash
cp .env.example .env.local
```

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Admin Access Control
ADMIN_UIDS=uid1,uid2,uid3
# أو
# ADMIN_EMAILS=admin@aknan.sa,manager@aknan.sa

# WhatsApp Integration
NEXT_PUBLIC_WHATSAPP=9665XXXXXXXX

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. إنشاء مستخدم إداري

1. اذهب إلى Firebase Console → Authentication → Users
2. أضف مستخدم جديد (Email/Password)
3. انسخ UID أو Email وضعه في `ADMIN_UIDS` أو `ADMIN_EMAILS`

### 5. تشغيل المشروع

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## هيكل المشروع

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # لوحة التحكم الإدارية
│   │   ├── login/        # صفحة تسجيل الدخول
│   │   ├── properties/   # إدارة العقارات
│   │   └── actions.ts    # Server Actions
│   ├── api/              # API Routes
│   ├── properties/       # صفحات العقارات العامة
│   └── page.tsx         # الصفحة الرئيسية
├── components/           # مكونات React
│   ├── ui/              # مكونات shadcn/ui
│   ├── Header.tsx       # رأس الموقع
│   ├── Footer.tsx       # تذييل الموقع
│   ├── PropertyCard.tsx # بطاقة العقار
│   ├── PropertyFilters.tsx # فلاتر البحث
│   └── ImageUploader.tsx # رفع الصور
├── lib/                  # مكتبات مساعدة
│   ├── firebase/        # إعدادات Firebase
│   ├── schemas/         # Zod schemas
│   └── utils/           # دوال مساعدة
└── types/               # TypeScript types
```

## الاستخدام

### للزوار:
- تصفح العقارات المتاحة
- استخدام فلاتر البحث المتقدمة
- عرض تفاصيل العقارات
- التواصل عبر واتساب

### للإداريين:
- تسجيل الدخول إلى `/admin/login`
- إدارة العقارات من `/admin/properties`
- إضافة عقارات جديدة
- تعديل وحذف العقارات
- رفع صور متعددة

## الأمان

- جميع عمليات الكتابة تتم عبر Server Actions باستخدام Firebase Admin SDK
- حماية كاملة لجميع صفحات `/admin/*`
- قواعد Firestore تمنع الكتابة من العميل
- التحقق من صلاحيات الإدارة في كل عملية

## النشر

### Firebase Hosting:

```bash
npm run build
npm run export
firebase deploy
```

### Vercel:

```bash
npm run build
# ارفع إلى Vercel
```

## قواعد Firestore

استخدم القواعد الموجودة في `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;        // قراءة عامة
      allow write: if false;      // منع الكتابة من العميل
    }
  }
}
```

## هيكل البيانات

### مجموعة العقارات (`properties`):

```typescript
{
  titleAr: string,           // العنوان بالعربية
  descriptionAr?: string,    // الوصف
  city: string,              // المدينة
  district?: string,         // الحي
  address?: string,          // العنوان التفصيلي
  purpose: "sale" | "rent",  // نوع المعاملة
  type: "apartment" | "villa" | "land" | "office" | "shop",
  areaM2?: number,          // المساحة
  bedrooms?: number,         // غرف النوم
  bathrooms?: number,        // دورات المياه
  floor?: number,           // الطابق
  price: number,            // السعر
  currency: "SAR" | "USD",  // العملة
  status: "available" | "sold" | "rented" | "off-market",
  features?: string[],      // المميزات
  yearBuilt?: number,      // سنة البناء
  lat?: number,            // خط العرض
  lng?: number,           // خط الطول
  images: string[],       // روابط الصور
  featured?: boolean,     // عقار مميز
  slug: string,           // الرابط المختصر
  createdAt: Timestamp,  // تاريخ الإنشاء
  updatedAt: Timestamp,  // تاريخ التحديث
  createdBy: string      // معرف المنشئ
}
```

## المساهمة

1. Fork المشروع
2. أنشئ فرع للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

للحصول على الدعم، تواصل معنا عبر:
- البريد الإلكتروني: info@aknan.sa
- واتساب: +966 5X XXX XXXX

---

تم تطوير هذا المشروع بواسطة فريق أكنان القمة العقارية 💚