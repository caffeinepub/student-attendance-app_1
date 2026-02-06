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
import { MessageCircle, Phone } from 'lucide-react';
import { WhatsAppPayload } from '../lib/whatsapp';

interface WhatsAppPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: WhatsAppPayload | null;
  onConfirm: () => void;
}

export default function WhatsAppPreviewDialog({
  open,
  onOpenChange,
  payload,
  onConfirm,
}: WhatsAppPreviewDialogProps) {
  if (!payload) return null;

  const handleOpenWhatsApp = () => {
    onConfirm();
    onOpenChange(false);
  };

  const formatPhoneNumber = (number: string) => {
    if (number.startsWith('91') && number.length === 12) {
      return `+91 ${number.slice(2, 7)} ${number.slice(7)}`;
    }
    return `+${number}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="w-5 h-5 text-green-600" />
            WhatsApp Message Preview
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {payload.isBulk 
              ? 'Review the bulk message before sending to WhatsApp'
              : 'Review the message before sending to WhatsApp'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Student name (single recipient only) */}
          {!payload.isBulk && payload.studentName && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Student</p>
              <p className="text-base font-semibold">{payload.studentName}</p>
            </div>
          )}

          {/* Target phone number */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {payload.isBulk ? 'Primary Contact Number' : 'Parent Mobile Number'}
            </p>
            <p className="text-base font-mono">{formatPhoneNumber(payload.targetNumber)}</p>
            {payload.isBulk && (
              <p className="text-xs text-muted-foreground">
                Message will be sent via this number; all contacts are included in the message
              </p>
            )}
          </div>

          {/* Message preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Message Content</p>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                {payload.messageText}
              </pre>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleOpenWhatsApp}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Open WhatsApp
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
