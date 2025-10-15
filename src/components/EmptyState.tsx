import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-8 mb-6 shadow-lg">
        <Icon className="h-14 w-14 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md text-base leading-relaxed">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="lg" className="shadow-md">
          {action.label}
        </Button>
      )}
    </div>
  );
}
