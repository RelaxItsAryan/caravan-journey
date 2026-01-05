import { GameState, DifficultyLevel, DIFFICULTY_CONFIGS } from "@/game/types";
import { Compass, Heart, Fuel, Gauge, DollarSign, Sun, Moon, Cloud, Wind, Skull } from "lucide-react";

interface GameHUDProps {
  gameState: GameState;
  difficulty?: DifficultyLevel;
}

const getTimeIcon = (time: number) => {
  if (time >= 6 && time < 18) {
    return <Sun className="w-4 h-4 text-yellow-400" />;
  }
  return <Moon className="w-4 h-4 text-blue-300" />;
};

const getWeatherIcon = (weather: string) => {
  switch (weather) {
    case 'sandstorm':
      return <Cloud className="w-4 h-4 text-orange-400" />;
    case 'dusty':
      return <Cloud className="w-4 h-4 text-yellow-600" />;
    case 'windy':
      return <Wind className="w-4 h-4 text-cyan-400" />;
    default:
      return <Sun className="w-4 h-4 text-yellow-300" />;
  }
};

const formatTime = (time: number) => {
  const hours = Math.floor(time);
  const minutes = Math.floor((time % 1) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const GameHUD = ({ gameState, difficulty = 'medium' }: GameHUDProps) => {
  const { supplies, health, distance, speed, maxSpeed, money, timeOfDay, weather } = gameState;
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];

  return (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-10">
      {/* Left HUD Panel */}
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg pointer-events-auto">
        <h2 className="font-display text-lg text-primary mb-3 flex items-center gap-2">
          <Compass className="w-5 h-5" />
          Caravan Status
        </h2>

        {/* Fuel Bar */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Fuel className="w-4 h-4 text-sunset-gold" />
            <span className="text-sm text-foreground">Fuel</span>
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

        {/* Money */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm text-foreground">Money</span>
            <span className="text-lg font-bold text-green-400 ml-auto">${money}</span>
          </div>
        </div>
      </div>

      {/* Right HUD Panel - Distance & Status */}
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg pointer-events-auto text-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Distance Traveled</span>
        <div className="font-display text-3xl text-primary text-glow mt-1">
          {Math.round(distance)}
        </div>
        <span className="text-xs text-muted-foreground">leagues</span>
        
        {/* Difficulty Badge */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className={`flex items-center justify-center gap-1 ${difficultyConfig.color}`}>
            <Skull className="w-4 h-4" />
            <span className="text-sm font-bold">{difficultyConfig.name}</span>
            <span className="text-xs text-muted-foreground ml-1">(x{difficultyConfig.scoreMultiplier})</span>
          </div>
        </div>
        
        {/* Time and Weather */}
        <div className="mt-3 pt-3 border-t border-border flex justify-around">
          <div className="flex flex-col items-center">
            {getTimeIcon(timeOfDay)}
            <span className="text-xs text-muted-foreground mt-1">{formatTime(timeOfDay)}</span>
          </div>
          <div className="flex flex-col items-center">
            {getWeatherIcon(weather)}
            <span className="text-xs text-muted-foreground mt-1 capitalize">{weather}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
