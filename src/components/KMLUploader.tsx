'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { parseKMLFile, KMLPolygon } from '@/lib/kml-parser';

interface KMLUploaderProps {
  onPlotsImported: (plots: KMLPolygon[]) => void;
  projectName?: string;
}

export default function KMLUploader({ onPlotsImported, projectName }: KMLUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewPlots, setPreviewPlots] = useState<KMLPolygon[]>([]);
  const [isShowingPreview, setIsShowingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    setPreviewPlots([]);
    setIsShowingPreview(false);

    try {
      const result = await parseKMLFile(file);

      if (result.errors.length > 0) {
        setError(result.errors.join(' '));
        setIsUploading(false);
        return;
      }

      if (result.polygons.length === 0) {
        setError('لم يتم العثور على مضلعات في الملف.');
        setIsUploading(false);
        return;
      }

      // Show preview
      setPreviewPlots(result.polygons);
      setIsShowingPreview(true);
      setIsUploading(false);
    } catch (err) {
      console.error('Error processing KML file:', err);
      setError('حدث خطأ أثناء معالجة الملف.');
      setIsUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    onPlotsImported(previewPlots);
    setPreviewPlots([]);
    setIsShowingPreview(false);
  };

  const handleCancel = () => {
    setPreviewPlots([]);
    setIsShowingPreview(false);
    setError('');
  };

  return (
    <div className="space-y-4">
      {!isShowingPreview ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              رفع ملف KML/KMZ
            </CardTitle>
            <CardDescription>
              استيراد القطع من ملف KML أو KMZ
              {projectName && ` لمشروع ${projectName}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 hover:border-muted-foreground/50 transition-colors">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4 text-center">
                اسحب وأفلت ملف KML أو KMZ هنا، أو انقر للاختيار
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".kml,.kmz"
                onChange={handleFileSelect}
                className="hidden"
                id="kml-file-input"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 ml-2" />
                    اختر ملف
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>ملاحظات:</strong></p>
              <ul className="list-disc list-inside space-y-1 mr-2">
                <li>يدعم ملفات KML و KMZ فقط</li>
                <li>يجب أن يحتوي الملف على مضلعات (Polygons)</li>
                <li>سيتم حساب المساحة تلقائياً لكل قطعة</li>
                <li>يمكنك معاينة القطع قبل الاستيراد</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              معاينة القطع المستوردة
            </CardTitle>
            <CardDescription>
              تم العثور على {previewPlots.length} قطعة. راجع البيانات قبل الاستيراد.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {previewPlots.map((plot, index) => (
                <div
                  key={plot.id || index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{plot.name || `قطعة ${index + 1}`}</h4>
                      </div>
                      {plot.description && (
                        <p className="text-sm text-muted-foreground mb-2">{plot.description}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span>
                          <strong>المساحة:</strong> {plot.areaM2?.toLocaleString('ar-SA') || 0} م²
                        </span>
                        <span>
                          <strong>نقاط الحدود:</strong> {plot.coordinates.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
              <Button onClick={handleImport}>
                <CheckCircle className="h-4 w-4 ml-2" />
                استيراد {previewPlots.length} قطعة
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


