import { GameState } from "@/game/types";
import { Compass, Heart, Package, Gauge } from "lucide-react";

interface GameHUDProps {
  gameState: GameState;
}

export const GameHUD = ({ gameState }: GameHUDProps) => {
  const { supplies, health, distance, speed, maxSpeed } = gameState;

  return (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-10">
      {/* Left HUD Panel */}
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg pointer-events-auto">
        <h2 className="font-display text-lg text-primary mb-3 flex items-center gap-2">
          <Compass className="w-5 h-5" />
          Caravan Status
        </h2>

        {/* Supplies Bar */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-sunset-gold" />
            <span className="text-sm text-foreground">Supplies</span>
            <span className="text-sm text-muted-foreground ml-auto">{Math.round(supplies)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-deep to-sunset-gold transition-all duration-300"
              style={{ width: `${supplies}%` }}
            />
          </div>
        </div>

        {/* Health Bar */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-sm text-foreground">Health</span>
            <span className="text-sm text-muted-foreground ml-auto">{Math.round(health)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${health}%`,
                background:
                  health > 50
                    ? "linear-gradient(to right, hsl(120, 50%, 40%), hsl(90, 60%, 45%))"
                    : health > 25
                    ? "linear-gradient(to right, hsl(45, 80%, 50%), hsl(30, 90%, 50%))"
                    : "linear-gradient(to right, hsl(0, 70%, 50%), hsl(0, 60%, 40%))",
              }}
            />
          </div>
        </div>

        {/* Speed Indicator */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Speed</span>
            <span className="text-sm text-muted-foreground ml-auto">
              {Math.round((speed / maxSpeed) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-150"
              style={{ width: `${(speed / maxSpeed) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right HUD Panel - Distance */}
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg pointer-events-auto text-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Distance Traveled</span>
        <div className="font-display text-3xl text-primary text-glow mt-1">
          {Math.round(distance)}
        </div>
        <span className="text-xs text-muted-foreground">leagues</span>
      </div>
    </div>
  );
};
