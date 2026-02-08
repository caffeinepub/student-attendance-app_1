import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, CheckCircle2, XCircle, Calendar, Loader2 } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { useGetRollCallForDay } from '../hooks/useRollCall';
import { formatDateDisplay } from '../lib/date';
import { getClassDisplayName } from '../constants/school';

export default function SummaryPage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection, selectedDate } = useAttendanceSession();
  const [summary, setSummary] = useState({ present: 0, absent: 0, total: 0 });

  const { data: rollCallData, isLoading } = useGetRollCallForDay(
    selectedDate || '',
    selectedClass || '',
    selectedSection || ''
  );

  useEffect(() => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      navigate({ to: '/class-selection' });
      return;
    }
  }, [selectedClass, selectedSection, selectedDate, navigate]);

  useEffect(() => {
    if (rollCallData) {
      let present = 0;
      let absent = 0;
      
      Object.values(rollCallData).forEach(status => {
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
      });
      
      setSummary({
        present,
        absent,
        total: present + absent,
      });
    }
  }, [rollCallData]);

  const classDisplayName = selectedClass ? getClassDisplayName(selectedClass) : '';

  return (
    <div className="space-y-6 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/attendance' })}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Attendance Summary</CardTitle>
          <CardDescription className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            {formatDateDisplay(selectedDate || '')} • {classDisplayName} - Section {selectedSection}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p className="text-lg">Loading summary...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-muted-foreground mb-1">Total Present</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">{summary.present}</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                  <CardContent className="p-6 text-center">
                    <XCircle className="w-12 h-12 mx-auto mb-3 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-muted-foreground mb-1">Total Absent</p>
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400">{summary.absent}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-accent/5">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                  <p className="text-3xl font-bold">{summary.total}</p>
                  {summary.total > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Attendance Rate: {Math.round((summary.present / summary.total) * 100)}%
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => navigate({ to: '/attendance' })}
              variant="outline"
              className="flex-1 h-12"
              size="lg"
            >
              Edit Attendance
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              className="flex-1 h-12"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
