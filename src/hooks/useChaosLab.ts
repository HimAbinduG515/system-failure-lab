import { useState, useCallback, useEffect, useRef } from 'react';
import { Service, FailureEvent, FailureType, ExperimentResult, SystemMetrics, MetricsSnapshot, ExperimentAnalysis } from '@/types/chaos';

const createInitialServices = (): Service[] => [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Handles user login, registration, and session management. Critical for all authenticated operations.',
    status: 'healthy',
    responseTime: 45,
    errorRate: 0.1,
    uptime: 99.9,
    dependencies: [],
    icon: 'Shield',
    requestsPerSecond: 150,
    lastUpdated: new Date(),
  },
  {
    id: 'product',
    name: 'Product Catalog',
    description: 'Manages product listings, search, and inventory display. Depends on authentication for admin operations.',
    status: 'healthy',
    responseTime: 120,
    errorRate: 0.2,
    uptime: 99.8,
    dependencies: ['auth'],
    icon: 'Package',
    requestsPerSecond: 300,
    lastUpdated: new Date(),
  },
  {
    id: 'order',
    name: 'Order Service',
    description: 'Processes orders, tracks status, and manages fulfillment. Central service with multiple dependencies.',
    status: 'healthy',
    responseTime: 200,
    errorRate: 0.3,
    uptime: 99.7,
    dependencies: ['auth', 'product', 'payment', 'inventory'],
    icon: 'ShoppingCart',
    requestsPerSecond: 80,
    lastUpdated: new Date(),
  },
  {
    id: 'payment',
    name: 'Payment Gateway',
    description: 'Handles payment processing and transaction verification. Critical for completing orders.',
    status: 'healthy',
    responseTime: 350,
    errorRate: 0.1,
    uptime: 99.95,
    dependencies: ['auth'],
    icon: 'CreditCard',
    requestsPerSecond: 50,
    lastUpdated: new Date(),
  },
  {
    id: 'inventory',
    name: 'Inventory Manager',
    description: 'Tracks stock levels, reservations, and replenishment. Depends on product catalog for item data.',
    status: 'healthy',
    responseTime: 80,
    errorRate: 0.2,
    uptime: 99.85,
    dependencies: ['product'],
    icon: 'Warehouse',
    requestsPerSecond: 120,
    lastUpdated: new Date(),
  },
  {
    id: 'notification',
    name: 'Notification Hub',
    description: 'Sends emails, SMS, and push notifications to users. Triggered by order events.',
    status: 'healthy',
    responseTime: 150,
    errorRate: 0.5,
    uptime: 99.5,
    dependencies: ['auth', 'order'],
    icon: 'Bell',
    requestsPerSecond: 200,
    lastUpdated: new Date(),
  },
];

export function useChaosLab() {
  const [services, setServices] = useState<Service[]>(createInitialServices);
  const [events, setEvents] = useState<FailureEvent[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentResult | null>(null);
  const [experimentHistory, setExperimentHistory] = useState<ExperimentResult[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<MetricsSnapshot[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const requestCounterRef = useRef(10000);

  // Real-time simulation of service behavior
  useEffect(() => {
    if (!isSimulationRunning) return;

    simulationRef.current = setInterval(() => {
      setServices(prev => prev.map(service => {
        // Add natural variation to healthy services
        if (service.status === 'healthy') {
          const responseVariation = (Math.random() - 0.5) * 20;
          const errorVariation = (Math.random() - 0.5) * 0.2;
          return {
            ...service,
            responseTime: Math.max(10, Math.round(service.responseTime + responseVariation)),
            errorRate: Math.max(0, Math.min(5, service.errorRate + errorVariation)),
            requestsPerSecond: Math.max(10, service.requestsPerSecond + Math.floor((Math.random() - 0.5) * 20)),
            lastUpdated: new Date(),
          };
        }
        
        // Degraded services fluctuate more
        if (service.status === 'degraded') {
          const responseVariation = (Math.random() - 0.3) * 50;
          const errorVariation = (Math.random() - 0.3) * 2;
          return {
            ...service,
            responseTime: Math.max(100, Math.round(service.responseTime + responseVariation)),
            errorRate: Math.max(5, Math.min(50, service.errorRate + errorVariation)),
            requestsPerSecond: Math.max(5, service.requestsPerSecond + Math.floor((Math.random() - 0.5) * 10)),
            lastUpdated: new Date(),
          };
        }
        
        return { ...service, lastUpdated: new Date() };
      }));

      // Update request counter
      requestCounterRef.current += Math.floor(Math.random() * 50) + 10;

      // Record metrics snapshot for history
      setMetricsHistory(prev => {
        const newSnapshot: MetricsSnapshot = {
          timestamp: new Date(),
          avgResponseTime: 0,
          errorRate: 0,
          healthyCount: 0,
          totalRequests: requestCounterRef.current,
        };
        
        return [...prev.slice(-30), newSnapshot]; // Keep last 30 snapshots
      });
    }, 1000);

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [isSimulationRunning]);

  const getSystemMetrics = useCallback((): SystemMetrics => {
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    const downCount = services.filter(s => s.status === 'down').length;
    const activeServices = services.filter(s => s.status !== 'down');
    const avgResponseTime = activeServices.length > 0
      ? activeServices.reduce((acc, s) => acc + s.responseTime, 0) / activeServices.length
      : 0;
    const avgErrorRate = services.reduce((acc, s) => acc + s.errorRate, 0) / services.length;

    return {
      totalServices: services.length,
      healthyServices: healthyCount,
      degradedServices: degradedCount,
      downServices: downCount,
      avgResponseTime: Math.round(avgResponseTime),
      totalRequests: requestCounterRef.current,
      errorRate: Math.round(avgErrorRate * 100) / 100,
    };
  }, [services]);

  const getCurrentMetricsSnapshot = useCallback((): MetricsSnapshot => {
    const metrics = getSystemMetrics();
    return {
      timestamp: new Date(),
      avgResponseTime: metrics.avgResponseTime,
      errorRate: metrics.errorRate,
      healthyCount: metrics.healthyServices,
      totalRequests: metrics.totalRequests,
    };
  }, [getSystemMetrics]);

  const findDependentServices = useCallback((serviceId: string): string[] => {
    const dependents: string[] = [];
    
    const findDeps = (id: string, visited: Set<string>, depth: number) => {
      if (visited.has(id) || depth > 5) return;
      visited.add(id);
      
      services.forEach(service => {
        if (service.dependencies.includes(id) && !dependents.includes(service.id)) {
          dependents.push(service.id);
          findDeps(service.id, visited, depth + 1);
        }
      });
    };

    findDeps(serviceId, new Set(), 0);
    return dependents;
  }, [services]);

  const calculateCascadeChain = useCallback((serviceId: string): string[] => {
    const chain: string[] = [serviceId];
    const visited = new Set<string>([serviceId]);
    
    const buildChain = (id: string) => {
      services.forEach(service => {
        if (service.dependencies.includes(id) && !visited.has(service.id)) {
          visited.add(service.id);
          chain.push(service.id);
          buildChain(service.id);
        }
      });
    };

    buildChain(serviceId);
    return chain;
  }, [services]);

  const generateAnalysis = useCallback((
    targetServiceId: string,
    targetServiceName: string,
    failureType: FailureType,
    affectedServices: string[],
    startTime: Date,
    recoveryTime?: number
  ): ExperimentAnalysis => {
    const cascadeChain = calculateCascadeChain(targetServiceId);
    const targetService = services.find(s => s.id === targetServiceId);
    
    // Determine if this is a single point of failure
    const singlePointOfFailure = affectedServices.length >= 2;
    
    // Determine cascade details
    const cascadingFailure = cascadeChain.length > 1;
    
    // Find critical path - services that affect the most others
    const criticalPath = services
      .filter(s => findDependentServices(s.id).length >= 2)
      .map(s => s.id);
    
    // Find bottleneck services
    const bottleneckServices = services
      .filter(s => s.dependencies.length >= 3)
      .map(s => s.id);
    
    // Calculate impact score (0-100)
    const impactScore = Math.min(100, Math.round((affectedServices.length / services.length) * 100 + (cascadeChain.length * 10)));
    
    // Calculate resilience score (inverse of impact)
    const resilienceScore = Math.max(0, 100 - impactScore);
    
    // Generate observations
    const recoveryObservations: string[] = [];
    if (recoveryTime) {
      if (recoveryTime < 10) {
        recoveryObservations.push('Quick recovery indicates good system resilience');
      } else if (recoveryTime < 30) {
        recoveryObservations.push('Moderate recovery time - consider automated recovery');
      } else {
        recoveryObservations.push('Slow recovery suggests need for better monitoring');
      }
    }
    
    if (cascadingFailure) {
      recoveryObservations.push(`Cascade chain: ${cascadeChain.map(id => services.find(s => s.id === id)?.name.split(' ')[0]).join(' → ')}`);
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (singlePointOfFailure) {
      recommendations.push(`Add redundancy to ${targetServiceName} - it's a single point of failure`);
    }
    
    if (cascadingFailure && cascadeChain.length > 2) {
      recommendations.push('Implement circuit breakers to prevent cascade propagation');
    }
    
    if (failureType === 'latency') {
      recommendations.push('Consider adding request timeouts and fallback responses');
    }
    
    if (affectedServices.length > 3) {
      recommendations.push('Reduce service coupling - too many services were affected');
    }
    
    if (targetService?.dependencies.length === 0) {
      recommendations.push('Core services like this should have health checks and auto-restart');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System showed acceptable resilience - continue monitoring');
    }

    return {
      singlePointOfFailure,
      cascadingFailure,
      cascadeChain,
      criticalPath,
      bottleneckServices,
      recoveryObservations,
      recommendations,
      impactScore,
      resilienceScore,
    };
  }, [services, findDependentServices, calculateCascadeChain]);

  const injectFailure = useCallback((serviceId: string, failureType: FailureType) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const metricsBeforeFailure = getCurrentMetricsSnapshot();
    const affectedServiceIds = findDependentServices(serviceId);
    
    // Update target service
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        switch (failureType) {
          case 'stop':
            return { ...s, status: 'down' as const, responseTime: 0, errorRate: 100, requestsPerSecond: 0, lastUpdated: new Date() };
          case 'latency':
            return { ...s, status: 'degraded' as const, responseTime: s.responseTime * 5, errorRate: s.errorRate + 15, lastUpdated: new Date() };
          case 'unavailable':
            return { ...s, status: 'down' as const, responseTime: 9999, errorRate: 100, requestsPerSecond: 0, lastUpdated: new Date() };
          default:
            return s;
        }
      }
      
      // Cascade effects to dependent services with realistic propagation
      if (affectedServiceIds.includes(s.id)) {
        const cascadeIntensity = failureType === 'stop' ? 0.8 : failureType === 'unavailable' ? 0.9 : 0.4;
        const newStatus = failureType === 'stop' || failureType === 'unavailable' ? 'degraded' as const : s.status;
        return {
          ...s,
          status: newStatus,
          responseTime: Math.round(s.responseTime * (1 + cascadeIntensity * 2)),
          errorRate: Math.min(s.errorRate + (25 * cascadeIntensity), 100),
          requestsPerSecond: Math.max(5, Math.round(s.requestsPerSecond * (1 - cascadeIntensity * 0.5))),
          lastUpdated: new Date(),
        };
      }
      
      return s;
    }));

    // Create failure event
    const newEvent: FailureEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
      serviceId,
      serviceName: service.name,
      type: failureType,
      description: getFailureDescription(failureType, service.name),
      status: 'active',
      affectedServices: affectedServiceIds,
    };

    setEvents(prev => [newEvent, ...prev]);

    // Start experiment with detailed tracking
    const cascadeDepth = calculateCascadeDepth(serviceId, affectedServiceIds);
    const experiment: ExperimentResult = {
      id: `exp-${Date.now()}`,
      startTime: new Date(),
      targetService: service.name,
      targetServiceId: serviceId,
      failureType,
      observations: [
        `Failure injected: ${getFailureTypeLabel(failureType)} on ${service.name}`,
        `Impact: ${affectedServiceIds.length} dependent services affected`,
        `Cascade depth: ${cascadeDepth} levels deep`,
        affectedServiceIds.length > 0 ? `Affected: ${affectedServiceIds.map(id => services.find(s => s.id === id)?.name.split(' ')[0]).join(', ')}` : 'No cascading effect detected',
      ],
      cascadeDepth,
      affectedServices: affectedServiceIds,
      metricsBeforeFailure,
      metricsDuringFailure: [getCurrentMetricsSnapshot()],
    };

    setCurrentExperiment(experiment);
  }, [services, findDependentServices, getCurrentMetricsSnapshot]);

  // Record metrics during active experiment
  useEffect(() => {
    if (!currentExperiment) return;

    const interval = setInterval(() => {
      setCurrentExperiment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          metricsDuringFailure: [...prev.metricsDuringFailure, getCurrentMetricsSnapshot()].slice(-20),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentExperiment, getCurrentMetricsSnapshot]);

  const recoverService = useCallback((serviceId: string) => {
    const initialService = createInitialServices().find(s => s.id === serviceId);
    if (!initialService) return;

    const affectedServiceIds = findDependentServices(serviceId);

    // Recover target service
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...initialService, lastUpdated: new Date() };
      }
      return s;
    }));

    // Gradually recover dependent services (simulate real-world recovery)
    setTimeout(() => {
      setServices(prev => prev.map(s => {
        if (affectedServiceIds.includes(s.id) && s.status === 'degraded') {
          const originalService = createInitialServices().find(os => os.id === s.id);
          if (originalService) {
            return {
              ...s,
              status: 'healthy' as const,
              responseTime: originalService.responseTime + Math.floor(Math.random() * 20),
              errorRate: originalService.errorRate + Math.random() * 0.5,
              requestsPerSecond: originalService.requestsPerSecond,
              lastUpdated: new Date(),
            };
          }
        }
        return s;
      }));
    }, 1500);

    // Update events
    setEvents(prev => prev.map(e => 
      e.serviceId === serviceId && e.status === 'active'
        ? { ...e, status: 'resolved' as const }
        : e
    ));

    // Complete experiment with analysis
    if (currentExperiment && currentExperiment.targetServiceId === serviceId) {
      const recoveryTime = Math.round((new Date().getTime() - currentExperiment.startTime.getTime()) / 1000);
      const metricsAfterRecovery = getCurrentMetricsSnapshot();
      const analysis = generateAnalysis(
        serviceId,
        currentExperiment.targetService,
        currentExperiment.failureType,
        currentExperiment.affectedServices,
        currentExperiment.startTime,
        recoveryTime
      );

      const completedExperiment: ExperimentResult = {
        ...currentExperiment,
        endTime: new Date(),
        recoveryTime,
        metricsAfterRecovery,
        analysis,
        observations: [
          ...currentExperiment.observations,
          `Service ${initialService.name} recovered after ${recoveryTime}s`,
          `System resilience score: ${analysis.resilienceScore}/100`,
          `Impact score: ${analysis.impactScore}/100`,
        ],
      };
      setExperimentHistory(prev => [completedExperiment, ...prev].slice(0, 20));
      setCurrentExperiment(null);
    }
  }, [currentExperiment, findDependentServices, getCurrentMetricsSnapshot, generateAnalysis]);

  const recoverAll = useCallback(() => {
    const initialServices = createInitialServices();
    setServices(initialServices);
    setEvents(prev => prev.map(e => ({ ...e, status: 'resolved' as const })));
    
    if (currentExperiment) {
      const recoveryTime = Math.round((new Date().getTime() - currentExperiment.startTime.getTime()) / 1000);
      const metricsAfterRecovery = getCurrentMetricsSnapshot();
      const analysis = generateAnalysis(
        currentExperiment.targetServiceId,
        currentExperiment.targetService,
        currentExperiment.failureType,
        currentExperiment.affectedServices,
        currentExperiment.startTime,
        recoveryTime
      );

      const completedExperiment: ExperimentResult = {
        ...currentExperiment,
        endTime: new Date(),
        recoveryTime,
        metricsAfterRecovery,
        analysis,
        observations: [
          ...currentExperiment.observations,
          'All services recovered (full system reset)',
          `Total experiment duration: ${recoveryTime}s`,
        ],
      };
      setExperimentHistory(prev => [completedExperiment, ...prev].slice(0, 20));
      setCurrentExperiment(null);
    }
  }, [currentExperiment, getCurrentMetricsSnapshot, generateAnalysis]);

  const clearHistory = useCallback(() => {
    setEvents([]);
    setExperimentHistory([]);
    setMetricsHistory([]);
    requestCounterRef.current = 10000;
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsSimulationRunning(prev => !prev);
  }, []);

  return {
    services,
    events,
    currentExperiment,
    experimentHistory,
    metricsHistory,
    isSimulationRunning,
    getSystemMetrics,
    injectFailure,
    recoverService,
    recoverAll,
    clearHistory,
    toggleSimulation,
  };
}

function getFailureDescription(type: FailureType, serviceName: string): string {
  switch (type) {
    case 'stop':
      return `${serviceName} has been stopped. All incoming requests fail immediately with connection refused.`;
    case 'latency':
      return `${serviceName} is experiencing high latency. Response times increased by 5x, causing timeouts in dependent services.`;
    case 'unavailable':
      return `${serviceName} is unreachable. All requests timeout after maximum wait period.`;
    default:
      return `Unknown failure on ${serviceName}`;
  }
}

function getFailureTypeLabel(type: FailureType): string {
  switch (type) {
    case 'stop': return 'Service Stop';
    case 'latency': return 'High Latency';
    case 'unavailable': return 'Service Unavailable';
    default: return type;
  }
}

function calculateCascadeDepth(targetId: string, affected: string[]): number {
  if (affected.length === 0) return 0;
  if (affected.length <= 1) return 1;
  if (affected.length <= 3) return 2;
  return 3;
}
