import { useChaosLab } from '@/hooks/useChaosLab';
import { Header } from '@/components/Header';
import { ServiceCard } from '@/components/ServiceCard';
import { SystemOverview } from '@/components/SystemOverview';
import { EventTimeline } from '@/components/EventTimeline';
import { ExperimentPanel } from '@/components/ExperimentPanel';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import { MetricsChart } from '@/components/MetricsChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Activity, FlaskConical } from 'lucide-react';

const Index = () => {
  const {
    services,
    events,
    currentExperiment,
    experimentHistory,
    isSimulationRunning,
    getSystemMetrics,
    injectFailure,
    recoverService,
    recoverAll,
    clearHistory,
    toggleSimulation,
  } = useChaosLab();

  const metrics = getSystemMetrics();

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header 
        onRecoverAll={recoverAll} 
        onClearHistory={clearHistory}
        isSimulationRunning={isSimulationRunning}
        onToggleSimulation={toggleSimulation}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome to the Chaos Engineering Laboratory
            </h2>
            <p className="text-muted-foreground">
              A safe environment to experiment with failure modes and learn how distributed systems 
              behave under stress. Inject controlled failures, observe cascading effects, and build 
              intuition for designing resilient backend architectures. All simulations run locally 
              in your browser.
            </p>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <Tabs defaultValue="services">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="experiments" className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                Lab
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="services" className="mt-4 space-y-4">
              <ArchitectureDiagram services={services} />
              <div className="grid grid-cols-1 gap-4">
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onInjectFailure={injectFailure}
                    onRecover={recoverService}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-4 space-y-4">
              <SystemOverview metrics={metrics} />
              <MetricsChart services={services} />
              <EventTimeline events={events} />
            </TabsContent>
            
            <TabsContent value="experiments" className="mt-4">
              <ExperimentPanel 
                currentExperiment={currentExperiment}
                experimentHistory={experimentHistory}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Architecture Overview */}
          <div className="mb-8">
            <ArchitectureDiagram services={services} />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Services */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Microservices</h3>
                  <span className="text-sm text-muted-foreground font-mono">
                    {services.filter(s => s.status === 'healthy').length}/{services.length} healthy
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onInjectFailure={injectFailure}
                      onRecover={recoverService}
                    />
                  ))}
                </div>
              </div>

              {/* Metrics Chart */}
              <MetricsChart services={services} />
            </div>

            {/* Right Column - Metrics & Timeline */}
            <div className="space-y-6">
              <SystemOverview metrics={metrics} />
              <EventTimeline events={events} />
              <ExperimentPanel 
                currentExperiment={currentExperiment}
                experimentHistory={experimentHistory}
              />
            </div>
          </div>
        </div>

        {/* Learning Section */}
        <div className="mt-12 mb-8">
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              How to Use This Lab
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">1</span>
                  <h4 className="font-medium text-foreground">Observe</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Watch the real-time metrics and service status. Notice how services interact.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">2</span>
                  <h4 className="font-medium text-foreground">Inject Failures</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Click "Stop Service" or "Add Latency" on any service to simulate failures.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">3</span>
                  <h4 className="font-medium text-foreground">Analyze</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Watch cascading effects in real-time and track how failures propagate.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">4</span>
                  <h4 className="font-medium text-foreground">Learn & Recover</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Recover services and review the detailed analysis to understand what happened.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Concepts Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-primary/5 to-transparent border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Key Concepts to Explore
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Single Points of Failure</h4>
                <p className="text-sm text-muted-foreground">
                  Try stopping the Authentication service. Notice how many other services depend on it?
                  This is a single point of failure that could bring down the entire system.
                </p>
              </div>
              <div className="bg-card/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Cascading Failures</h4>
                <p className="text-sm text-muted-foreground">
                  Stop the Product Catalog and watch errors cascade to Inventory, then to Orders.
                  Real systems need circuit breakers to prevent this chain reaction.
                </p>
              </div>
              <div className="bg-card/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Latency Propagation</h4>
                <p className="text-sm text-muted-foreground">
                  Add latency to Payment Gateway. Notice how Order Service response times increase?
                  Slow dependencies can bottleneck the entire request path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Chaos Engineering Laboratory — Learn how backend systems fail, and how to build them better.</p>
          <p className="text-xs mt-2 text-muted-foreground/70">
            Built with React • Runs entirely in your browser • No backend required
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
