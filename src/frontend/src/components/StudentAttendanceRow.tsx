import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { Student, AttendanceStatus } from '../lib/types';
import { buildWhatsAppLink } from '../lib/whatsapp';

interface StudentAttendanceRowProps {
  student: Student;
  status?: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus) => void;
}

export default function StudentAttendanceRow({ student, status, onStatusChange }: StudentAttendanceRowProps) {
  const handleWhatsApp = () => {
    if (status) {
      const url = buildWhatsAppLink(student.parentMobile, status);
      window.open(url, '_blank');
    }
  };

  return (
    <Card className={`transition-all ${status === 'present' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : status === 'absent' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-accent/5'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-base truncate">{student.name}</p>
              {status && (
                <Badge variant={status === 'present' ? 'default' : 'destructive'} className="shrink-0">
                  {status === 'present' ? 'Present' : 'Absent'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant={status === 'present' ? 'default' : 'outline'}
              onClick={() => onStatusChange('present')}
              className={status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Present
            </Button>
            <Button
              size="sm"
              variant={status === 'absent' ? 'destructive' : 'outline'}
              onClick={() => onStatusChange('absent')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Absent
            </Button>
            {status && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleWhatsApp}
                title="Send WhatsApp message"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
