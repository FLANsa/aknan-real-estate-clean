#!/bin/bash

# سكريبت تحديث متغيرات البيئة في Render باستخدام CLI
echo "🚀 تحديث متغيرات البيئة في Render..."

# اسم الخدمة في Render
SERVICE_NAME="aknan-real-estate"

echo "📋 تحديث متغيرات Firebase..."

# Firebase Public Variables
render env set "$SERVICE_NAME" "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC4X7KX14u61IhcxnSXPHaEwpqDxiQBuMo" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aknanalkimma-1d85c.firebaseapp.com" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_FIREBASE_PROJECT_ID=aknanalkimma-1d85c" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aknanalkimma-1d85c.firebasestorage.app" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=33443406347" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_FIREBASE_APP_ID=1:33443406347:web:fbfd24eb2ddf591d5f5d0e" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CN8FK81S3K" --confirm

echo "📋 تحديث متغيرات Firebase Admin..."
render env set "$SERVICE_NAME" "FIREBASE_ADMIN_PROJECT_ID=aknanalkimma-1d85c" --confirm
render env set "$SERVICE_NAME" "FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aknanalkimma-1d85c.iam.gserviceaccount.com" --confirm

echo "📋 تحديث متغيرات التطبيق..."
render env set "$SERVICE_NAME" "ADMIN_EMAILS=admin@aknan.sa" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_WHATSAPP=9665XXXXXXX" --confirm
render env set "$SERVICE_NAME" "NEXT_PUBLIC_SITE_URL=https://aknan-real-estate.onrender.com" --confirm

echo "📋 تحديث متغيرات Google Cloud..."
render env set "$SERVICE_NAME" "GOOGLE_CLOUD_PROJECT=aknanalkimma-1d85c" --confirm
render env set "$SERVICE_NAME" "GCS_BUCKET=aknanalkimma-1d85c.appspot.com" --confirm

echo "📋 تحديث متغيرات Google Maps..."
render env set "$SERVICE_NAME" "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyALKolr0_4M_Oypgk_8fb0ekpBwsYOCEXI" --confirm

echo "📋 تحديث Firebase Admin Private Key..."
render env set "$SERVICE_NAME" "FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCLr0RG9fm6j8hh\nagThEGEoyFghLIbtO7YczSrjtbAYZ4KOxRgW0bq64zxiRL2zVxvL/i5uFgvfnVaT\nq9nhZYRxoMzDOkM+nzPLNn06Yku4GsF21XivnlTDN0PjLd6iqhzRcXdUMe/2ft99\nQVzkfo4ESihtj+ZH23wbQRDowRPgwgEKlsEfQDEYb8H6AuohqTWiCAX6HsP1b7qi\nZfMbNRs/P8b3GtWShT33Gnn+8aUi1z7Fy414FrMNgYMS0bys3KY1sYY+Evn2SJJ0\nrp64f0Ked7Z+/N42WgY7EUvKsAMuJGyZq9d3uvmmSmwK8yNDX+GwMevszFsxiEET\ndWk+SKjFAgMBAAECgf9EhctjWXG9qKBj095mNI11CX2HczsSpXgbfjTL/7+i487o\nD/JWlLaazLOSgVDjPpgkOfdiNEPJg9A0y4OBTouU3OJAjb7vDqoZxgvTLY/M1f3n\nOFE71YU/Pp0kP3GNL7tzWHYb7Li1SF0vf3ZSS22KLSwn6FokZfHmbMTJaUNBvdrl\n+IIrIuWO2AKdaRd7BRHc0mRZZ1+CEZfe8S9shdAsKtbS52ijQ6FD5AUQAHFNB7I+\nhzSk2tPZvcXdKsn6M+VilV/DQS++a19oQ/4pyMSRvP5Spv+yGoXPUk67/BSatLB2\nsE8l5lCLYulSjw/mRtoGIDogUzcxt9dN4E83cgECgYEAxXQCZ7ukVpFPIKPUtWUP\n9K+vvmH1KgSe2Tttn2dzRswqARIWpEB24KZ38SZyZNBjoJ0p6thPtaF+lsyT675V\n+GR41TgDzqVoqGDk/ipRyLOa8NJi49dyO+dI/icG0eF0LtXywqkml4xvB7ZLXcU5\nVTDTn1AZGeZogNCxTi1JDsUCgYEAtRo/QzEH7i1IlNmnlZ32wGwGj5yn38TEcWiY\nvlD56iKawq9ZrLvf8+7qUebkfFmkYJ1jDc2wn+mT6dn77t/vEd0ng/sYRqszmDYo\n9c6srrT/+mFjz99KjS3g3ZQdw4yoKxKfjcAN602ZOyKaarHzahRkwKGwsIWGn237\nFUV60gECgYEAww7ViXBe6n3l81KlQQUze/9K2AKhVP73hZYlt0FVKe1q2V/rKhvc\n1BTfjET04Q7UPMjFrhA+vilpisNSpaKD/zwR+mC5shzJhP0jesqHvINhXuIXewlM\n+kyDWT9oh1H3moUUqqS7UR8UWEQHs/yvpK71f/56rZFmT0ravWYTNBkCgYBZxfwM\nK7b5qzrqhoZbVWWm9yW9dPOGqjyS1z24Qd3Q4XyD+3ZhePRIMGu5U9J5jdo9Bme+\nxPLEIn5vEt6fCCSzX0SiWQsspNs7ncVqLBxPsmudyz82IUMMfuyUCkNC12vZhi7P\njp+Xv+ywcrPHJhU6xYc4Mi6rIlWcnGE1py5+AQKBgQCGAAmTulUGrB6L40I20eSG\nRDvkRCu3ZKeejv2bIpsp3SJJap0oR95urqHIa25+4OGsB58QngM8DwVILpIhM6Oe\nHCvTKzelTFTcX1LEyjr89gHGZYAjgy+i6FMVz1YZB6ceS6c1Yp3r0izgjptJymFz\ndzRDHOf26rXjiZg//3w5/Q==\n-----END PRIVATE KEY-----\n" --confirm

echo "🔄 إعادة تشغيل الخدمة..."
render restart "$SERVICE_NAME" --confirm

echo "🎉 تم الانتهاء من تحديث متغيرات البيئة!"
echo "🌐 تحقق من موقعك على: https://$SERVICE_NAME.onrender.com"
