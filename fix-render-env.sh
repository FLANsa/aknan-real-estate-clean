#!/bin/bash

# سكريبت إصلاح متغيرات البيئة على Render
echo "🔧 إصلاح متغيرات البيئة على Render..."

# API Key من Render
API_KEY="rnd_fRD7uUFuEcMezJLIRmAxYJGOrl7C"

# Service ID
SERVICE_ID="srv-d3n310j3fgac73a9ov60"
SERVICE_NAME="aknan-real-estate"

echo "🔑 استخدام API Key: ${API_KEY:0:10}..."
echo "🎯 Service ID: $SERVICE_ID"

echo ""
echo "📋 تحديث جميع متغيرات البيئة..."

# تحديث جميع متغيرات البيئة المطلوبة
curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_FIREBASE_API_KEY", "value": "AIzaSyC4X7KX14u61IhcxnSXPHaEwpqDxiQBuMo"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "value": "aknanalkimma-1d85c.firebaseapp.com"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_FIREBASE_PROJECT_ID", "value": "aknanalkimma-1d85c"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "value": "aknanalkimma-1d85c.firebasestorage.app"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "value": "33443406347"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_FIREBASE_APP_ID", "value": "1:33443406347:web:fbfd24eb2ddf591d5f5d0e"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID", "value": "G-CN8FK81S3K"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "FIREBASE_ADMIN_PROJECT_ID", "value": "aknanalkimma-1d85c"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "FIREBASE_ADMIN_CLIENT_EMAIL", "value": "firebase-adminsdk-fbsvc@aknanalkimma-1d85c.iam.gserviceaccount.com"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "ADMIN_EMAILS", "value": "admin@aknan.sa"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_WHATSAPP", "value": "9665XXXXXXX"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_SITE_URL", "value": "https://aknan-real-estate.onrender.com"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "GOOGLE_CLOUD_PROJECT", "value": "aknanalkimma-1d85c"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "GCS_BUCKET", "value": "aknanalkimma-1d85c.firebasestorage.app"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "value": "AIzaSyALKolr0_4M_Oypgk_8fb0ekpBwsYOCEXI"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

# تحديث Private Key
curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"envVar": {"key": "FIREBASE_ADMIN_PRIVATE_KEY", "value": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCLr0RG9fm6j8hh\nagThEGEoyFghLIbtO7YczSrjtbAYZ4KOxRgW0bq64zxiRL2zVxvL/i5uFgvfnVaT\nq9nhZYRxoMzDOkM+nzPLNn06Yku4GsF21XivnlTDN0PjLd6iqhzRcXdUMe/2ft99\nQVzkfo4ESihtj+ZH23wbQRDowRPgwgEKlsEfQDEYb8H6AuohqTWiCAX6HsP1b7qi\nZfMbNRs/P8b3GtWShT33Gnn+8aUi1z7Fy414FrMNgYMS0bys3KY1sYY+Evn2SJJ0\nrp64f0Ked7Z+/N42WgY7EUvKsAMuJGyZq9d3uvmmSmwK8yNDX+GwMevszFsxiEET\ndWk+SKjFAgMBAAECgf9EhctjWXG9qKBj095mNI11CX2HczsSpXgbfjTL/7+i487o\nD/JWlLaazLOSgVDjPpgkOfdiNEPJg9A0y4OBTouU3OJAjb7vDqoZxgvTLY/M1f3n\nOFE71YU/Pp0kP3GNL7tzWHYb7Li1SF0vf3ZSS22KLSwn6FokZfHmbMTJaUNBvdrl\n+IIrIuWO2AKdaRd7BRHc0mRZZ1+CEZfe8S9shdAsKtbS52ijQ6FD5AUQAHFNB7I+\nhzSk2tPZvcXdKsn6M+VilV/DQS++a19oQ/4pyMSRvP5Spv+yGoXPUk67/BSatLB2\nsE8l5lCLYulSjw/mRtoGIDogUzcxt9dN4E83cgECgYEAxXQCZ7ukVpFPIKPUtWUP\n9K+vvmH1KgSe2Tttn2dzRswqARIWpEB24KZ38SZyZNBjoJ0p6thPtaF+lsyT675V\n+GR41TgDzqVoqGDk/ipRyLOa8NJi49dyO+dI/icG0eF0LtXywqkml4xvB7ZLXcU5\nVTDTn1AZGeZogNCxTi1JDsUCgYEAtRo/QzEH7i1IlNmnlZ32wGwGj5yn38TEcWiY\nvlD56iKawq9ZrLvf8+7qUebkfFmkYJ1jDc2wn+mT6dn77t/vEd0ng/sYRqszmDYo\n9c6srrT/+mFjz99KjS3g3ZQdw4yoKxKfjcAN602ZOyKaarHzahRkwKGwsIWGn237\nFUV60gECgYEAww7ViXBe6n3l81KlQQUze/9K2AKhVP73hZYlt0FVKe1q2V/rKhvc\n1BTfjET04Q7UPMjFrhA+vilpisNSpaKD/zwR+mC5shzJhP0jesqHvINhXuIXewlM\n+kyDWT9oh1H3moUUqqS7UR8UWEQHs/yvpK71f/56rZFmT0ravWYTNBkCgYBZxfwM\nK7b5qzrqhoZbVWWm9yW9dPOGqjyS1z24Qd3Q4XyD+3ZhePRIMGu5U9J5jdo9Bme+\nxPLEIn5vEt6fCCSzX0SiWQsspNs7ncVqLBxPsmudyz82IUMMfuyUCkNC12vZhi7P\njp+Xv+ywcrPHJhU6xYc4Mi6rIlWcnGE1py5+AQKBgQCGAAmTulUGrB6L40I20eSG\nRDvkRCu3ZKeejv2bIpsp3SJJap0oR95urqHIa25+4OGsB58QngM8DwVILpIhM6Oe\nHCvTKzelTFTcX1LEyjr89gHGZYAjgy+i6FMVz1YZB6ceS6c1Yp3r0izgjptJymFz\ndzRDHOf26rXjiZg//3w5/Q==\n-----END PRIVATE KEY-----"}}' \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" > /dev/null

echo "✅ تم تحديث جميع متغيرات البيئة"

echo ""
echo "🔄 إعادة تشغيل الخدمة..."
curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    "https://api.render.com/v1/services/$SERVICE_ID/restart" > /dev/null

echo "✅ تم إعادة تشغيل الخدمة"

echo ""
echo "🎉 تم إصلاح متغيرات البيئة على Render!"
echo "🌐 تحقق من موقعك على: https://$SERVICE_NAME.onrender.com"
echo "⏰ انتظر 2-3 دقائق حتى تكتمل عملية إعادة التشغيل"
