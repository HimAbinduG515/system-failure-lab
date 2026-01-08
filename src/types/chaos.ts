export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export type FailureType = 'stop' | 'latency' | 'unavailable';

export interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  responseTime: number; // in ms
  errorRate: number; // percentage 0-100
  uptime: number; // percentage 0-100
  dependencies: string[]; // IDs of services this depends on
  icon: string;
}

export interface FailureEvent {
  id: string;
  timestamp: Date;
  serviceId: string;
  serviceName: string;
  type: FailureType;
  description: string;
  status: 'active' | 'resolved';
  affectedServices: string[];
}

export interface SystemMetrics {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  avgResponseTime: number;
  totalRequests: number;
  errorRate: number;
}

export interface ExperimentResult {
  id: string;
  startTime: Date;
  endTime?: Date;
  targetService: string;
  failureType: FailureType;
  observations: string[];
  cascadeDepth: number;
  recoveryTime?: number; // in seconds
  affectedServices: string[];
}
