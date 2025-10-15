const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'aknanalkimma-1d85c',
  });
}

const next = require('next');

// تعيين خيارات عامة للـ Functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

// إنشاء تطبيق Next.js
const app = next({
  dev: false,
  conf: {
    distDir: '.next',
  },
});

const handle = app.getRequestHandler();

// Firebase Function الرئيسية
exports.nextjsServer = onRequest(
  {
    memory: '1GiB',
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // التأكد من أن Next.js جاهز
      await app.prepare();
      
      // تمرير الطلب إلى Next.js
      await handle(req, res);
    } catch (error) {
      console.error('Error in Next.js server:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

// Function إضافية للصفحة الرئيسية (اختيارية)
exports.nextjsApp = onRequest(
  {
    memory: '512MiB',
    timeoutSeconds: 30,
  },
  async (req, res) => {
    try {
      await app.prepare();
      await handle(req, res);
    } catch (error) {
      console.error('Error in Next.js app:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);
