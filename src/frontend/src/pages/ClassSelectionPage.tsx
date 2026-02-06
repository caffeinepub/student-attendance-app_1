import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CLASSES, SECTIONS } from '../constants/school';
import { useAttendanceSession } from '../state/attendanceSession';

export default function ClassSelectionPage() {
  const navigate = useNavigate();
  const { setClassSection } = useAttendanceSession();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  const handleContinue = () => {
    if (selectedClass && selectedSection) {
      setClassSection(selectedClass, selectedSection);
      navigate({ to: '/student-list' });
    }
  };

  const canContinue = selectedClass && selectedSection;

  return (
    <div className="space-y-6 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Select Class & Section</CardTitle>
          <CardDescription>Choose the class and section for attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="class-select" className="text-base font-medium">
              Class
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-select" className="h-12">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-select" className="text-base font-medium">
              Section
            </Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger id="section-select" className="h-12">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((section) => (
                  <SelectItem key={section} value={section}>
                    Section {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-12 text-lg"
            size="lg"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
