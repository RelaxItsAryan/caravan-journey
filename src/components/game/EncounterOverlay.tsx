import { Encounter, Choice, Outcome } from "@/game/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Scroll, ArrowRight } from "lucide-react";

interface EncounterOverlayProps {
  encounter: Encounter;
  onChoice: (choice: Choice) => void;
}

export const EncounterOverlay = ({ encounter, onChoice }: EncounterOverlayProps) => {
  const [selectedOutcome, setSelectedOutcome] = useState<{
    choice: Choice;
    outcome: Outcome;
  } | null>(null);

  const handleChoice = (choice: Choice) => {
    setSelectedOutcome({ choice, outcome: choice.outcome });
  };

  const handleContinue = () => {
    if (selectedOutcome) {
      onChoice(selectedOutcome.choice);
    }
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in">
      <div className="max-w-2xl w-full mx-6 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-caravan-wood to-secondary p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Scroll className="w-8 h-8 text-primary" />
            <h2 className="font-display text-2xl text-foreground">{encounter.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedOutcome ? (
            <>
              <p className="text-foreground leading-relaxed mb-6 text-lg">
                {encounter.description}
              </p>

              <div className="space-y-3">
                {encounter.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 bg-secondary/50 hover:bg-secondary border border-border hover:border-primary rounded-lg text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground group-hover:text-primary transition-colors">
                        {choice.text}
                      </span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      {choice.outcome.suppliesChange !== 0 && (
                        <span
                          className={
                            choice.outcome.suppliesChange > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          Supplies: {choice.outcome.suppliesChange > 0 ? "+" : ""}
                          {choice.outcome.suppliesChange}
                        </span>
                      )}
                      {choice.outcome.healthChange !== 0 && (
                        <span
                          className={
                            choice.outcome.healthChange > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          Health: {choice.outcome.healthChange > 0 ? "+" : ""}
                          {choice.outcome.healthChange}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="bg-secondary/30 border border-border rounded-lg p-5 mb-6">
                <p className="text-foreground text-lg leading-relaxed italic">
                  "{selectedOutcome.outcome.message}"
                </p>
              </div>

              <div className="flex gap-4 mb-6">
                {selectedOutcome.outcome.suppliesChange !== 0 && (
                  <div
                    className={`flex-1 p-3 rounded-lg border ${
                      selectedOutcome.outcome.suppliesChange > 0
                        ? "bg-green-900/20 border-green-700"
                        : "bg-red-900/20 border-red-700"
                    }`}
                  >
                    <span className="text-sm text-muted-foreground">Supplies</span>
                    <div
                      className={`text-xl font-display ${
                        selectedOutcome.outcome.suppliesChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedOutcome.outcome.suppliesChange > 0 ? "+" : ""}
                      {selectedOutcome.outcome.suppliesChange}
                    </div>
                  </div>
                )}
                {selectedOutcome.outcome.healthChange !== 0 && (
                  <div
                    className={`flex-1 p-3 rounded-lg border ${
                      selectedOutcome.outcome.healthChange > 0
                        ? "bg-green-900/20 border-green-700"
                        : "bg-red-900/20 border-red-700"
                    }`}
                  >
                    <span className="text-sm text-muted-foreground">Health</span>
                    <div
                      className={`text-xl font-display ${
                        selectedOutcome.outcome.healthChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedOutcome.outcome.healthChange > 0 ? "+" : ""}
                      {selectedOutcome.outcome.healthChange}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg py-6"
              >
                Continue Journey
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
