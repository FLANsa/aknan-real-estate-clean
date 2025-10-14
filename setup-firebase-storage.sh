#!/bin/bash

# سكريبت إعداد Firebase Storage
echo "🔧 إعداد Firebase Storage..."

# التحقق من تسجيل الدخول إلى Firebase
if ! firebase projects:list >/dev/null 2>&1; then
    echo "❌ لم يتم تسجيل الدخول إلى Firebase"
    echo "🔐 يرجى تسجيل الدخول باستخدام: firebase login"
    exit 1
fi

echo "✅ تم تسجيل الدخول إلى Firebase"

# التحقق من المشروع الحالي
CURRENT_PROJECT=$(firebase use --json | jq -r '.current')
echo "📋 المشروع الحالي: $CURRENT_PROJECT"

if [ "$CURRENT_PROJECT" != "aknanalkimma-1d85c" ]; then
    echo "🔄 تغيير المشروع إلى aknanalkimma-1d85c..."
    firebase use aknanalkimma-1d85c
fi

echo ""
echo "📋 تعليمات إعداد Firebase Storage:"
echo "================================"
echo "1. اذهب إلى: https://console.firebase.google.com/project/aknanalkimma-1d85c/storage"
echo "2. اضغط على 'Get Started'"
echo "3. اختر 'Start in test mode' أو 'Start in production mode'"
echo "4. اختر الموقع الأقرب (مثل us-central1)"
echo "5. اضغط 'Done'"
echo ""
echo "بعد إعداد Firebase Storage، استخدم هذا الأمر لنشر القواعد:"
echo "firebase deploy --only storage"
echo ""
echo "💡 ملاحظة: Firebase Storage يجب إعداده يدوياً من خلال Console"
