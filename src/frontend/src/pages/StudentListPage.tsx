import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, UserPlus, Users, Trash2, MessageCircle, Settings, AlertCircle, Pencil, RefreshCw } from 'lucide-react';
import { useAttendanceSession } from '../state/attendanceSession';
import { useGetClassSectionStudents, useDeleteStudent, useGetAllStudents } from '../hooks/useStudents';
import { useAuth, getAuthErrorMessage } from '../hooks/useAuth';
import { StoredStudent } from '../backend';
import AddStudentDialog from '../components/AddStudentDialog';
import EditStudentDialog from '../components/EditStudentDialog';
import { buildBulkWhatsAppPayload, WhatsAppPayload } from '../lib/whatsapp';
import { renderBulkMessage } from '../lib/whatsappTemplate';
import { getTodayString, getDayOfWeek, formatDateForTemplate } from '../lib/date';
import WhatsAppPreviewDialog from '../components/WhatsAppPreviewDialog';
import { getClassDisplayName } from '../constants/school';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const { isAuthenticated, isAuthorized } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<StoredStudent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; student: StoredStudent | null }>({
    open: false,
    student: null,
  });
  const [whatsappPreview, setWhatsappPreview] = useState<WhatsAppPayload | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const { data: students = [], isLoading, error, isFetched } = useGetClassSectionStudents(
    selectedClass || '',
    selectedSection || ''
  );
  const { data: allStudents = [], refetch: refetchAllStudents } = useGetAllStudents();
  const deleteStudentMutation = useDeleteStudent();

  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      navigate({ to: '/class-selection' });
      return;
    }
  }, [selectedClass, selectedSection, navigate]);

  useEffect(() => {
    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  }, [error]);

  const handleEditClick = (student: StoredStudent) => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to edit students.');
      return;
    }
    if (!isAuthorized) {
      setErrorMessage('You are not authorized to edit students.');
      return;
    }
    setEditStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (student: StoredStudent) => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to delete students.');
      return;
    }
    if (!isAuthorized) {
      setErrorMessage('You are not authorized to delete students.');
      return;
    }
    setDeleteConfirm({ open: true, student });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.student && selectedClass && selectedSection) {
      try {
        await deleteStudentMutation.mutateAsync({
          studentId: deleteConfirm.student.id,
          className: selectedClass,
          section: selectedSection,
        });
        setDeleteConfirm({ open: false, student: null });
        setErrorMessage('');
      } catch (err) {
        setErrorMessage(getAuthErrorMessage(err));
        setDeleteConfirm({ open: false, student: null });
      }
    }
  };

  const handleAddStudentClick = () => {
    if (!isAuthenticated) {
      setErrorMessage('Please log in to add students.');
      return;
    }
    if (!isAuthorized) {
      setErrorMessage('You are not authorized to add students.');
      return;
    }
    setIsAddDialogOpen(true);
  };

  const handleMessageAll = () => {
    if (students.length === 0 || !selectedClass || !selectedSection) return;
    
    const today = getTodayString();
    const day = getDayOfWeek(today);
    const formattedDate = formatDateForTemplate(today);
    
    const studentsWithoutStatus = students.map(s => ({
      name: s.student.fullName,
      status: undefined,
    }));
    
    const messageText = renderBulkMessage(
      studentsWithoutStatus,
      selectedClass,
      selectedSection,
      formattedDate,
      day
    );
    
    const legacyStudents = students.map(s => ({
      id: s.id.toString(),
      name: s.student.fullName,
      rollNumber: s.student.rollNumber.toString(),
      parentMobile: s.student.parentMobileNumber,
    }));
    
    const payload = buildBulkWhatsAppPayload(legacyStudents, messageText);
    setWhatsappPreview(payload);
    setIsPreviewOpen(true);
  };

  const handlePreviewConfirm = () => {
    if (whatsappPreview?.waUrl) {
      window.open(whatsappPreview.waUrl, '_blank');
    }
  };

  const handleCheckAllStudents = async () => {
    setShowDiagnostic(true);
    await refetchAllStudents();
  };

  const classDisplayName = selectedClass ? getClassDisplayName(selectedClass) : '';

  const renderEmptyState = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium mb-2">Not Logged In</p>
          <p className="text-sm text-muted-foreground mb-4">
            Please log in to view and manage students.
          </p>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive opacity-50" />
          <p className="text-lg font-medium mb-2">Not Authorized</p>
          <p className="text-sm text-muted-foreground mb-4">
            You do not have permission to view student data.
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive opacity-50" />
          <p className="text-lg font-medium mb-2">Error Loading Students</p>
          <p className="text-sm text-muted-foreground mb-4">
            {getAuthErrorMessage(error)}
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium mb-2">No Students in This Class</p>
        <p className="text-sm text-muted-foreground mb-4">
          Click "Add Student" to add students to {classDisplayName} - Section {selectedSection}
        </p>
        {isAuthenticated && isAuthorized && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleCheckAllStudents}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check if any students exist in the system
            </Button>
            {showDiagnostic && (
              <div className="mt-4 p-4 bg-accent/10 rounded-lg max-w-md mx-auto">
                <p className="text-sm font-medium mb-2">Diagnostic Result:</p>
                <p className="text-sm text-muted-foreground">
                  Total students in system: <strong>{allStudents.length}</strong>
                </p>
                {allStudents.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Students exist in other classes. The current class/section has no students yet.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
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

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Student List</CardTitle>
              <CardDescription>
                {classDisplayName} - Section {selectedSection}
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
              <Button 
                onClick={handleAddStudentClick} 
                size="lg"
                disabled={!isAuthenticated || !isAuthorized}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-3">
              {students.map((storedStudent) => (
                <Card key={storedStudent.id.toString()} className="bg-accent/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold text-lg">
                          {storedStudent.student.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Roll: {storedStudent.student.rollNumber.toString()} • {classDisplayName} - Section {storedStudent.student.section}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Parent: {storedStudent.student.parentMobileNumber}
                        </p>
                      </div>
                      {isAuthenticated && isAuthorized && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(storedStudent)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(storedStudent)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={() => navigate({ to: '/attendance' })}
            size="lg"
            className="gap-2"
          >
            Continue to Attendance
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      <AddStudentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onStudentAdded={() => {
          setIsAddDialogOpen(false);
          setErrorMessage('');
        }}
      />

      {editStudent && (
        <EditStudentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          student={editStudent}
          onStudentUpdated={() => {
            setIsEditDialogOpen(false);
            setEditStudent(null);
            setErrorMessage('');
          }}
        />
      )}

      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, student: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirm.student?.student.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStudentMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {whatsappPreview && (
        <WhatsAppPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          payload={whatsappPreview}
          onConfirm={handlePreviewConfirm}
        />
      )}
    </div>
  );
}
