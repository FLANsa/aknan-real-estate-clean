#!/bin/bash

# سكريبت تحديث متغيرات البيئة في Render باستخدام طريقة بديلة
echo "🚀 محاولة تحديث متغيرات البيئة في Render..."

# اسم الخدمة في Render
SERVICE_NAME="aknan-real-estate"

echo "📋 محاولة استخدام Render CLI بطريقة مختلفة..."

# قائمة متغيرات البيئة المطلوبة
ENV_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC4X7KX14u61IhcxnSXPHaEwpqDxiQBuMo"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aknanalkimma-1d85c.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=aknanalkimma-1d85c"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aknanalkimma-1d85c.firebasestorage.app"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=33443406347"
    "NEXT_PUBLIC_FIREBASE_APP_ID=1:33443406347:web:fbfd24eb2ddf591d5f5d0e"
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CN8FK81S3K"
    "FIREBASE_ADMIN_PROJECT_ID=aknanalkimma-1d85c"
    "FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aknanalkimma-1d85c.iam.gserviceaccount.com"
    "ADMIN_EMAILS=admin@aknan.sa"
    "NEXT_PUBLIC_WHATSAPP=9665XXXXXXX"
    "NEXT_PUBLIC_SITE_URL=https://aknan-real-estate.onrender.com"
    "GOOGLE_CLOUD_PROJECT=aknanalkimma-1d85c"
    "GCS_BUCKET=aknanalkimma-1d85c.appspot.com"
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyALKolr0_4M_Oypgk_8fb0ekpBwsYOCEXI"
)

# Private Key منفصل
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCLr0RG9fm6j8hh
agThEGEoyFghLIbtO7YczSrjtbAYZ4KOxRgW0bq64zxiRL2zVxvL/i5uFgvfnVaT
q9nhZYRxoMzDOkM+nzPLNn06Yku4GsF21XivnlTDN0PjLd6iqhzRcXdUMe/2ft99
QVzkfo4ESihtj+ZH23wbQRDowRPgwgEKlsEfQDEYb8H6AuohqTWiCAX6HsP1b7qi
ZfMbNRs/P8b3GtWShT33Gnn+8aUi1z7Fy414FrMNgYMS0bys3KY1sYY+Evn2SJJ0
rp64f0Ked7Z+/N42WgY7EUvKsAMuJGyZq9d3uvmmSmwK8yNDX+GwMevszFsxiEET
dWk+SKjFAgMBAAECgf9EhctjWXG9qKBj095mNI11CX2HczsSpXgbfjTL/7+i487o
D/JWlLaazLOSgVDjPpgkOfdiNEPJg9A0y4OBTouU3OJAjb7vDqoZxgvTLY/M1f3n
OFE71YU/Pp0kP3GNL7tzWHYb7Li1SF0vf3ZSS22KLSwn6FokZfHmbMTJaUNBvdrl
+IIrIuWO2AKdaRd7BRHc0mRZZ1+CEZfe8S9shdAsKtbS52ijQ6FD5AUQAHFNB7I+
hzSk2tPZvcXdKsn6M+VilV/DQS++a19oQ/4pyMSRvP5Spv+yGoXPUk67/BSatLB2
sE8l5lCLYulSjw/mRtoGIDogUzcxt9dN4E83cgECgYEAxXQCZ7ukVpFPIKPUtWUP
9K+vvmH1KgSe2Tttn2dzRswqARIWpEB24KZ38SZyZNBjoJ0p6thPtaF+lsyT675V
+GR41TgDzqVoqGDk/ipRyLOa8NJi49dyO+dI/icG0eF0LtXywqkml4xvB7ZLXcU5
VTDTn1AZGeZogNCxTi1JDsUCgYEAtRo/QzEH7i1IlNmnlZ32wGwGj5yn38TEcWiY
vlD56iKawq9ZrLvf8+7qUebkfFmkYJ1jDc2wn+mT6dn77t/vEd0ng/sYRqszmDYo
9c6srrT/+mFjz99KjS3g3ZQdw4yoKxKfjcAN602ZOyKaarHzahRkwKGwsIWGn237
FUV60gECgYEAww7ViXBe6n3l81KlQQUze/9K2AKhVP73hZYlt0FVKe1q2V/rKhvc
1BTfjET04Q7UPMjFrhA+vilpisNSpaKD/zwR+mC5shzJhP0jesqHvINhXuIXewlM
+kyDWT9oh1H3moUUqqS7UR8UWEQHs/yvpK71f/56rZFmT0ravWYTNBkCgYBZxfwM
K7b5qzrqhoZbVWWm9yW9dPOGqjyS1z24Qd3Q4XyD+3ZhePRIMGu5U9J5jdo9Bme+
xPLEIn5vEt6fCCSzX0SiWQsspNs7ncVqLBxPsmudyz82IUMMfuyUCkNC12vZhi7P
jp+Xv+ywcrPHJhU6xYc4Mi6rIlWcnGE1py5+AQKBgQCGAAmTulUGrB6L40I20eSG
RDvkRCu3ZKeejv2bIpsp3SJJap0oR95urqHIa25+4OGsB58QngM8DwVILpIhM6Oe
HCvTKzelTFTcX1LEyjr89gHGZYAjgy+i6FMVz1YZB6ceS6c1Yp3r0izgjptJymFz
dzRDHOf26rXjiZg//3w5/Q==
-----END PRIVATE KEY-----"

echo "🔍 محاولة العثور على الخدمة..."

# محاولة استخدام render services list مع output text
echo "📋 قائمة الخدمات المتاحة:"
render services list -o text 2>/dev/null || echo "❌ فشل في الحصول على قائمة الخدمات"

echo ""
echo "🔧 محاولة تحديث متغيرات البيئة..."

# محاولة استخدام render deploy مع متغيرات البيئة
echo "📦 محاولة استخدام render deploy..."

# إنشاء ملف .env مؤقت
echo "📝 إنشاء ملف .env مؤقت..."
cat > .env.temp << EOF
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC4X7KX14u61IhcxnSXPHaEwpqDxiQBuMo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aknanalkimma-1d85c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aknanalkimma-1d85c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aknanalkimma-1d85c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=33443406347
NEXT_PUBLIC_FIREBASE_APP_ID=1:33443406347:web:fbfd24eb2ddf591d5f5d0e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CN8FK81S3K
FIREBASE_ADMIN_PROJECT_ID=aknanalkimma-1d85c
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aknanalkimma-1d85c.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=$FIREBASE_ADMIN_PRIVATE_KEY
ADMIN_EMAILS=admin@aknan.sa
NEXT_PUBLIC_WHATSAPP=9665XXXXXXX
NEXT_PUBLIC_SITE_URL=https://aknan-real-estate.onrender.com
GOOGLE_CLOUD_PROJECT=aknanalkimma-1d85c
GCS_BUCKET=aknanalkimma-1d85c.appspot.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyALKolr0_4M_Oypgk_8fb0ekpBwsYOCEXI
EOF

echo "✅ تم إنشاء ملف .env.temp"

echo ""
echo "📋 ملخص المتغيرات المطلوبة:"
echo "================================"
for var in "${ENV_VARS[@]}"; do
    echo "✅ $var"
done
echo "✅ FIREBASE_ADMIN_PRIVATE_KEY=[Private Key]"

echo ""
echo "🔧 التعليمات اليدوية:"
echo "================================"
echo "1. اذهب إلى: https://dashboard.render.com"
echo "2. اختر خدمتك: $SERVICE_NAME"
echo "3. اذهب إلى تبويب 'Environment'"
echo "4. أضف كل متغير من المتغيرات التالية:"
echo ""
for var in "${ENV_VARS[@]}"; do
    echo "📌 $var"
done
echo "📌 FIREBASE_ADMIN_PRIVATE_KEY"
echo "   القيمة: [Private Key من الملف .env.temp]"

echo ""
echo "💡 نصائح مهمة:"
echo "================================"
echo "• انسخ القيم من ملف .env.temp"
echo "• تأكد من نسخ الـ Private Key بالكامل مع الأسطر الجديدة"
echo "• بعد إضافة جميع المتغيرات، أعد تشغيل الخدمة"
echo "• تحقق من أن NEXT_PUBLIC_SITE_URL يحتوي على رابط Render الصحيح"

echo ""
echo "🗑️ تنظيف الملفات المؤقتة..."
rm -f .env.temp

echo ""
echo "🎉 تم الانتهاء! استخدم التعليمات اليدوية أعلاه لتحديث المتغيرات."
