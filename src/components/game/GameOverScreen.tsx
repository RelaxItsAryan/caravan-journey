import { Button } from "@/components/ui/button";
import { Skull, RotateCcw, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { SaveManager } from "@/game/SaveManager";
import { SaveData } from "@/game/types";

interface GameOverScreenProps {
  distance: number;
  reason: "supplies" | "health";
  onRestart: () => void;
}

export const GameOverScreen = ({ distance, reason, onRestart }: GameOverScreenProps) => {
  const [playerName, setPlayerName] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<SaveData[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    setLeaderboard(SaveManager.getLeaderboard());
  }, []);

  const handleSaveScore = () => {
    if (playerName.trim()) {
      SaveManager.saveScore(playerName.trim(), distance, 0);
      setHasSaved(true);
      setLeaderboard(SaveManager.getLeaderboard());
    }
  };

  const isHighScore = SaveManager.isHighScore(distance);

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-xl flex items-center justify-center z-30 animate-fade-in">
      <div className="text-center max-w-2xl mx-6 animate-slide-up-lg">
        {/* Skull Icon with Glow */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 blur-3xl bg-destructive/40 rounded-full opacity-60 animate-pulse"></div>
          <Skull className="w-24 h-24 text-destructive mx-auto relative animate-pulse-glow-strong" />
        </div>

        <h1 className="font-display text-5xl font-bold text-foreground mb-3 tracking-wider">
          Journey's End
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-destructive to-transparent mx-auto mb-6"></div>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
          {reason === "supplies"
            ? "⛽ Your fuel tank runs empty. The desert claims another traveler's dream."
            : "❤️ Your strength fades. The harsh road was unforgiving."}
        </p>

        {/* Distance Card */}
        <div className="card-elevated border border-primary/30 rounded-xl p-8 mb-6 glow-box-strong">
          <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Distance Traveled</span>
          <div className="font-display text-7xl text-glow-strong font-bold mt-3 mb-2">
            {Math.round(distance)}
          </div>
          <span className="text-sm text-muted-foreground">miles</span>
          
          {isHighScore && !hasSaved && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-3 text-yellow-400 mb-4 animate-bounce-glow">
                <Trophy className="w-6 h-6" />
                <span className="font-display text-2xl font-bold">🏆 New High Score! 🏆</span>
              </div>
              <div className="flex gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={15}
                  className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  autoFocus
                />
                <Button
                  onClick={handleSaveScore}
                  disabled={!playerName.trim()}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold px-5 transition-all duration-300 hover-lift disabled:opacity-50 disabled:hover:scale-100"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
          
          {hasSaved && (
            <div className="mt-6 pt-6 border-t border-green-700/50 bg-green-900/20 rounded-lg p-3 flex items-center justify-center gap-2 text-green-400 animate-scale-in">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">Score saved! You made the leaderboard!</span>
            </div>
          )}
        </div>

        {/* Leaderboard Toggle */}
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="text-primary hover:text-accent flex items-center justify-center gap-2 mx-auto mb-6 font-semibold transition-colors duration-300 hover:scale-105"
        >
          <Trophy className="w-5 h-5" />
          {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
        </button>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="card-elevated border border-primary/30 rounded-xl p-6 mb-6 max-h-72 overflow-y-auto animate-scale-in">
            <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2 justify-center">
              <Trophy className="w-6 h-6" />
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
                        <span className="text-2xl w-8">{medal}</span>
                        <span className="text-foreground font-medium">{entry.playerName}</span>
                      </span>
                      <span className="text-primary font-bold text-lg">{entry.distance} mi</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center italic">No scores yet. Be the first legend!</p>
            )}
          </div>
        )}

        {/* Restart Button */}
        <Button
          onClick={onRestart}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-display text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift btn-glow"
        >
          <RotateCcw className="w-5 h-5 mr-3" />
          Start New Journey
        </Button>
      </div>
    </div>
  );
};
