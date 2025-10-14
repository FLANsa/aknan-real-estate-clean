// سكريبت اختبار رفع الصور
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  try {
    console.log('🧪 اختبار رفع الصور...');
    
    // استخدام صورة موجودة للاختبار
    const testImagePath = path.join(__dirname, 'public', 'placeholder-property.jpg');
    
    // التحقق من وجود صورة تجريبية
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ لم يتم العثور على صورة تجريبية في public/placeholder-property.jpg');
      console.log('💡 يرجى إضافة صورة تجريبية أو استخدام صورة موجودة');
      return;
    }
    
    const FormData = require('form-data');
    const fetch = require('node-fetch');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath));
    form.append('propertyId', 'test-property-123');
    
    console.log('📤 رفع الصورة...');
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form,
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ تم رفع الصورة بنجاح!');
      console.log('🔗 رابط الصورة:', result.url);
      console.log('📁 مسار الملف:', result.path);
    } else {
      console.log('❌ فشل في رفع الصورة');
      console.log('📄 تفاصيل الخطأ:', result);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار
testImageUpload();
