#!/bin/bash

# سكريبت فتح Firebase Storage Console
echo "🚀 فتح Firebase Storage Console..."

# فتح Firebase Console
echo "🌐 فتح Firebase Console..."
open "https://console.firebase.google.com/project/aknanalkimma-1d85c/storage"

echo ""
echo "📋 خطوات إعداد Firebase Storage:"
echo "================================"
echo "1. ✅ تم فتح Firebase Console"
echo "2. 🔄 ستظهر صفحة Storage"
echo "3. 🔄 اضغط على 'Get Started'"
echo "4. 🔄 اختر 'Start in production mode'"
echo "5. 🔄 اختر الموقع الأقرب:"
echo "   - us-central1 (الأمريكتان)"
echo "   - europe-west1 (أوروبا)"
echo "   - asia-southeast1 (آسيا)"
echo "6. 🔄 اضغط 'Done'"
echo "7. ⏳ انتظر حتى تكتمل العملية (1-2 دقيقة)"
echo ""
echo "💡 بعد إكمال الإعداد، استخدم هذا الأمر:"
echo "firebase deploy --only storage"
echo ""
echo "🧪 ثم اختبر الرفع:"
echo "curl -X POST -F \"file=@public/placeholder-property.jpg\" -F \"propertyId=test-123\" http://localhost:3000/api/upload"
