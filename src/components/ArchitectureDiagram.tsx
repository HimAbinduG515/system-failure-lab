import { Service } from '@/types/chaos';
import { cn } from '@/lib/utils';
import { Shield, Package, ShoppingCart, CreditCard, Warehouse, Bell, ArrowRight } from 'lucide-react';

interface ArchitectureDiagramProps {
  services: Service[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Package,
  ShoppingCart,
  CreditCard,
  Warehouse,
  Bell,
};

const positions: Record<string, { top: string; left: string }> = {
  auth: { top: '10%', left: '40%' },
  product: { top: '35%', left: '10%' },
  inventory: { top: '65%', left: '10%' },
  order: { top: '50%', left: '40%' },
  payment: { top: '35%', left: '70%' },
  notification: { top: '65%', left: '70%' },
};

export function ArchitectureDiagram({ services }: ArchitectureDiagramProps) {
  const statusColors = {
    healthy: 'border-status-healthy bg-status-healthy/10',
    degraded: 'border-status-degraded bg-status-degraded/10',
    down: 'border-status-down bg-status-down/10',
    unknown: 'border-status-unknown bg-status-unknown/10',
  };

  const statusGlow = {
    healthy: 'shadow-[0_0_15px_hsl(var(--status-healthy)/0.4)]',
    degraded: 'shadow-[0_0_15px_hsl(var(--status-degraded)/0.4)]',
    down: 'shadow-[0_0_20px_hsl(var(--status-down)/0.5)]',
    unknown: '',
  };

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground">Architecture Topology</h2>
          <p className="text-sm text-muted-foreground">E-Commerce Microservices</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-healthy" />
            <span className="text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-degraded" />
            <span className="text-muted-foreground">Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-down" />
            <span className="text-muted-foreground">Down</span>
          </div>
        </div>
      </div>

      <div className="relative h-[300px] bg-muted/20 rounded-lg border border-dashed border-border">
        {/* Connection lines (simplified visual representation) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" opacity="0.5" />
            </marker>
          </defs>
          
          {/* Auth to Order */}
          <line x1="50%" y1="22%" x2="50%" y2="45%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" strokeDasharray="4" markerEnd="url(#arrowhead)" />
          
          {/* Product to Order */}
          <line x1="22%" y1="40%" x2="38%" y2="50%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" strokeDasharray="4" markerEnd="url(#arrowhead)" />
          
          {/* Inventory to Order */}
          <line x1="22%" y1="70%" x2="38%" y2="55%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" strokeDasharray="4" markerEnd="url(#arrowhead)" />
          
          {/* Payment to Order */}
          <line x1="68%" y1="40%" x2="62%" y2="50%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" strokeDasharray="4" markerEnd="url(#arrowhead)" />
          
          {/* Order to Notification */}
          <line x1="62%" y1="55%" x2="68%" y2="70%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" strokeDasharray="4" markerEnd="url(#arrowhead)" />
          
          {/* Product to Inventory */}
          <line x1="18%" y1="45%" x2="18%" y2="60%" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" strokeDasharray="4" markerEnd="url(#arrowhead)" />
        </svg>

        {/* Service nodes */}
        {services.map(service => {
          const Icon = iconMap[service.icon] || Package;
          const pos = positions[service.id];
          
          return (
            <div
              key={service.id}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border-2 transition-all duration-300',
                statusColors[service.status],
                statusGlow[service.status],
                service.status === 'down' && 'animate-pulse'
              )}
              style={{ top: pos.top, left: pos.left, zIndex: 1 }}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn(
                  'w-4 h-4',
                  service.status === 'healthy' ? 'text-status-healthy' :
                  service.status === 'degraded' ? 'text-status-degraded' : 'text-status-down'
                )} />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {service.name.split(' ')[0]}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">
                {service.responseTime === 9999 ? 'TIMEOUT' : `${service.responseTime}ms`}
              </div>
            </div>
          );
        })}

        {/* Central label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="text-xs text-muted-foreground/30 font-mono text-center">
            <ArrowRight className="w-6 h-6 mx-auto mb-1 opacity-30" />
            Service Mesh
          </div>
        </div>
      </div>
    </div>
  );
}
