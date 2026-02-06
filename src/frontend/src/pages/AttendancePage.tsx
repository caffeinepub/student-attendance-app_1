import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Calendar, MessageCircle, Settings } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { getStudents } from '../lib/studentsRepo';
import { getAttendanceForDate, saveAttendance } from '../lib/attendanceRepo';
import { Student, AttendanceStatus } from '../lib/types';
import { getTodayString, formatDateDisplay, getDayOfWeek, formatDateForTemplate } from '../lib/date';
import StudentAttendanceRow from '../components/StudentAttendanceRow';
import { buildBulkWhatsAppPayload, buildSingleWhatsAppPayload, WhatsAppPayload } from '../lib/whatsapp';
import { renderBulkMessage, renderStudentMessage } from '../lib/whatsappTemplate';
import WhatsAppPreviewDialog from '../components/WhatsAppPreviewDialog';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection, selectedDate, setSelectedDate } = useAttendanceSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [whatsappPreview, setWhatsappPreview] = useState<WhatsAppPayload | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleSingleWhatsAppClick = (student: Student, status: AttendanceStatus) => {
    if (!selectedDate || !selectedClass || !selectedSection) return;

    const day = getDayOfWeek(selectedDate);
    const formattedDate = formatDateForTemplate(selectedDate);

    const messageText = renderStudentMessage(
      student.name,
      selectedClass,
      selectedSection,
      formattedDate,
      day,
      status
    );

    const payload = buildSingleWhatsAppPayload(
      student.parentMobile,
      messageText,
      student.name
    );

    setWhatsappPreview(payload);
    setIsPreviewOpen(true);
  };

  const handleMessageAll = () => {
    if (students.length === 0 || !selectedDate || !selectedClass || !selectedSection) return;
    
    const studentsWithStatus = students.map(student => ({
      name: student.name,
      status: attendance[student.id],
    }));
    
    const day = getDayOfWeek(selectedDate);
    const formattedDate = formatDateForTemplate(selectedDate);
    
    const messageText = renderBulkMessage(
      studentsWithStatus,
      selectedClass,
      selectedSection,
      formattedDate,
      day
    );
    
    const payload = buildBulkWhatsAppPayload(students, messageText);
    setWhatsappPreview(payload);
    setIsPreviewOpen(true);
  };

  const handlePreviewConfirm = () => {
    if (whatsappPreview?.waUrl) {
      window.open(whatsappPreview.waUrl, '_blank');
    }
  };

  const markedCount = Object.keys(attendance).length;
  const totalCount = students.length;
  
  const currentDay = selectedDate ? getDayOfWeek(selectedDate) : '';
  const formattedDate = selectedDate ? formatDateForTemplate(selectedDate) : '';

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
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate({ to: '/whatsapp-template' })}
                variant="outline"
                size="lg"
                title="Edit WhatsApp template"
              >
                <Settings className="w-5 h-5" />
              </Button>
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
                  onWhatsAppClick={() => handleSingleWhatsAppClick(student, attendance[student.id])}
                  classValue={selectedClass || ''}
                  section={selectedSection || ''}
                  date={formattedDate}
                  day={currentDay}
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

      <WhatsAppPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        payload={whatsappPreview}
        onConfirm={handlePreviewConfirm}
      />
    </div>
  );
}
