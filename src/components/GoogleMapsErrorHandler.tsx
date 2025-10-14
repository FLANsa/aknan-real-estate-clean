'use client';

import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface GoogleMapsErrorHandlerProps {
  error?: Error | null;
  onRetry?: () => void;
}

export default function GoogleMapsErrorHandler({ error, onRetry }: GoogleMapsErrorHandlerProps) {
  if (!error) return null;

  const isBillingError = error.message?.includes('BillingNotEnabledMapError');
  const isApiKeyError = error.message?.includes('InvalidKeyMapError');

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div>
          <strong>خطأ في تحميل خرائط جوجل:</strong>
        </div>
        
        {isBillingError && (
          <div className="space-y-3">
            <p className="font-medium">يجب تفعيل الفوترة في حساب Google Cloud لاستخدام خرائط جوجل.</p>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> Google Maps يعطي $200 شهرياً مجاناً للاستخدام الأساسي. 
                إضافة بطاقة ائتمان مطلوبة للتحقق من الهوية فقط.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a 
                  href="https://console.cloud.google.com/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 ml-1" />
                  تفعيل الفوترة
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a 
                  href="https://console.cloud.google.com/apis/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 ml-1" />
                  تفعيل APIs
                </a>
              </Button>
              {onRetry && (
                <Button size="sm" onClick={onRetry}>
                  إعادة المحاولة
                </Button>
              )}
            </div>
          </div>
        )}

        {isApiKeyError && (
          <div className="space-y-2">
            <p>مفتاح API غير صحيح أو غير مفعل.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 ml-1" />
                  إدارة مفاتيح API
                </a>
              </Button>
              {onRetry && (
                <Button size="sm" onClick={onRetry}>
                  إعادة المحاولة
                </Button>
              )}
            </div>
          </div>
        )}

        {!isBillingError && !isApiKeyError && (
          <div className="space-y-2">
            <p>حدث خطأ غير متوقع في تحميل خرائط جوجل.</p>
            {onRetry && (
              <Button size="sm" onClick={onRetry}>
                إعادة المحاولة
              </Button>
            )}
          </div>
        )}

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">تفاصيل الخطأ</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      </AlertDescription>
    </Alert>
  );
}
