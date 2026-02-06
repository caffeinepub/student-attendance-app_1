import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, UserPlus, Users, Trash2, MessageCircle, Settings } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { getStudents, deleteStudent } from '../lib/studentsRepo';
import { Student } from '../lib/types';
import AddStudentDialog from '../components/AddStudentDialog';
import { buildBulkWhatsAppPayload, WhatsAppPayload } from '../lib/whatsapp';
import { renderBulkMessage } from '../lib/whatsappTemplate';
import { getTodayString, getDayOfWeek, formatDateForTemplate } from '../lib/date';
import WhatsAppPreviewDialog from '../components/WhatsAppPreviewDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function StudentListPage() {
  const navigate = useNavigate();
  const { selectedClass, selectedSection } = useAttendanceSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; student: Student | null }>({
    open: false,
    student: null,
  });
  const [whatsappPreview, setWhatsappPreview] = useState<WhatsAppPayload | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      navigate({ to: '/class-selection' });
      return;
    }
    loadStudents();
  }, [selectedClass, selectedSection, navigate]);

  const loadStudents = () => {
    if (selectedClass && selectedSection) {
      const loadedStudents = getStudents(selectedClass, selectedSection);
      setStudents(loadedStudents);
    }
  };

  const handleStudentAdded = () => {
    loadStudents();
    setIsAddDialogOpen(false);
  };

  const handleDeleteClick = (student: Student) => {
    setDeleteConfirm({ open: true, student });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.student && selectedClass && selectedSection) {
      deleteStudent(selectedClass, selectedSection, deleteConfirm.student.id);
      loadStudents();
      setDeleteConfirm({ open: false, student: null });
    }
  };

  const handleMessageAll = () => {
    if (students.length === 0 || !selectedClass || !selectedSection) return;
    
    const today = getTodayString();
    const day = getDayOfWeek(today);
    const formattedDate = formatDateForTemplate(today);
    
    // Students without status (unknown) since we're on student list page
    const studentsWithoutStatus = students.map(student => ({
      name: student.name,
      status: undefined,
    }));
    
    const messageText = renderBulkMessage(
      studentsWithoutStatus,
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

  return (
    <div className="space-y-6 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/class-selection' })}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Student List</CardTitle>
              <CardDescription>
                Class {selectedClass} - Section {selectedSection}
              </CardDescription>
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
              <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No students added yet</p>
              <p className="text-sm">Click "Add Student" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <Card key={student.id} className="bg-accent/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold text-lg">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {student.rollNumber}</p>
                        <p className="text-sm text-muted-foreground">Parent: {student.parentMobile}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(student)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button
            onClick={() => navigate({ to: '/attendance' })}
            disabled={students.length === 0}
            className="w-full h-12 text-lg mt-6"
            size="lg"
          >
            Continue to Attendance
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <AddStudentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onStudentAdded={handleStudentAdded}
      />

      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, student: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirm.student?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WhatsAppPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        payload={whatsappPreview}
        onConfirm={handlePreviewConfirm}
      />
    </div>
  );
}
