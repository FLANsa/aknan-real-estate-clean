#!/bin/bash

# سكريبت تحديث اسم الـ bucket على Render
echo "🚀 تحديث اسم الـ bucket على Render..."

# API Key من Render
API_KEY="rnd_fRD7uUFuEcMezJLIRmAxYJGOrl7C"

# Service ID
SERVICE_ID="srv-d3n310j3fgac73a9ov60"
SERVICE_NAME="aknan-real-estate"

echo "🔑 استخدام API Key: ${API_KEY:0:10}..."
echo "🎯 Service ID: $SERVICE_ID"

echo ""
echo "🔄 تحديث GCS_BUCKET..."

# تحديث GCS_BUCKET
curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "GCS_BUCKET", "value": "aknanalkimma-1d85c.firebasestorage.app"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" | jq '.' 2>/dev/null || echo "تم الإرسال"

echo ""
echo "🔄 إعادة تشغيل الخدمة..."
curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    "https://api.render.com/v1/services/$SERVICE_ID/restart" | jq '.' 2>/dev/null || echo "تم إرسال طلب إعادة التشغيل"

echo ""
echo "🎉 تم تحديث اسم الـ bucket على Render!"
echo "🌐 تحقق من موقعك على: https://$SERVICE_NAME.onrender.com"
echo "⏰ انتظر بضع دقائق حتى تكتمل عملية إعادة التشغيل"
