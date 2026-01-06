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
    <div className="absolute inset-0 bg-background/85 backdrop-blur-lg flex items-center justify-center z-20 animate-fade-in">
      <div className="max-w-2xl w-full mx-6 card-elevated border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden animate-slide-up glow-box-strong">
        {/* Header */}
        <div className="bg-gradient-to-r from-caravan-wood via-secondary to-secondary/50 p-8 border-b-2 border-primary/40">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Scroll className="w-8 h-8 text-primary animate-pulse-glow" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground text-glow-strong">{encounter.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!selectedOutcome ? (
            <>
              <p className="text-foreground leading-relaxed mb-8 text-lg">
                {encounter.description}
              </p>

              <div className="space-y-3">
                {encounter.choices.map((choice, idx) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-5 bg-gradient-to-r from-secondary/40 to-secondary/20 hover:from-secondary/80 hover:to-secondary/50 border-2 border-border hover:border-primary rounded-xl text-left transition-all duration-300 group hover-lift hover-glow"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground group-hover:text-primary transition-colors font-semibold">
                        {choice.text}
                      </span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="flex gap-4 text-xs flex-wrap">
                      {choice.outcome.suppliesChange !== 0 && (
                        <div className={`px-3 py-1 rounded-full font-semibold ${
                          choice.outcome.suppliesChange > 0
                            ? "bg-green-900/30 text-green-400 border border-green-700/50"
                            : "bg-red-900/30 text-red-400 border border-red-700/50"
                        }`}>
                          ⛽ {choice.outcome.suppliesChange > 0 ? "+" : ""}{choice.outcome.suppliesChange}
                        </div>
                      )}
                      {choice.outcome.healthChange !== 0 && (
                        <div className={`px-3 py-1 rounded-full font-semibold ${
                          choice.outcome.healthChange > 0
                            ? "bg-green-900/30 text-green-400 border border-green-700/50"
                            : "bg-red-900/30 text-red-400 border border-red-700/50"
                        }`}>
                          ❤️ {choice.outcome.healthChange > 0 ? "+" : ""}{choice.outcome.healthChange}
                        </div>
                      )}
                      {choice.outcome.moneyChange !== undefined && choice.outcome.moneyChange !== 0 && (
                        <div className={`px-3 py-1 rounded-full font-semibold ${
                          choice.outcome.moneyChange > 0
                            ? "bg-green-900/30 text-green-400 border border-green-700/50"
                            : "bg-red-900/30 text-red-400 border border-red-700/50"
                        }`}>
                          💰 {choice.outcome.moneyChange > 0 ? "+" : ""}{choice.outcome.moneyChange}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="animate-scale-in">
              <div className="bg-gradient-to-r from-secondary/50 to-secondary/20 border-2 border-primary/30 rounded-xl p-6 mb-8">
                <p className="text-foreground text-xl leading-relaxed italic font-semibold">
                  "{selectedOutcome.outcome.message}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {selectedOutcome.outcome.suppliesChange !== 0 && (
                  <div
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedOutcome.outcome.suppliesChange > 0
                        ? "bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-700/50 shadow-lg shadow-green-600/20"
                        : "bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-700/50 shadow-lg shadow-red-600/20"
                    }`}
                  >
                    <span className="text-sm text-muted-foreground block mb-2">⛽ Fuel</span>
                    <div
                      className={`text-3xl font-display font-bold ${
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
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedOutcome.outcome.healthChange > 0
                        ? "bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-700/50 shadow-lg shadow-green-600/20"
                        : "bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-700/50 shadow-lg shadow-red-600/20"
                    }`}
                  >
                    <span className="text-sm text-muted-foreground block mb-2">❤️ Health</span>
                    <div
                      className={`text-3xl font-display font-bold ${
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
                {selectedOutcome.outcome.moneyChange !== undefined && selectedOutcome.outcome.moneyChange !== 0 && (
                  <div
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedOutcome.outcome.moneyChange > 0
                        ? "bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-700/50 shadow-lg shadow-green-600/20"
                        : "bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-700/50 shadow-lg shadow-red-600/20"
                    }`}
                  >
                    <span className="text-sm text-muted-foreground block mb-2">💰 Credits</span>
                    <div
                      className={`text-3xl font-display font-bold ${
                        selectedOutcome.outcome.moneyChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedOutcome.outcome.moneyChange > 0 ? "+" : ""}
                      {selectedOutcome.outcome.moneyChange}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-display text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift btn-glow"
              >
                Continue Journey
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
