import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateStudent } from '../hooks/useStudents';
import { useAuth, getAuthErrorMessage } from '../hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getClassDisplayName } from '../constants/school';
import { validateStudentForm } from '../lib/validation';
import { StoredStudent } from '../backend';

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StoredStudent | null;
  onStudentUpdated: () => void;
}

export default function EditStudentDialog({ open, onOpenChange, student, onStudentUpdated }: EditStudentDialogProps) {
  const { isAuthenticated, isAuthorized } = useAuth();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  
  const updateStudentMutation = useUpdateStudent();

  useEffect(() => {
    if (student) {
      setName(student.student.fullName);
      setRollNumber(student.student.rollNumber.toString());
      setParentMobile(student.student.parentMobileNumber);
      setErrors({});
      setErrorMessage('');
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setErrorMessage('Please log in to edit students.');
      return;
    }

    if (!isAuthorized) {
      setErrorMessage('You are not authorized to edit students.');
      return;
    }

    if (!student) return;

    const validation = validateStudentForm(name, rollNumber, parentMobile);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await updateStudentMutation.mutateAsync({
        id: student.id,
        fullName: name.trim(),
        rollNumber: rollNumber.trim(),
        parentMobileNumber: parentMobile.trim(),
        className: student.student.className,
        section: student.student.section,
      });

      setErrors({});
      setErrorMessage('');
      onStudentUpdated();
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    }
  };

  const handleCancel = () => {
    if (student) {
      setName(student.student.fullName);
      setRollNumber(student.student.rollNumber.toString());
      setParentMobile(student.student.parentMobileNumber);
    }
    setErrors({});
    setErrorMessage('');
    onOpenChange(false);
  };

  const classDisplayName = student ? getClassDisplayName(student.student.className) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student details for {classDisplayName} - Section {student?.student.section}
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Student Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter student name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rollNumber">Roll Number *</Label>
              <Input
                id="edit-rollNumber"
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value);
                  setErrors({ ...errors, rollNumber: '' });
                }}
                placeholder="Enter roll number"
                className={errors.rollNumber ? 'border-destructive' : ''}
              />
              {errors.rollNumber && <p className="text-sm text-destructive">{errors.rollNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parentMobile">Parent Mobile Number *</Label>
              <Input
                id="edit-parentMobile"
                value={parentMobile}
                onChange={(e) => {
                  setParentMobile(e.target.value);
                  setErrors({ ...errors, parentMobile: '' });
                }}
                placeholder="Enter parent mobile number"
                className={errors.parentMobile ? 'border-destructive' : ''}
              />
              {errors.parentMobile && <p className="text-sm text-destructive">{errors.parentMobile}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateStudentMutation.isPending || !isAuthenticated || !isAuthorized}>
              {updateStudentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
