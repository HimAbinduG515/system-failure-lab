import { ExperimentResult } from '@/types/chaos';
import { FlaskConical, Clock, Layers, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExperimentPanelProps {
  currentExperiment: ExperimentResult | null;
  experimentHistory: ExperimentResult[];
}

export function ExperimentPanel({ currentExperiment, experimentHistory }: ExperimentPanelProps) {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FlaskConical className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Experiment Analysis</h2>
          <p className="text-sm text-muted-foreground">Failure observations & insights</p>
        </div>
      </div>

      {currentExperiment ? (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm font-medium text-warning">Active Experiment</span>
          </div>
          
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Target</span>
              <span className="font-medium text-foreground">{currentExperiment.targetService}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Failure Type</span>
              <span className="font-mono text-sm text-warning">{currentExperiment.failureType}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Cascade Depth</span>
              <span className="font-mono text-sm text-foreground">{currentExperiment.cascadeDepth} levels</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Affected Services</span>
              <span className="font-mono text-sm text-destructive">{currentExperiment.affectedServices.length}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-warning/20">
              <p className="text-xs text-muted-foreground mb-2">Observations</p>
              <ul className="space-y-1">
                {currentExperiment.observations.map((obs, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-warning">•</span>
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No active experiment</span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Inject a failure to start an experiment and observe system behavior
          </p>
        </div>
      )}

      {/* Insights Panel */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Key Insights</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <Layers className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">Order Service has the most dependencies</p>
              <p className="text-xs text-muted-foreground">Failing this service may cause widespread cascading failures</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground">Authentication is a critical dependency</p>
              <p className="text-xs text-muted-foreground">Multiple services depend on Auth; consider redundancy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment History */}
      {experimentHistory.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Recent Experiments</span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
            {experimentHistory.slice(0, 5).map(exp => (
              <div 
                key={exp.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm text-foreground">{exp.targetService}</p>
                    <p className="text-xs text-muted-foreground font-mono">{exp.failureType}</p>
                  </div>
                </div>
                {exp.recoveryTime && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {exp.recoveryTime}s recovery
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
