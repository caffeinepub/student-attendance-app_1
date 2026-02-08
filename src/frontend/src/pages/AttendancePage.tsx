import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { useGetClassSectionStudents } from '../hooks/useStudents';
import { useGetRollCallForDay, useSaveRollCallForDay } from '../hooks/useRollCall';
import { AttendanceStatus, Student } from '../lib/types';
import StudentAttendanceRow from '../components/StudentAttendanceRow';
import { formatDateDisplay } from '../lib/date';
import { getClassDisplayName } from '../constants/school';
import { useAuth, getAuthErrorMessage } from '../hooks/useAuth';
import { renderStudentMessage } from '../lib/whatsappTemplate';
import { buildSingleWhatsAppPayload } from '../lib/whatsapp';
import { getTodayString, getDayOfWeek, formatDateForTemplate } from '../lib/date';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection, selectedDate } = useAttendanceSession();
  const { isAuthenticated, isAuthorized } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useGetClassSectionStudents(
    selectedClass || '',
    selectedSection || ''
  );

  const { data: savedAttendance = {}, isLoading: attendanceLoading } = useGetRollCallForDay(
    selectedDate || '',
    selectedClass || '',
    selectedSection || ''
  );

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const saveRollCallMutation = useSaveRollCallForDay();

  useEffect(() => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      navigate({ to: '/class-selection' });
      return;
    }
  }, [selectedClass, selectedSection, selectedDate, navigate]);

  useEffect(() => {
    if (savedAttendance && Object.keys(savedAttendance).length > 0) {
      setAttendance(savedAttendance);
    }
  }, [savedAttendance]);

  useEffect(() => {
    if (studentsError) {
      setErrorMessage(getAuthErrorMessage(studentsError));
    }
  }, [studentsError]);

  const handleAttendanceChange = (studentId: string) => (status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to save attendance.');
      return;
    }
    if (!isAuthorized) {
      setErrorMessage('You are not authorized to save attendance.');
      return;
    }
    if (!selectedDate || !selectedClass || !selectedSection) {
      setErrorMessage('Missing required information.');
      return;
    }

    try {
      await saveRollCallMutation.mutateAsync({
        date: selectedDate,
        className: selectedClass,
        section: selectedSection,
        attendance,
      });
      setErrorMessage('');
      navigate({ to: '/summary' });
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    }
  };

  const handleWhatsAppMessage = (studentId: string, studentName: string, parentMobile: string) => () => {
    const status = attendance[studentId];
    if (!status) return;

    const today = selectedDate || getTodayString();
    const day = getDayOfWeek(today);
    const formattedDate = formatDateForTemplate(today);

    const messageText = renderStudentMessage(
      studentName,
      selectedClass || '',
      selectedSection || '',
      formattedDate,
      day,
      status
    );

    const payload = buildSingleWhatsAppPayload(
      parentMobile,
      messageText
    );

    if (payload.waUrl) {
      window.open(payload.waUrl, '_blank');
    }
  };

  const classDisplayName = selectedClass ? getClassDisplayName(selectedClass) : '';

  // Prepare date and day for StudentAttendanceRow
  const today = selectedDate || getTodayString();
  const day = getDayOfWeek(today);
  const formattedDate = formatDateForTemplate(today);

  if (studentsLoading || attendanceLoading) {
    return (
      <div className="space-y-6 py-8">
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to mark attendance.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="space-y-6 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You are not authorized to mark attendance.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/student-list' })}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Mark Attendance</CardTitle>
          <CardDescription>
            {classDisplayName} - Section {selectedSection} | {formatDateDisplay(selectedDate || '')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No students found in this class.</p>
              <Button
                onClick={() => navigate({ to: '/student-list' })}
                className="mt-4"
              >
                Go to Student List
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {students.map((storedStudent) => {
                  const studentId = storedStudent.id.toString();
                  const legacyStudent: Student = {
                    id: studentId,
                    name: storedStudent.student.fullName,
                    rollNumber: storedStudent.student.rollNumber.toString(),
                    parentMobile: storedStudent.student.parentMobileNumber,
                  };

                  return (
                    <StudentAttendanceRow
                      key={studentId}
                      student={legacyStudent}
                      status={attendance[studentId]}
                      onStatusChange={handleAttendanceChange(studentId)}
                      onWhatsAppClick={handleWhatsAppMessage(
                        studentId,
                        storedStudent.student.fullName,
                        storedStudent.student.parentMobileNumber
                      )}
                      classValue={selectedClass || ''}
                      section={selectedSection || ''}
                      date={formattedDate}
                      day={day}
                    />
                  );
                })}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saveRollCallMutation.isPending}
                  size="lg"
                  className="flex-1"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saveRollCallMutation.isPending ? 'Saving...' : 'Save Attendance'}
                </Button>
                <Button
                  onClick={() => navigate({ to: '/summary' })}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  View Summary
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
