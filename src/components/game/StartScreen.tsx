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
        <Compass className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-glow" />

        <h1 className="font-display text-5xl text-foreground mb-3 tracking-wide">
          Desert Runner
        </h1>

        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          Drive your jeep across the endless desert. Navigate obstacles, collect supplies,
          trade at outposts, and survive the harsh weather. How far can you go?
        </p>

        <div className="bg-card/50 border border-border rounded-lg p-4 mb-4 text-left">
          <h3 className="font-display text-base text-primary mb-2">Controls</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">W/S</strong> - Speed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">A/D</strong> - Steer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">•</span>
              <span>Avoid obstacles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">•</span>
              <span>Collect drops</span>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="bg-card/50 border border-border rounded-lg p-3 mb-4">
          <h3 className="font-display text-sm text-primary mb-2">Select Difficulty</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[]).map((level) => {
              const config = DIFFICULTY_CONFIGS[level];
              const isSelected = selectedDifficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`p-2 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-primary bg-primary/20' 
                      : 'border-border bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className={`font-display text-base ${config.color}`}>
                    {config.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                  <div className="text-xs text-primary mt-1">
                    Score: x{config.scoreMultiplier}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center mb-4">
          <Button
            onClick={() => onStart(selectedDifficulty)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg px-10 py-5 shadow-lg hover:shadow-xl transition-all"
          >
            <Play className="w-5 h-5 mr-2" />
            Begin Journey
          </Button>

          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="text-primary hover:underline flex items-center gap-2 text-sm"
          >
            <Trophy className="w-4 h-4" />
            {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
          </button>
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="bg-card border border-border rounded-lg p-3 max-h-36 overflow-y-auto">
            <h3 className="font-display text-sm text-primary mb-2">Top Travelers</h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-1">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center px-2 py-1 rounded text-sm ${
                      index === 0 ? 'bg-yellow-500/20' : 
                      index === 1 ? 'bg-gray-400/20' : 
                      index === 2 ? 'bg-orange-400/20' : 'bg-secondary/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground w-5">{index + 1}.</span>
                      <span className="text-foreground">{entry.playerName}</span>
                    </span>
                    <span className="text-primary font-bold">{entry.distance} leagues</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No scores yet. Be the first!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
