import { Beaker, RotateCcw, Trash2, Github } from 'lucide-react';

interface HeaderProps {
  onRecoverAll: () => void;
  onClearHistory: () => void;
}

export function Header({ onRecoverAll, onClearHistory }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Beaker className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Chaos Lab
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Backend Resilience Laboratory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRecoverAll}
              className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/30 rounded-lg hover:bg-success hover:text-success-foreground transition-all text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Recover All</span>
            </button>
            <button
              onClick={onClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
