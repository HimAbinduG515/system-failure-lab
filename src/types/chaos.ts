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
  requestsPerSecond: number;
  lastUpdated: Date;
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

export interface MetricsSnapshot {
  timestamp: Date;
  avgResponseTime: number;
  errorRate: number;
  healthyCount: number;
  totalRequests: number;
}

export interface ExperimentResult {
  id: string;
  startTime: Date;
  endTime?: Date;
  targetService: string;
  targetServiceId: string;
  failureType: FailureType;
  observations: string[];
  cascadeDepth: number;
  recoveryTime?: number; // in seconds
  affectedServices: string[];
  metricsBeforeFailure: MetricsSnapshot;
  metricsDuringFailure: MetricsSnapshot[];
  metricsAfterRecovery?: MetricsSnapshot;
  analysis?: ExperimentAnalysis;
}

export interface ExperimentAnalysis {
  singlePointOfFailure: boolean;
  cascadingFailure: boolean;
  cascadeChain: string[];
  criticalPath: string[];
  bottleneckServices: string[];
  recoveryObservations: string[];
  recommendations: string[];
  impactScore: number; // 0-100
  resilienceScore: number; // 0-100
}

export interface ServiceHealthHistory {
  serviceId: string;
  snapshots: {
    timestamp: Date;
    status: ServiceStatus;
    responseTime: number;
    errorRate: number;
  }[];
}
