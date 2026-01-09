import { ExperimentResult } from '@/types/chaos';
import { FlaskConical, Clock, Layers, AlertCircle, CheckCircle2, Lightbulb, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ExperimentAnalysis } from './ExperimentAnalysis';

// Live duration counter component
function ExperimentDuration({ startTime }: { startTime: Date }) {
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.round((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Duration</span>
      <span className="font-mono text-sm text-foreground">{duration}s</span>
    </div>
  );
}

interface ExperimentPanelProps {
  currentExperiment: ExperimentResult | null;
  experimentHistory: ExperimentResult[];
}

export function ExperimentPanel({ currentExperiment, experimentHistory }: ExperimentPanelProps) {
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentResult | null>(null);

  if (selectedExperiment) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedExperiment(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to experiments
        </button>
        <ExperimentAnalysis experiment={selectedExperiment} />
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FlaskConical className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Experiment Lab</h2>
          <p className="text-sm text-muted-foreground">Failure observations & insights</p>
        </div>
      </div>

      {currentExperiment ? (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm font-medium text-warning">Active Experiment</span>
            <Activity className="w-3 h-3 text-warning animate-pulse ml-auto" />
          </div>
          
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Target</span>
              <span className="font-medium text-foreground">{currentExperiment.targetService}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Failure Type</span>
              <span className={cn(
                "font-mono text-sm px-2 py-0.5 rounded",
                currentExperiment.failureType === 'stop' ? 'bg-destructive/20 text-destructive' :
                currentExperiment.failureType === 'latency' ? 'bg-warning/20 text-warning' :
                'bg-destructive/20 text-destructive'
              )}>
                {currentExperiment.failureType}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Cascade Depth</span>
              <span className="font-mono text-sm text-foreground">{currentExperiment.cascadeDepth} levels</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Affected Services</span>
              <span className="font-mono text-sm text-destructive">{currentExperiment.affectedServices.length}</span>
            </div>
            <ExperimentDuration startTime={currentExperiment.startTime} />

            <div className="mt-4 pt-4 border-t border-warning/20">
              <p className="text-xs text-muted-foreground mb-2">Live Observations</p>
              <ul className="space-y-1 max-h-[120px] overflow-y-auto scrollbar-thin">
                {currentExperiment.observations.map((obs, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-warning">•</span>
                    {obs}
                  </li>
                ))}
              </ul>
            </div>

            {currentExperiment.affectedServices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-warning/20">
                <p className="text-xs text-muted-foreground mb-2">Affected Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentExperiment.affectedServices.map(id => (
                    <span key={id} className="px-2 py-0.5 text-xs font-mono bg-destructive/20 text-destructive rounded">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No active experiment</span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Click "Stop Service" or "Add Latency" on any service card to start an experiment
          </p>
        </div>
      )}

      {/* Static Insights */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">System Insights</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <Layers className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">Order Service is highly coupled</p>
              <p className="text-xs text-muted-foreground">Depends on 4 services - potential bottleneck</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">Auth is a single point of failure</p>
              <p className="text-xs text-muted-foreground">5 services depend on it directly or indirectly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment History */}
      {experimentHistory.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Completed Experiments</span>
            <span className="text-xs text-muted-foreground ml-auto">{experimentHistory.length}</span>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
            {experimentHistory.slice(0, 10).map(exp => (
              <button 
                key={exp.id}
                onClick={() => setSelectedExperiment(exp)}
                className="w-full flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm text-foreground">{exp.targetService}</p>
                    <p className="text-xs text-muted-foreground font-mono">{exp.failureType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exp.recoveryTime && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {exp.recoveryTime}s
                    </span>
                  )}
                  {exp.analysis && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      exp.analysis.resilienceScore > 50 ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    )}>
                      {exp.analysis.resilienceScore}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
