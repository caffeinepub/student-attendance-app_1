import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Calendar, Users } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { useGetClassSectionStudents } from '../hooks/useStudents';
import { useSaveRollCallForDay, useGetRollCallForDay } from '../hooks/useRollCall';
import StudentAttendanceRow from '../components/StudentAttendanceRow';
import { getTodayString, formatDateDisplay, getDayOfWeek, formatDateForTemplate } from '../lib/date';
import { getClassDisplayName } from '../constants/school';
import { StoredStudent } from '../backend';
import { AttendanceStatus } from '../lib/types';
import { buildSingleWhatsAppPayload } from '../lib/whatsapp';
import { renderStudentMessage } from '../lib/whatsappTemplate';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection, selectedDate } = useAttendanceSession();
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: students = [], isLoading } = useGetClassSectionStudents(
    selectedClass || '',
    selectedSection || ''
  );
  const { data: existingRollCall } = useGetRollCallForDay(
    selectedDate || getTodayString(),
    selectedClass || '',
    selectedSection || ''
  );
  const saveRollCallMutation = useSaveRollCallForDay();

  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      navigate({ to: '/class-selection' });
      return;
    }
  }, [selectedClass, selectedSection, navigate]);

  useEffect(() => {
    if (existingRollCall && students.length > 0) {
      setAttendance(existingRollCall);
    }
  }, [existingRollCall, students]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) return;

    await saveRollCallMutation.mutateAsync({
      date: selectedDate,
      className: selectedClass,
      section: selectedSection,
      attendance,
    });

    setHasChanges(false);
  };

  const handleContinue = async () => {
    if (hasChanges) {
      await handleSave();
    }
    navigate({ to: '/summary' });
  };

  const handleWhatsAppClick = (student: StoredStudent) => {
    const status = attendance[student.id.toString()];
    if (!status || !selectedClass || !selectedSection || !selectedDate) return;

    const day = getDayOfWeek(selectedDate);
    const formattedDate = formatDateForTemplate(selectedDate);

    const messageText = renderStudentMessage(
      student.student.fullName,
      selectedClass,
      selectedSection,
      formattedDate,
      day,
      status
    );

    const payload = buildSingleWhatsAppPayload(
      student.student.parentMobileNumber,
      messageText,
      student.student.fullName
    );
    window.open(payload.waUrl, '_blank');
  };

  const classDisplayName = selectedClass ? getClassDisplayName(selectedClass) : '';
  const dateDisplay = selectedDate ? formatDateDisplay(selectedDate) : '';

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

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Mark Attendance</CardTitle>
              <CardDescription>
                {classDisplayName} - Section {selectedSection}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{dateDisplay}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No students found</p>
              <p className="text-sm">Add students to start marking attendance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((storedStudent: StoredStudent) => (
                <StudentAttendanceRow
                  key={storedStudent.id.toString()}
                  student={{
                    id: storedStudent.id.toString(),
                    name: storedStudent.student.fullName,
                    rollNumber: storedStudent.student.rollNumber.toString(),
                    parentMobile: storedStudent.student.parentMobileNumber,
                  }}
                  status={attendance[storedStudent.id.toString()]}
                  onStatusChange={(status) =>
                    handleAttendanceChange(storedStudent.id.toString(), status)
                  }
                  onWhatsAppClick={() => handleWhatsAppClick(storedStudent)}
                  classValue={selectedClass || ''}
                  section={selectedSection || ''}
                  date={selectedDate || getTodayString()}
                  day={getDayOfWeek(selectedDate || getTodayString())}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="flex justify-between">
          <Button
            onClick={handleSave}
            variant="outline"
            size="lg"
            disabled={!hasChanges || saveRollCallMutation.isPending}
          >
            {saveRollCallMutation.isPending ? 'Saving...' : 'Save Progress'}
          </Button>
          <Button onClick={handleContinue} size="lg" className="gap-2">
            Continue to Summary
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
