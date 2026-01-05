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
    <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-30 animate-fade-in">
      <div className="text-center max-w-md mx-6">
        <Skull className="w-20 h-20 text-destructive mx-auto mb-6 animate-pulse-glow" />

        <h1 className="font-display text-4xl text-foreground mb-4">Journey's End</h1>

        <p className="text-muted-foreground text-lg mb-6">
          {reason === "supplies"
            ? "Your supplies have run dry. The desert claims another traveler."
            : "Your health has failed. The road was too harsh."}
        </p>

        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <span className="text-sm text-muted-foreground">Distance Traveled</span>
          <div className="font-display text-5xl text-primary text-glow mt-2">
            {Math.round(distance)}
          </div>
          <span className="text-sm text-muted-foreground">leagues</span>
          
          {isHighScore && !hasSaved && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-yellow-500 mb-3">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">New High Score!</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={15}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleSaveScore}
                  disabled={!playerName.trim()}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
          
          {hasSaved && (
            <div className="mt-4 pt-4 border-t border-border text-green-500">
              Score saved! ✓
            </div>
          )}
        </div>

        {/* Leaderboard Toggle */}
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="text-primary hover:underline mb-4 flex items-center justify-center gap-2 mx-auto"
        >
          <Trophy className="w-4 h-4" />
          {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
        </button>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
            <h3 className="font-display text-lg text-primary mb-3">Top Travelers</h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center px-3 py-2 rounded ${
                      index === 0 ? 'bg-yellow-500/20' : 
                      index === 1 ? 'bg-gray-400/20' : 
                      index === 2 ? 'bg-orange-400/20' : 'bg-secondary/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground w-6">{index + 1}.</span>
                      <span className="text-foreground">{entry.playerName}</span>
                    </span>
                    <span className="text-primary font-bold">{entry.distance} leagues</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No scores yet. Be the first!</p>
            )}
          </div>
        )}

        <Button
          onClick={onRestart}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg px-8 py-6"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Begin Anew
        </Button>
      </div>
    </div>
  );
};
