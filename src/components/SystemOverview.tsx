import { SystemMetrics } from '@/types/chaos';
import { Activity, AlertTriangle, CheckCircle, XCircle, Zap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemOverviewProps {
  metrics: SystemMetrics;
}

export function SystemOverview({ metrics }: SystemOverviewProps) {
  const healthPercentage = (metrics.healthyServices / metrics.totalServices) * 100;
  
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">System Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time health metrics</p>
        </div>
      </div>

      {/* Health Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">System Health</span>
          <span className={cn(
            'text-sm font-semibold',
            healthPercentage === 100 ? 'text-success' :
            healthPercentage >= 50 ? 'text-warning' : 'text-destructive'
          )}>
            {healthPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-500',
              healthPercentage === 100 ? 'bg-success' :
              healthPercentage >= 50 ? 'bg-warning' : 'bg-destructive'
            )}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-muted/30 rounded-lg p-4 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Healthy</span>
          </div>
          <p className="text-2xl font-bold text-success">{metrics.healthyServices}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm text-muted-foreground">Degraded</span>
          </div>
          <p className="text-2xl font-bold text-warning">{metrics.degradedServices}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-muted-foreground">Down</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{metrics.downServices}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.totalServices}</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Avg Response Time</span>
          </div>
          <span className={cn(
            'text-sm font-mono font-semibold',
            metrics.avgResponseTime > 300 ? 'text-warning' : 'text-foreground'
          )}>
            {metrics.avgResponseTime}ms
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Error Rate</span>
          </div>
          <span className={cn(
            'text-sm font-mono font-semibold',
            metrics.errorRate > 5 ? 'text-destructive' : 'text-foreground'
          )}>
            {metrics.errorRate}%
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Requests</span>
          </div>
          <span className="text-sm font-mono font-semibold text-foreground">
            {metrics.totalRequests.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
