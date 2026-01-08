import { useState, useCallback } from 'react';
import { Service, FailureEvent, FailureType, ExperimentResult, SystemMetrics } from '@/types/chaos';

const initialServices: Service[] = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Handles user login, registration, and session management',
    status: 'healthy',
    responseTime: 45,
    errorRate: 0.1,
    uptime: 99.9,
    dependencies: [],
    icon: 'Shield',
  },
  {
    id: 'product',
    name: 'Product Catalog',
    description: 'Manages product listings, search, and inventory display',
    status: 'healthy',
    responseTime: 120,
    errorRate: 0.2,
    uptime: 99.8,
    dependencies: ['auth'],
    icon: 'Package',
  },
  {
    id: 'order',
    name: 'Order Service',
    description: 'Processes orders, tracks status, and manages fulfillment',
    status: 'healthy',
    responseTime: 200,
    errorRate: 0.3,
    uptime: 99.7,
    dependencies: ['auth', 'product', 'payment', 'inventory'],
    icon: 'ShoppingCart',
  },
  {
    id: 'payment',
    name: 'Payment Gateway',
    description: 'Handles payment processing and transaction verification',
    status: 'healthy',
    responseTime: 350,
    errorRate: 0.1,
    uptime: 99.95,
    dependencies: ['auth'],
    icon: 'CreditCard',
  },
  {
    id: 'inventory',
    name: 'Inventory Manager',
    description: 'Tracks stock levels, reservations, and replenishment',
    status: 'healthy',
    responseTime: 80,
    errorRate: 0.2,
    uptime: 99.85,
    dependencies: ['product'],
    icon: 'Warehouse',
  },
  {
    id: 'notification',
    name: 'Notification Hub',
    description: 'Sends emails, SMS, and push notifications to users',
    status: 'healthy',
    responseTime: 150,
    errorRate: 0.5,
    uptime: 99.5,
    dependencies: ['auth', 'order'],
    icon: 'Bell',
  },
];

export function useChaosLab() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [events, setEvents] = useState<FailureEvent[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentResult | null>(null);
  const [experimentHistory, setExperimentHistory] = useState<ExperimentResult[]>([]);

  const getSystemMetrics = useCallback((): SystemMetrics => {
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    const downCount = services.filter(s => s.status === 'down').length;
    const avgResponseTime = services.reduce((acc, s) => acc + s.responseTime, 0) / services.length;
    const avgErrorRate = services.reduce((acc, s) => acc + s.errorRate, 0) / services.length;

    return {
      totalServices: services.length,
      healthyServices: healthyCount,
      degradedServices: degradedCount,
      downServices: downCount,
      avgResponseTime: Math.round(avgResponseTime),
      totalRequests: Math.floor(Math.random() * 10000) + 5000,
      errorRate: Math.round(avgErrorRate * 100) / 100,
    };
  }, [services]);

  const findDependentServices = useCallback((serviceId: string): string[] => {
    const dependents: string[] = [];
    
    const findDeps = (id: string, visited: Set<string>) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      services.forEach(service => {
        if (service.dependencies.includes(id) && !dependents.includes(service.id)) {
          dependents.push(service.id);
          findDeps(service.id, visited);
        }
      });
    };

    findDeps(serviceId, new Set());
    return dependents;
  }, [services]);

  const injectFailure = useCallback((serviceId: string, failureType: FailureType) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const affectedServiceIds = findDependentServices(serviceId);
    
    // Update target service
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        switch (failureType) {
          case 'stop':
            return { ...s, status: 'down' as const, responseTime: 0, errorRate: 100 };
          case 'latency':
            return { ...s, status: 'degraded' as const, responseTime: s.responseTime * 5, errorRate: s.errorRate + 15 };
          case 'unavailable':
            return { ...s, status: 'down' as const, responseTime: 9999, errorRate: 100 };
          default:
            return s;
        }
      }
      
      // Cascade effects to dependent services
      if (affectedServiceIds.includes(s.id)) {
        const cascadeIntensity = failureType === 'stop' ? 0.8 : 0.4;
        return {
          ...s,
          status: failureType === 'stop' ? 'degraded' as const : s.status,
          responseTime: Math.round(s.responseTime * (1 + cascadeIntensity)),
          errorRate: Math.min(s.errorRate + (10 * cascadeIntensity), 100),
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

    // Start experiment
    const experiment: ExperimentResult = {
      id: `exp-${Date.now()}`,
      startTime: new Date(),
      targetService: service.name,
      failureType,
      observations: [
        `Failure injected: ${failureType} on ${service.name}`,
        `${affectedServiceIds.length} dependent services potentially affected`,
      ],
      cascadeDepth: calculateCascadeDepth(serviceId, affectedServiceIds),
      affectedServices: affectedServiceIds,
    };

    setCurrentExperiment(experiment);
  }, [services, findDependentServices]);

  const recoverService = useCallback((serviceId: string) => {
    const originalService = initialServices.find(s => s.id === serviceId);
    if (!originalService) return;

    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...originalService };
      }
      return s;
    }));

    // Update events
    setEvents(prev => prev.map(e => 
      e.serviceId === serviceId && e.status === 'active'
        ? { ...e, status: 'resolved' as const }
        : e
    ));

    // Complete experiment
    if (currentExperiment && currentExperiment.targetService === originalService.name) {
      const completedExperiment: ExperimentResult = {
        ...currentExperiment,
        endTime: new Date(),
        recoveryTime: Math.round((new Date().getTime() - currentExperiment.startTime.getTime()) / 1000),
        observations: [
          ...currentExperiment.observations,
          `Service ${originalService.name} recovered`,
          `Total recovery time: ${Math.round((new Date().getTime() - currentExperiment.startTime.getTime()) / 1000)}s`,
        ],
      };
      setExperimentHistory(prev => [completedExperiment, ...prev]);
      setCurrentExperiment(null);
    }
  }, [currentExperiment]);

  const recoverAll = useCallback(() => {
    setServices(initialServices);
    setEvents(prev => prev.map(e => ({ ...e, status: 'resolved' as const })));
    
    if (currentExperiment) {
      const completedExperiment: ExperimentResult = {
        ...currentExperiment,
        endTime: new Date(),
        recoveryTime: Math.round((new Date().getTime() - currentExperiment.startTime.getTime()) / 1000),
        observations: [
          ...currentExperiment.observations,
          'All services recovered (full system reset)',
        ],
      };
      setExperimentHistory(prev => [completedExperiment, ...prev]);
      setCurrentExperiment(null);
    }
  }, [currentExperiment]);

  const clearHistory = useCallback(() => {
    setEvents([]);
    setExperimentHistory([]);
  }, []);

  return {
    services,
    events,
    currentExperiment,
    experimentHistory,
    getSystemMetrics,
    injectFailure,
    recoverService,
    recoverAll,
    clearHistory,
  };
}

function getFailureDescription(type: FailureType, serviceName: string): string {
  switch (type) {
    case 'stop':
      return `${serviceName} has been stopped. All incoming requests will fail immediately.`;
    case 'latency':
      return `${serviceName} is experiencing high latency. Response times increased by 5x.`;
    case 'unavailable':
      return `${serviceName} is temporarily unavailable. Requests will timeout.`;
    default:
      return `Unknown failure on ${serviceName}`;
  }
}

function calculateCascadeDepth(targetId: string, affected: string[]): number {
  // Simplified cascade depth calculation
  if (affected.length === 0) return 0;
  if (affected.length <= 2) return 1;
  return 2;
}
