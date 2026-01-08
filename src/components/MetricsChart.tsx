import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Service } from '@/types/chaos';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface MetricsChartProps {
  services: Service[];
}

export function MetricsChart({ services }: MetricsChartProps) {
  const chartData = useMemo(() => {
    return services.map(service => ({
      name: service.name.split(' ')[0],
      responseTime: service.status === 'down' ? 0 : service.responseTime,
      errorRate: service.errorRate,
      rps: service.requestsPerSecond,
      status: service.status,
    }));
  }, [services]);

  const avgResponseTime = useMemo(() => {
    const activeServices = services.filter(s => s.status !== 'down');
    if (activeServices.length === 0) return 0;
    return Math.round(activeServices.reduce((acc, s) => acc + s.responseTime, 0) / activeServices.length);
  }, [services]);

  const avgErrorRate = useMemo(() => {
    return Math.round(services.reduce((acc, s) => acc + s.errorRate, 0) / services.length * 10) / 10;
  }, [services]);

  const totalRps = useMemo(() => {
    return services.reduce((acc, s) => acc + s.requestsPerSecond, 0);
  }, [services]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'Error Rate' ? '%' : entry.name === 'Response Time' ? 'ms' : '/s'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-foreground">Real-Time Metrics</h2>
          <p className="text-sm text-muted-foreground">Service performance overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg Response</span>
          </div>
          <p className="text-lg font-mono font-semibold text-foreground">{avgResponseTime}ms</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Avg Error Rate</span>
          </div>
          <p className="text-lg font-mono font-semibold text-foreground">{avgErrorRate}%</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Total RPS</span>
          </div>
          <p className="text-lg font-mono font-semibold text-foreground">{totalRps}/s</p>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Response Time by Service</p>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
              />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                name="Response Time"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="errorRate" 
                name="Error Rate"
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RPS Bar visualization */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Requests Per Second by Service</p>
        <div className="space-y-2">
          {chartData.map((service, index) => {
            const maxRps = Math.max(...chartData.map(s => s.rps));
            const percentage = maxRps > 0 ? (service.rps / maxRps) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 truncate">{service.name}</span>
                <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      service.status === 'down' ? 'bg-destructive/50' :
                      service.status === 'degraded' ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                  {service.rps}/s
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
