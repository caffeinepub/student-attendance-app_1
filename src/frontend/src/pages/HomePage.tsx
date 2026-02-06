import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Student Attendance App</CardTitle>
          <CardDescription className="text-base">
            Simple and efficient attendance tracking for your classroom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate({ to: '/class-selection' })}
            className="w-full h-12 text-lg"
            size="lg"
          >
            Start Attendance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
