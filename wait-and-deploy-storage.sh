#!/bin/bash

# سكريبت انتظار إكمال إعداد Firebase Storage ثم نشر القواعد
echo "⏳ انتظار إكمال إعداد Firebase Storage..."

# فتح Firebase Console
echo "🌐 فتح Firebase Console..."
open "https://console.firebase.google.com/project/aknanalkimma-1d85c/storage"

echo ""
echo "📋 تعليمات الإعداد:"
echo "================================"
echo "1. ✅ تم فتح Firebase Console"
echo "2. 🔄 اضغط على 'Get Started'"
echo "3. 🔄 اختر 'Start in production mode'"
echo "4. 🔄 اختر الموقع (us-central1 أو europe-west1)"
echo "5. 🔄 اضغط 'Done'"
echo "6. ⏳ انتظر حتى تكتمل العملية"
echo ""

# حلقة انتظار مع فحص دوري
echo "🔄 فحص حالة Firebase Storage كل 10 ثوانٍ..."
echo "💡 يمكنك إيقاف الفحص بالضغط على Ctrl+C"

while true; do
    echo "🔍 فحص Firebase Storage..."
    
    # محاولة نشر القواعد (سيخبرنا إذا كان Storage جاهز)
    if firebase deploy --only storage --non-interactive 2>/dev/null; then
        echo ""
        echo "🎉 تم إعداد Firebase Storage بنجاح!"
        echo "✅ تم نشر قواعد Storage"
        echo "✅ يمكن الآن رفع الصور إلى Google Cloud Storage"
        echo ""
        echo "🧪 اختبار الرفع:"
        echo "curl -X POST -F \"file=@public/placeholder-property.jpg\" -F \"propertyId=test-123\" http://localhost:3000/api/upload"
        break
    else
        echo "⏳ Firebase Storage لم يتم إعداده بعد..."
        echo "🔄 سأفحص مرة أخرى خلال 10 ثوانٍ..."
        sleep 10
    fi
done
