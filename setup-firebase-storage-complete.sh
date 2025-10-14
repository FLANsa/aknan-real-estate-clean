#!/bin/bash

# سكريبت إعداد Firebase Storage الكامل
echo "🚀 إعداد Firebase Storage الكامل..."

# فتح Firebase Console
echo "🌐 فتح Firebase Console..."
open "https://console.firebase.google.com/project/aknanalkimma-1d85c/storage"

echo ""
echo "📋 خطوات إعداد Firebase Storage:"
echo "================================"
echo "1. ✅ تم فتح Firebase Console"
echo "2. 🔄 اضغط على 'Get Started' في صفحة Storage"
echo "3. 🔄 اختر 'Start in production mode'"
echo "4. 🔄 اختر الموقع الأقرب (مثل us-central1 أو europe-west1)"
echo "5. 🔄 اضغط 'Done'"
echo ""
echo "⏳ انتظر حتى تكتمل عملية الإعداد..."
echo ""

# انتظار المستخدم
read -p "✅ بعد إكمال الإعداد في Firebase Console، اضغط Enter للمتابعة..."

echo ""
echo "🚀 نشر قواعد Firebase Storage..."

# محاولة نشر القواعد
if firebase deploy --only storage; then
    echo ""
    echo "🎉 تم إعداد Firebase Storage بنجاح!"
    echo "✅ يمكن الآن رفع الصور إلى Google Cloud Storage"
    echo "✅ الصور ستكون متاحة عبر روابط عامة"
    echo ""
    echo "🧪 اختبار الرفع:"
    echo "curl -X POST -F \"file=@public/placeholder-property.jpg\" -F \"propertyId=test-123\" http://localhost:3000/api/upload"
else
    echo ""
    echo "❌ فشل في نشر قواعد Firebase Storage"
    echo "🔍 تحقق من:"
    echo "   - تم إعداد Firebase Storage في Console"
    echo "   - أنت مسجل الدخول إلى Firebase CLI"
    echo "   - المشروع الصحيح محدد"
fi
