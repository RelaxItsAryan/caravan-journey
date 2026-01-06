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
      <div className="card-glass glow-box rounded-2xl p-6 shadow-xl pointer-events-auto max-w-sm">
        <h2 className="font-display text-xl text-primary mb-5 flex items-center gap-3 text-glow">
          <Compass className="w-6 h-6" />
          Caravan Status
        </h2>

        {/* Fuel Bar */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Fuel className="w-5 h-5 text-sunset-gold animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Fuel</span>
            <span className="text-sm text-primary ml-auto font-bold">{Math.round(supplies)}%</span>
          </div>
          <div className="h-3 bg-secondary/60 rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-sunset-gold to-amber-400 transition-all duration-300 rounded-full shadow-lg shadow-sunset-gold/40"
              style={{ width: `${supplies}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{supplies > 20 ? '🛢️ Flowing' : supplies > 10 ? '⚠️ Low' : '🔴 Critical'}</div>
        </div>

        {/* Health Bar */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Health</span>
            <span className="text-sm text-primary ml-auto font-bold">{Math.round(health)}%</span>
          </div>
          <div className="h-3 bg-secondary/60 rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full transition-all duration-300 rounded-full shadow-lg"
              style={{
                width: `${health}%`,
                background:
                  health > 50
                    ? "linear-gradient(to right, hsl(120, 70%, 50%), hsl(90, 80%, 55%))"
                    : health > 25
                    ? "linear-gradient(to right, hsl(45, 90%, 55%), hsl(30, 100%, 50%))"
                    : "linear-gradient(to right, hsl(0, 80%, 50%), hsl(0, 70%, 45%))",
                boxShadow: health > 50 ? '0 0 10px hsl(120, 70%, 50% / 0.4)' : health > 25 ? '0 0 10px hsl(30, 100%, 50% / 0.4)' : '0 0 10px hsl(0, 80%, 50% / 0.4)',
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{health > 50 ? '💪 Healthy' : health > 25 ? '🤕 Injured' : '❌ Critical'}</div>
        </div>

        {/* Speed Indicator */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Speed</span>
            <span className="text-sm text-primary ml-auto font-bold">{Math.round((speed / maxSpeed) * 100)}%</span>
          </div>
          <div className="h-3 bg-secondary/60 rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 rounded-full shadow-lg shadow-primary/40"
              style={{ width: `${(speed / maxSpeed) * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">⚡ {speed.toFixed(1)} u/s</div>
        </div>

        {/* Money */}
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-700/30 rounded-lg p-3 mt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold text-foreground">Credits</span>
            </div>
            <span className="text-xl font-display font-bold text-green-400 text-glow">${money}</span>
          </div>
        </div>
      </div>

      {/* Right HUD Panel - Distance & Status */}
      <div className="card-glass glow-box rounded-2xl p-6 shadow-xl pointer-events-auto text-center max-w-sm">
        <div className="mb-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Distance</span>
          <div className="font-display text-4xl text-glow-strong font-bold mt-2">
            {Math.round(distance)}
          </div>
          <span className="text-xs text-muted-foreground">miles</span>
        </div>
        
        {/* Difficulty Badge */}
        <div className="mb-4 pt-4 border-t border-border/40">
          <div className={`flex items-center justify-center gap-2 font-bold py-2 px-3 rounded-lg bg-secondary/40 ${difficultyConfig.color}`}>
            <Skull className="w-4 h-4" />
            <span className="text-sm">{difficultyConfig.name}</span>
            <span className="text-xs opacity-75">×{difficultyConfig.scoreMultiplier}</span>
          </div>
        </div>
        
        {/* Time and Weather */}
        <div className="border-t border-border/40 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/40 rounded-lg p-2">
              <div className="flex justify-center mb-1">
                {getTimeIcon(timeOfDay)}
              </div>
              <span className="text-xs text-muted-foreground block mb-1">{formatTime(timeOfDay)}</span>
              <div className="text-xs font-bold text-foreground">
                {timeOfDay >= 6 && timeOfDay < 12 ? '🌅 Morning' : 
                 timeOfDay >= 12 && timeOfDay < 18 ? '☀️ Afternoon' : 
                 timeOfDay >= 18 && timeOfDay < 21 ? '🌆 Evening' : '🌙 Night'}
              </div>
            </div>
            <div className="bg-secondary/40 rounded-lg p-2">
              <div className="flex justify-center mb-1">
                {getWeatherIcon(weather)}
              </div>
              <span className="text-xs text-muted-foreground block mb-1 capitalize">{weather}</span>
              <div className="text-xs font-bold text-foreground">
                {weather === 'clear' ? '🌞 Clear' :
                 weather === 'dusty' ? '💨 Dusty' :
                 weather === 'windy' ? '🌪️ Windy' :
                 weather === 'sandstorm' ? '🌪️ Storm' : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
