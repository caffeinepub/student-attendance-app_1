import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, XCircle, Users, Download, AlertCircle } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { useGetClassSectionStudents } from '../hooks/useStudents';
import { useGetRollCallForDay, useGetMonthlyRollCall } from '../hooks/useRollCall';
import { formatDateDisplay } from '../lib/date';
import { getClassDisplayName } from '../constants/school';
import { useAuth, getAuthErrorMessage } from '../hooks/useAuth';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportMonthlyAttendance } from '../hooks/useMonthlyExport';

export default function SummaryPage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection, selectedDate } = useAttendanceSession();
  const { isAuthenticated, isAuthorized } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [exportYear, setExportYear] = useState<string>(new Date().getFullYear().toString());
  const [exportMonth, setExportMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [isExporting, setIsExporting] = useState(false);

  const { data: students = [] } = useGetClassSectionStudents(
    selectedClass || '',
    selectedSection || ''
  );

  const { data: attendance = {}, error } = useGetRollCallForDay(
    selectedDate || '',
    selectedClass || '',
    selectedSection || ''
  );

  const { data: monthlyRollCalls = [], refetch: refetchMonthly } = useGetMonthlyRollCall(
    parseInt(exportYear) || new Date().getFullYear(),
    exportMonth,
    selectedClass || '',
    selectedSection || ''
  );

  if (!selectedClass || !selectedSection || !selectedDate) {
    navigate({ to: '/class-selection' });
    return null;
  }

  if (error) {
    const authError = getAuthErrorMessage(error);
    return (
      <div className="space-y-6 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/attendance' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Attendance
        </Button>
      </div>
    );
  }

  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
  const totalMarked = presentCount + absentCount;
  const totalStudents = students.length;

  const classDisplayName = getClassDisplayName(selectedClass);

  const handleExportMonthly = async () => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to export attendance data.');
      return;
    }
    if (!isAuthorized) {
      setErrorMessage('You are not authorized to export attendance data.');
      return;
    }

    setIsExporting(true);
    setErrorMessage('');

    try {
      // Refetch to ensure we have latest data
      const { data: latestRollCalls } = await refetchMonthly();
      
      await exportMonthlyAttendance(
        parseInt(exportYear),
        exportMonth,
        selectedClass,
        selectedSection,
        students,
        latestRollCalls || []
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export attendance data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/attendance' })}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Attendance
      </Button>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Attendance Summary</CardTitle>
          <CardDescription>
            {classDisplayName} - Section {selectedSection} | {formatDateDisplay(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Present</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{presentCount}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Absent</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">{absentCount}</p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalStudents}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {totalMarked < totalStudents && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Attendance marked for {totalMarked} out of {totalStudents} students.
                {totalMarked === 0 && ' No attendance has been marked yet.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => navigate({ to: '/attendance' })}
              size="lg"
              className="flex-1"
            >
              Mark Attendance
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Export Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Monthly Attendance Export</CardTitle>
          <CardDescription>
            Download attendance data for {classDisplayName} - Section {selectedSection} as Excel-compatible CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-year">Year</Label>
              <Input
                id="export-year"
                type="number"
                min="2020"
                max="2099"
                value={exportYear}
                onChange={(e) => setExportYear(e.target.value)}
                placeholder="2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-month">Month</Label>
              <Input
                id="export-month"
                type="text"
                maxLength={2}
                value={exportMonth}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                    setExportMonth(val.padStart(2, '0'));
                  }
                }}
                placeholder="01-12"
              />
            </div>
          </div>
          
          <Button
            onClick={handleExportMonthly}
            disabled={!isAuthenticated || !isAuthorized || isExporting || !exportYear || !exportMonth}
            size="lg"
            className="w-full"
          >
            <Download className="w-5 h-5 mr-2" />
            {isExporting ? 'Exporting...' : 'Download Monthly Attendance CSV'}
          </Button>

          {!isAuthenticated && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please log in to export attendance data.</AlertDescription>
            </Alert>
          )}
          
          {isAuthenticated && !isAuthorized && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You are not authorized to export attendance data.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
