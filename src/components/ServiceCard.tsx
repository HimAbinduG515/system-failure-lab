import { Service, FailureType } from '@/types/chaos';
import { Shield, Package, ShoppingCart, CreditCard, Warehouse, Bell, Activity, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  onInjectFailure: (serviceId: string, type: FailureType) => void;
  onRecover: (serviceId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Package,
  ShoppingCart,
  CreditCard,
  Warehouse,
  Bell,
};

export function ServiceCard({ service, onInjectFailure, onRecover }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Package;
  
  const statusStyles = {
    healthy: 'service-card-healthy',
    degraded: 'service-card-degraded',
    down: 'service-card-down',
    unknown: '',
  };

  const statusIndicatorStyles = {
    healthy: 'bg-status-healthy status-glow-healthy',
    degraded: 'bg-status-degraded status-glow-degraded',
    down: 'bg-status-down status-glow-down',
    unknown: 'bg-status-unknown',
  };

  const statusLabels = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
    unknown: 'Unknown',
  };

  return (
    <div className={cn('service-card', statusStyles[service.status])}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2.5 rounded-lg',
            service.status === 'healthy' ? 'bg-primary/10' : 
            service.status === 'degraded' ? 'bg-warning/10' : 'bg-destructive/10'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              service.status === 'healthy' ? 'text-primary' :
              service.status === 'degraded' ? 'text-warning' : 'text-destructive'
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{service.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{service.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-2.5 h-2.5 rounded-full', statusIndicatorStyles[service.status])} />
          <span className={cn(
            'text-xs font-medium',
            service.status === 'healthy' ? 'text-status-healthy' :
            service.status === 'degraded' ? 'text-status-degraded' : 'text-status-down'
          )}>
            {statusLabels[service.status]}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {service.description}
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Latency</span>
          </div>
          <p className={cn(
            'text-sm font-mono font-semibold',
            service.responseTime > 500 ? 'text-destructive' :
            service.responseTime > 200 ? 'text-warning' : 'text-foreground'
          )}>
            {service.responseTime === 9999 ? 'Timeout' : `${service.responseTime}ms`}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Errors</span>
          </div>
          <p className={cn(
            'text-sm font-mono font-semibold',
            service.errorRate > 10 ? 'text-destructive' :
            service.errorRate > 5 ? 'text-warning' : 'text-foreground'
          )}>
            {service.errorRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Uptime</span>
          </div>
          <p className={cn(
            'text-sm font-mono font-semibold',
            service.uptime < 99 ? 'text-destructive' :
            service.uptime < 99.5 ? 'text-warning' : 'text-success'
          )}>
            {service.uptime}%
          </p>
        </div>
      </div>

      {/* Dependencies */}
      {service.dependencies.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Dependencies</p>
          <div className="flex flex-wrap gap-1.5">
            {service.dependencies.map(dep => (
              <span key={dep} className="px-2 py-0.5 text-xs font-mono bg-secondary rounded-md text-secondary-foreground">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
        {service.status === 'healthy' && (
          <>
            <button 
              onClick={() => onInjectFailure(service.id, 'stop')}
              className="control-btn control-btn-stop text-xs"
            >
              Stop Service
            </button>
            <button 
              onClick={() => onInjectFailure(service.id, 'latency')}
              className="control-btn control-btn-latency text-xs"
            >
              Add Latency
            </button>
          </>
        )}
        {(service.status === 'degraded' || service.status === 'down') && (
          <button 
            onClick={() => onRecover(service.id)}
            className="control-btn control-btn-recover text-xs"
          >
            Recover Service
          </button>
        )}
      </div>
    </div>
  );
}
