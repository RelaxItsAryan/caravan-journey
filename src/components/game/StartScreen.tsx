import { Button } from "@/components/ui/button";
import { Compass, Play } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-caravan-wood/20 flex items-center justify-center z-30">
      <div className="text-center max-w-2xl mx-6 animate-fade-in">
        <Compass className="w-24 h-24 text-primary mx-auto mb-8 animate-pulse-glow" />

        <h1 className="font-display text-6xl text-foreground mb-4 tracking-wide">
          Caravans & Crossroads
        </h1>

        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Guide your caravan across the endless desert. Manage your resources wisely,
          for the road is long and full of peril. At each crossroad, fate presents its hand.
        </p>

        <div className="bg-card/50 border border-border rounded-lg p-6 mb-8 text-left">
          <h3 className="font-display text-lg text-primary mb-4">The Journey Awaits</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">W/S</strong> - Increase or decrease speed</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span><strong className="text-foreground">A/D</strong> - Steer left or right</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span>Watch your <strong className="text-foreground">Supplies</strong> — they deplete with travel</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span>Encounters at <strong className="text-foreground">Crossroads</strong> shape your fate</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={onStart}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xl px-12 py-7 shadow-lg hover:shadow-xl transition-all"
        >
          <Play className="w-6 h-6 mr-3" />
          Begin Journey
        </Button>
      </div>
    </div>
  );
};
