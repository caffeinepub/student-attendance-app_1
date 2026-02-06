import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAttendanceSession } from '../state/attendanceSession';
import { addStudent } from '../lib/studentsRepo';
import { validateStudentForm } from '../lib/validation';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentAdded: () => void;
}

export default function AddStudentDialog({ open, onOpenChange, onStudentAdded }: AddStudentDialogProps) {
  const { selectedClass, selectedSection } = useAttendanceSession();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateStudentForm(name, rollNumber, parentMobile);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (selectedClass && selectedSection) {
      addStudent(selectedClass, selectedSection, {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        parentMobile: parentMobile.trim(),
      });

      setName('');
      setRollNumber('');
      setParentMobile('');
      setErrors({});
      onStudentAdded();
    }
  };

  const handleCancel = () => {
    setName('');
    setRollNumber('');
    setParentMobile('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student details for Class {selectedClass} - Section {selectedSection}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student name (Hindi/English)"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter roll number"
                className={errors.rollNumber ? 'border-destructive' : ''}
              />
              {errors.rollNumber && <p className="text-sm text-destructive">{errors.rollNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentMobile">Parent Mobile Number *</Label>
              <Input
                id="parentMobile"
                value={parentMobile}
                onChange={(e) => setParentMobile(e.target.value)}
                placeholder="Enter mobile number"
                type="tel"
                className={errors.parentMobile ? 'border-destructive' : ''}
              />
              {errors.parentMobile && <p className="text-sm text-destructive">{errors.parentMobile}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
