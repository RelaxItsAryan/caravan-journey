import { Button } from "@/components/ui/button";
import { Skull, RotateCcw } from "lucide-react";

interface GameOverScreenProps {
  distance: number;
  reason: "supplies" | "health";
  onRestart: () => void;
}

export const GameOverScreen = ({ distance, reason, onRestart }: GameOverScreenProps) => {
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

        <div className="bg-card border border-border rounded-lg p-4 mb-8">
          <span className="text-sm text-muted-foreground">Distance Traveled</span>
          <div className="font-display text-5xl text-primary text-glow mt-2">
            {Math.round(distance)}
          </div>
          <span className="text-sm text-muted-foreground">leagues</span>
        </div>

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
