import { Keyboard } from "lucide-react";

export const ControlsGuide = () => {
  return (
    <div className="absolute bottom-6 left-6 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 pointer-events-none z-10">
      <div className="flex items-center gap-2 mb-3">
        <Keyboard className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Controls</span>
      </div>
      <div className="grid grid-cols-3 gap-1 text-center">
        <div />
        <div className="bg-secondary border border-border rounded px-3 py-1 text-xs text-foreground font-mono">
          W
        </div>
        <div />
        <div className="bg-secondary border border-border rounded px-3 py-1 text-xs text-foreground font-mono">
          A
        </div>
        <div className="bg-secondary border border-border rounded px-3 py-1 text-xs text-foreground font-mono">
          S
        </div>
        <div className="bg-secondary border border-border rounded px-3 py-1 text-xs text-foreground font-mono">
          D
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Speed & Steering
      </div>
    </div>
  );
};
