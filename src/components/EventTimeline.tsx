import { FailureEvent } from '@/types/chaos';
import { cn } from '@/lib/utils';
import { Clock, XCircle, AlertTriangle, WifiOff, CheckCircle } from 'lucide-react';

interface EventTimelineProps {
  events: FailureEvent[];
}

const typeIcons = {
  stop: XCircle,
  latency: AlertTriangle,
  unavailable: WifiOff,
};

const typeColors = {
  stop: 'bg-destructive',
  latency: 'bg-warning',
  unavailable: 'bg-destructive',
};

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Event Timeline</h2>
            <p className="text-sm text-muted-foreground">Failure injection history</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <p className="text-muted-foreground">No failure events yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Inject a failure to see it recorded here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Event Timeline</h2>
          <p className="text-sm text-muted-foreground">{events.length} events recorded</p>
        </div>
      </div>

      <div className="space-y-0 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
        {events.map((event, index) => {
          const Icon = typeIcons[event.type];
          
          return (
            <div 
              key={event.id} 
              className={cn(
                'timeline-item animate-slide-in',
                event.status === 'resolved' && 'opacity-60'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn('timeline-dot', typeColors[event.type])} />
              
              <div className="pb-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-1.5 rounded-md mt-0.5',
                    event.type === 'latency' ? 'bg-warning/10' : 'bg-destructive/10'
                  )}>
                    <Icon className={cn(
                      'w-3.5 h-3.5',
                      event.type === 'latency' ? 'text-warning' : 'text-destructive'
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {event.serviceName}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full font-medium',
                        event.status === 'active' 
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-success/20 text-success'
                      )}>
                        {event.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    
                    {event.affectedServices.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-xs text-muted-foreground">Affected:</span>
                        {event.affectedServices.map(s => (
                          <span 
                            key={s}
                            className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-xs text-muted-foreground font-mono">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
