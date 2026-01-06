import { Button } from "@/components/ui/button";
import { Compass, Play, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { SaveManager } from "@/game/SaveManager";
import { SaveData, DifficultyLevel, DIFFICULTY_CONFIGS } from "@/game/types";

interface StartScreenProps {
  onStart: (difficulty: DifficultyLevel) => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<SaveData[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

  useEffect(() => {
    setLeaderboard(SaveManager.getLeaderboard());
  }, []);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-caravan-wood/20 flex items-center justify-center z-30 overflow-y-auto py-8">
      <div className="text-center max-w-2xl mx-6 animate-fade-in my-auto">
        {/* Title Section with Animation */}
        <div className="mb-8 animate-slide-up">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full opacity-60 animate-pulse"></div>
            <Compass className="w-20 h-20 text-primary mx-auto relative animate-bounce-glow" />
          </div>

          <h1 className="font-display text-6xl font-bold mb-2 tracking-wider text-glow-strong">
            Desert Runner
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
        </div>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
          Drive your jeep across the endless desert. Navigate obstacles, collect supplies,
          trade at outposts, and survive the harsh weather. How far can you go?
        </p>

        {/* Controls Box */}
        <div className="card-elevated border border-primary/30 rounded-xl p-6 mb-6 text-left animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-display text-lg text-primary mb-4 flex items-center gap-2">
            <span className="text-xl">⌨️</span> Quick Controls
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-3 bg-secondary/30 rounded-lg p-3">
              <span className="text-primary text-lg font-bold min-w-fit">W/S</span>
              <span className="text-muted-foreground">Accelerate & Brake</span>
            </div>
            <div className="flex items-start gap-3 bg-secondary/30 rounded-lg p-3">
              <span className="text-primary text-lg font-bold min-w-fit">A/D</span>
              <span className="text-muted-foreground">Steer Left & Right</span>
            </div>
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              <span className="text-red-400 text-lg">⚠️</span>
              <span className="text-muted-foreground">Avoid obstacles</span>
            </div>
            <div className="flex items-start gap-3 bg-green-900/20 border border-green-800/30 rounded-lg p-3">
              <span className="text-green-400 text-lg">💎</span>
              <span className="text-muted-foreground">Collect drops</span>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="card-elevated border border-primary/30 rounded-xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-display text-lg text-primary mb-4">Select Your Challenge</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[]).map((level) => {
              const config = DIFFICULTY_CONFIGS[level];
              const isSelected = selectedDifficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 hover-lift cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/40 glow-box' 
                      : 'border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/50'
                  }`}
                >
                  <div className={`font-display text-lg font-bold mb-1 ${config.color}`}>
                    {config.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {config.description}
                  </div>
                  <div className="text-xs bg-primary/20 text-primary rounded px-2 py-1 inline-block font-bold">
                    Score: ×{config.scoreMultiplier}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 items-center mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={() => onStart(selectedDifficulty)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-display text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift btn-glow relative"
          >
            <Play className="w-5 h-5 mr-3" />
            Begin Journey
          </Button>

          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="text-primary hover:text-accent flex items-center gap-2 text-sm font-semibold transition-colors duration-300 hover:scale-105"
          >
            <Trophy className="w-5 h-5" />
            {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
          </button>
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="card-elevated border border-primary/30 rounded-xl p-6 max-h-64 overflow-y-auto animate-scale-in">
            <h3 className="font-display text-lg text-primary mb-4 flex items-center gap-2 justify-center">
              <Trophy className="w-5 h-5" />
              Top Travelers
            </h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const medal = index < 3 ? medals[index] : `#${index + 1}`;
                  return (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center px-4 py-3 rounded-lg border transition-all ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-900/10 border-yellow-700/50 shadow-lg shadow-yellow-600/20' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-700/30 to-gray-700/10 border-gray-600/50' : 
                        index === 2 ? 'bg-gradient-to-r from-orange-900/30 to-orange-900/10 border-orange-700/50' : 
                        'bg-secondary/30 border-border/50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-2xl w-6">{medal}</span>
                        <span className="text-foreground font-medium">{entry.playerName}</span>
                      </span>
                      <span className="text-primary font-bold text-lg">{entry.distance} mi</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">No scores yet. Be the first explorer!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
