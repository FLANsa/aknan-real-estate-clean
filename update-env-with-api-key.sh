#!/bin/bash

# سكريبت تحديث متغيرات البيئة في Render باستخدام API Key
echo "🚀 تحديث متغيرات البيئة في Render باستخدام API Key..."

# API Key من Render
API_KEY="rnd_fRD7uUFuEcMezJLIRmAxYJGOrl7C"

# اسم الخدمة في Render
SERVICE_NAME="aknan-real-estate"

echo "🔑 استخدام API Key: ${API_KEY:0:10}..."

# الحصول على Service ID
echo "🔍 البحث عن Service ID..."
SERVICE_RESPONSE=$(curl -s -H "Authorization: Bearer $API_KEY" \
    "https://api.render.com/v1/services")

echo "📋 الاستجابة من API:"
echo "$SERVICE_RESPONSE" | jq '.' 2>/dev/null || echo "$SERVICE_RESPONSE"

# البحث عن Service ID
SERVICE_ID=$(echo "$SERVICE_RESPONSE" | jq -r ".services[] | select(.name == \"$SERVICE_NAME\") | .id" 2>/dev/null)

if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    echo "❌ لم يتم العثور على الخدمة: $SERVICE_NAME"
    echo "📋 الخدمات المتاحة:"
    echo "$SERVICE_RESPONSE" | jq -r ".services[] | .name" 2>/dev/null || echo "فشل في تحليل الاستجابة"
    exit 1
fi

echo "✅ تم العثور على Service ID: $SERVICE_ID"

# قائمة متغيرات البيئة المطلوبة
declare -A ENV_VARS=(
    ["NEXT_PUBLIC_FIREBASE_API_KEY"]="AIzaSyC4X7KX14u61IhcxnSXPHaEwpqDxiQBuMo"
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"]="aknanalkimma-1d85c.firebaseapp.com"
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]="aknanalkimma-1d85c"
    ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"]="aknanalkimma-1d85c.firebasestorage.app"
    ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"]="33443406347"
    ["NEXT_PUBLIC_FIREBASE_APP_ID"]="1:33443406347:web:fbfd24eb2ddf591d5f5d0e"
    ["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"]="G-CN8FK81S3K"
    ["FIREBASE_ADMIN_PROJECT_ID"]="aknanalkimma-1d85c"
    ["FIREBASE_ADMIN_CLIENT_EMAIL"]="firebase-adminsdk-fbsvc@aknanalkimma-1d85c.iam.gserviceaccount.com"
    ["ADMIN_EMAILS"]="admin@aknan.sa"
    ["NEXT_PUBLIC_WHATSAPP"]="9665XXXXXXX"
    ["NEXT_PUBLIC_SITE_URL"]="https://aknan-real-estate.onrender.com"
    ["GOOGLE_CLOUD_PROJECT"]="aknanalkimma-1d85c"
    ["GCS_BUCKET"]="aknanalkimma-1d85c.appspot.com"
    ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"]="AIzaSyALKolr0_4M_Oypgk_8fb0ekpBwsYOCEXI"
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

echo ""
echo "📋 تحديث متغيرات البيئة..."

# تحديث المتغيرات العادية
for var in "${!ENV_VARS[@]}"; do
    echo "🔄 تحديث $var..."
    
    # إنشاء JSON للطلب
    JSON_DATA=$(jq -n --arg key "$var" --arg value "${ENV_VARS[$var]}" \
        '{envVar: {key: $key, value: $value}}')
    
    # إرسال الطلب
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "$JSON_DATA" \
        "https://api.render.com/v1/services/$SERVICE_ID/env-vars")
    
    echo "📄 استجابة تحديث $var:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    if echo "$RESPONSE" | jq -e '.envVar' > /dev/null 2>&1; then
        echo "✅ تم تحديث $var بنجاح"
    else
        echo "❌ فشل في تحديث $var"
    fi
    echo ""
done

# تحديث Private Key بشكل منفصل
echo "🔄 تحديث FIREBASE_ADMIN_PRIVATE_KEY..."
JSON_DATA=$(jq -n --arg key "FIREBASE_ADMIN_PRIVATE_KEY" --arg value "$FIREBASE_ADMIN_PRIVATE_KEY" \
    '{envVar: {key: $key, value: $value}}')

RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA" \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars")

echo "📄 استجابة تحديث FIREBASE_ADMIN_PRIVATE_KEY:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

if echo "$RESPONSE" | jq -e '.envVar' > /dev/null 2>&1; then
    echo "✅ تم تحديث FIREBASE_ADMIN_PRIVATE_KEY بنجاح"
else
    echo "❌ فشل في تحديث FIREBASE_ADMIN_PRIVATE_KEY"
fi

echo ""
echo "🔄 إعادة تشغيل الخدمة..."
RESTART_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    "https://api.render.com/v1/services/$SERVICE_ID/restart")

echo "📄 استجابة إعادة التشغيل:"
echo "$RESTART_RESPONSE" | jq '.' 2>/dev/null || echo "$RESTART_RESPONSE"

if echo "$RESTART_RESPONSE" | jq -e '.service' > /dev/null 2>&1; then
    echo "✅ تم إعادة تشغيل الخدمة بنجاح"
else
    echo "❌ فشل في إعادة تشغيل الخدمة"
fi

echo ""
echo "🎉 تم الانتهاء من تحديث متغيرات البيئة!"
echo "🌐 تحقق من موقعك على: https://$SERVICE_NAME.onrender.com"
