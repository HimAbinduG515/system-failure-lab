import { ExperimentResult, ExperimentAnalysis as AnalysisType } from '@/types/chaos';
import { 
  Target, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExperimentAnalysisProps {
  experiment: ExperimentResult;
}

export function ExperimentAnalysis({ experiment }: ExperimentAnalysisProps) {
  const analysis = experiment.analysis;
  
  if (!analysis) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Experiment Analysis</h3>
            <p className="text-sm text-muted-foreground">Waiting for experiment to complete...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Experiment Analysis</h3>
            <p className="text-sm text-muted-foreground">{experiment.targetService} • {experiment.failureType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono text-muted-foreground">{experiment.recoveryTime}s</span>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "rounded-lg p-4 border",
          analysis.impactScore > 50 ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className={cn("w-4 h-4", analysis.impactScore > 50 ? "text-destructive" : "text-muted-foreground")} />
            <span className="text-xs text-muted-foreground">Impact Score</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            analysis.impactScore > 70 ? "text-destructive" :
            analysis.impactScore > 40 ? "text-warning" : "text-foreground"
          )}>
            {analysis.impactScore}<span className="text-sm font-normal text-muted-foreground">/100</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {analysis.impactScore > 70 ? "Severe impact" :
             analysis.impactScore > 40 ? "Moderate impact" : "Low impact"}
          </p>
        </div>

        <div className={cn(
          "rounded-lg p-4 border",
          analysis.resilienceScore > 50 ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className={cn("w-4 h-4", analysis.resilienceScore > 50 ? "text-success" : "text-warning")} />
            <span className="text-xs text-muted-foreground">Resilience Score</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            analysis.resilienceScore > 70 ? "text-success" :
            analysis.resilienceScore > 40 ? "text-warning" : "text-destructive"
          )}>
            {analysis.resilienceScore}<span className="text-sm font-normal text-muted-foreground">/100</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {analysis.resilienceScore > 70 ? "Good resilience" :
             analysis.resilienceScore > 40 ? "Needs improvement" : "Poor resilience"}
          </p>
        </div>
      </div>

      {/* Failure Patterns Detected */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Failure Patterns Detected
        </h4>
        <div className="space-y-2">
          {analysis.singlePointOfFailure && (
            <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <Zap className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Single Point of Failure</p>
                <p className="text-xs text-muted-foreground">
                  {experiment.targetService} failure affected {experiment.affectedServices.length} other services
                </p>
              </div>
            </div>
          )}
          
          {analysis.cascadingFailure && (
            <div className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <GitBranch className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning">Cascading Failure</p>
                <p className="text-xs text-muted-foreground">
                  Failure propagated through {analysis.cascadeChain.length} services
                </p>
              </div>
            </div>
          )}

          {!analysis.singlePointOfFailure && !analysis.cascadingFailure && (
            <div className="flex items-start gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-success">Contained Failure</p>
                <p className="text-xs text-muted-foreground">
                  Failure was isolated and did not propagate significantly
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cascade Chain Visualization */}
      {analysis.cascadeChain.length > 1 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Cascade Chain
          </h4>
          <div className="flex items-center flex-wrap gap-2 p-3 bg-muted/20 rounded-lg">
            {analysis.cascadeChain.map((serviceId, index) => (
              <div key={serviceId} className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 text-xs font-mono rounded",
                  index === 0 ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                )}>
                  {serviceId}
                </span>
                {index < analysis.cascadeChain.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Observations */}
      {analysis.recoveryObservations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Recovery Observations
          </h4>
          <ul className="space-y-2">
            {analysis.recoveryObservations.map((obs, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          Recommendations
        </h4>
        <ul className="space-y-2">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg text-sm text-foreground">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
