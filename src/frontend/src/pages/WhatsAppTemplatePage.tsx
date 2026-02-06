import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, RotateCcw, Check } from 'lucide-react';
import { 
  getTemplate, 
  saveTemplate, 
  resetTemplate, 
  TEMPLATE_PLACEHOLDERS,
  renderTemplate,
  PlaceholderKey
} from '../lib/whatsappTemplate';
import { useAttendanceSession } from '../state/attendanceSession';
import { getTodayString, getDayOfWeek, formatDateForTemplate } from '../lib/date';
import { Separator } from '@/components/ui/separator';

export default function WhatsAppTemplatePage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection } = useAttendanceSession();
  const [template, setTemplate] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

  useEffect(() => {
    setTemplate(getTemplate());
  }, []);

  const handleSave = () => {
    saveTemplate(template);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    resetTemplate();
    setTemplate(getTemplate());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyPlaceholder = (placeholder: string) => {
    navigator.clipboard.writeText(`{{${placeholder}}}`);
    setCopiedPlaceholder(placeholder);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    setTemplate(prev => prev + `{{${placeholder}}}`);
  };

  const handleBack = () => {
    window.history.back();
  };

  // Generate preview with sample or current session data
  const previewData = {
    studentName: 'राज कुमार',
    classValue: selectedClass || '5',
    section: selectedSection || 'A',
    date: formatDateForTemplate(getTodayString()),
    day: getDayOfWeek(getTodayString()),
    status: 'उपस्थित',
  };

  const previewMessage = renderTemplate(template, previewData);

  return (
    <div className="space-y-6 py-8">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">WhatsApp Message Template</CardTitle>
          <CardDescription>
            Customize the attendance message template sent to parents via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Editor */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-base font-semibold">
              Message Template
            </Label>
            <Textarea
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Enter your message template..."
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use placeholders like {`{{studentName}}`} to insert dynamic values
            </p>
          </div>

          {/* Placeholders */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Available Placeholders</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(TEMPLATE_PLACEHOLDERS).map(([key, description]) => (
                <Card key={key} className="bg-accent/5">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {`{{${key}}}`}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInsertPlaceholder(key)}
                          title="Insert into template"
                          className="h-7 px-2"
                        >
                          Insert
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyPlaceholder(key)}
                          title="Copy placeholder"
                          className="h-7 w-7 p-0"
                        >
                          {copiedPlaceholder === key ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Preview</Label>
              <Badge variant="outline">Sample Data</Badge>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {previewMessage}
                </pre>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">
              Preview uses sample student "राज कुमार" 
              {selectedClass && selectedSection && ` with your current session (Class ${selectedClass}-${selectedSection})`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              size="lg"
              className="flex-1"
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Saved!
                </>
              ) : (
                'Save Template'
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
