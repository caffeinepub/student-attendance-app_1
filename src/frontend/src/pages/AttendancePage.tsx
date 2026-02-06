import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Calendar, MessageCircle } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { getStudents } from '../lib/studentsRepo';
import { getAttendanceForDate, saveAttendance } from '../lib/attendanceRepo';
import { Student, AttendanceStatus } from '../lib/types';
import { getTodayString, formatDateDisplay } from '../lib/date';
import StudentAttendanceRow from '../components/StudentAttendanceRow';
import { buildBulkWhatsAppLink } from '../lib/whatsapp';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection, selectedDate, setSelectedDate } = useAttendanceSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      navigate({ to: '/class-selection' });
      return;
    }

    const today = getTodayString();
    setSelectedDate(today);

    const loadedStudents = getStudents(selectedClass, selectedSection);
    setStudents(loadedStudents);

    const existingAttendance = getAttendanceForDate(today, selectedClass, selectedSection);
    setAttendance(existingAttendance);
  }, [selectedClass, selectedSection, navigate, setSelectedDate]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    const newAttendance = { ...attendance, [studentId]: status };
    setAttendance(newAttendance);
    
    if (selectedDate && selectedClass && selectedSection) {
      saveAttendance(selectedDate, selectedClass, selectedSection, newAttendance);
    }
  };

  const handleMessageAll = () => {
    if (students.length === 0) return;
    const message = `Attendance update for ${formatDateDisplay(selectedDate || getTodayString())} - Class ${selectedClass} Section ${selectedSection}`;
    const url = buildBulkWhatsAppLink(students, message);
    window.open(url, '_blank');
  };

  const markedCount = Object.keys(attendance).length;
  const totalCount = students.length;

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
            <div className="flex-1">
              <CardTitle className="text-2xl">Mark Attendance</CardTitle>
              <CardDescription className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                {formatDateDisplay(selectedDate || getTodayString())} • Class {selectedClass} - Section {selectedSection}
              </CardDescription>
              <div className="text-sm text-muted-foreground pt-2">
                Marked: {markedCount} / {totalCount}
              </div>
            </div>
            <Button 
              onClick={handleMessageAll} 
              disabled={students.length === 0}
              variant="outline"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Message All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No students found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <StudentAttendanceRow
                  key={student.id}
                  student={student}
                  status={attendance[student.id]}
                  onStatusChange={(status) => handleAttendanceChange(student.id, status)}
                />
              ))}
            </div>
          )}

          <Button
            onClick={() => navigate({ to: '/summary' })}
            className="w-full h-12 text-lg mt-6"
            size="lg"
          >
            View Summary
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
