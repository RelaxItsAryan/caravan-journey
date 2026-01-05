import { useEffect, useRef, useState, useCallback } from "react";
import { GameEngine } from "@/game/GameEngine";
import { InputHandler } from "@/game/InputHandler";
import { GameState, Choice, ENCOUNTERS } from "@/game/types";
import { GameHUD } from "./GameHUD";
import { EncounterOverlay } from "./EncounterOverlay";
import { ControlsGuide } from "./ControlsGuide";
import { GameOverScreen } from "./GameOverScreen";
import { StartScreen } from "./StartScreen";

const INITIAL_STATE: GameState = {
  supplies: 100,
  health: 100,
  distance: 0,
  speed: 0,
  maxSpeed: 1,
  isPaused: true,
  isEncounterActive: false,
  currentEncounter: null,
};

export const CaravansGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const inputRef = useRef<InputHandler | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const encounterCooldownRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [hasStarted, setHasStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<"supplies" | "health">("supplies");

  const getRandomEncounter = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * ENCOUNTERS.length);
    return ENCOUNTERS[randomIndex];
  }, []);

  const handleCrossroadReached = useCallback(() => {
    if (encounterCooldownRef.current > 0) return;

    encounterCooldownRef.current = 100; // Cooldown to prevent rapid triggering

    setGameState((prev) => ({
      ...prev,
      isPaused: true,
      isEncounterActive: true,
      currentEncounter: getRandomEncounter(),
    }));
  }, [getRandomEncounter]);

  const handleChoice = useCallback((choice: Choice) => {
    setGameState((prev) => {
      const newSupplies = Math.max(0, Math.min(100, prev.supplies + choice.outcome.suppliesChange));
      const newHealth = Math.max(0, Math.min(100, prev.health + choice.outcome.healthChange));

      return {
        ...prev,
        supplies: newSupplies,
        health: newHealth,
        isPaused: false,
        isEncounterActive: false,
        currentEncounter: null,
      };
    });
  }, []);

  const handleStart = useCallback(() => {
    setHasStarted(true);
    setGameState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(INITIAL_STATE);
    setIsGameOver(false);
    setHasStarted(false);
    encounterCooldownRef.current = 0;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize game engine and input
    engineRef.current = new GameEngine(containerRef.current);
    inputRef.current = new InputHandler();

    // Set up crossroad callback
    engineRef.current.onCrossroadReached = handleCrossroadReached;

    // Animation loop
    const gameLoop = (currentTime: number) => {
      if (!engineRef.current || !inputRef.current) return;

      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = currentTime;

      // Limit delta time to prevent huge jumps
      const clampedDelta = Math.min(deltaTime, 0.1);

      setGameState((prev) => {
        if (prev.isPaused || !hasStarted) {
          engineRef.current?.update(clampedDelta, 0, 0, true);
          return prev;
        }

        // Process input
        const input = inputRef.current!.getState();

        // Update speed based on input
        let newSpeed = prev.speed;
        if (input.forward) {
          newSpeed = Math.min(prev.maxSpeed, newSpeed + clampedDelta * 0.5);
        } else if (input.backward) {
          newSpeed = Math.max(0, newSpeed - clampedDelta * 0.8);
        } else {
          // Natural deceleration
          newSpeed = Math.max(0, newSpeed - clampedDelta * 0.2);
        }

        // Calculate steering
        let steering = 0;
        if (input.left) steering = -1;
        if (input.right) steering = 1;

        // Update engine
        const movement = engineRef.current!.update(clampedDelta, newSpeed, steering, false);

        // Update supplies drain (based on speed)
        const suppliesDrain = clampedDelta * (0.5 + newSpeed * 2);
        const newSupplies = Math.max(0, prev.supplies - suppliesDrain);

        // Update encounter cooldown
        if (encounterCooldownRef.current > 0) {
          encounterCooldownRef.current -= movement;
        }

        // Check game over conditions
        if (newSupplies <= 0 && !isGameOver) {
          setIsGameOver(true);
          setGameOverReason("supplies");
        }
        if (prev.health <= 0 && !isGameOver) {
          setIsGameOver(true);
          setGameOverReason("health");
        }

        return {
          ...prev,
          speed: newSpeed,
          supplies: newSupplies,
          distance: prev.distance + movement * 0.1,
        };
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
      engineRef.current?.dispose();
      inputRef.current?.dispose();
    };
  }, [hasStarted, handleCrossroadReached, isGameOver]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Start Screen */}
      {!hasStarted && !isGameOver && <StartScreen onStart={handleStart} />}

      {/* Game HUD */}
      {hasStarted && !isGameOver && <GameHUD gameState={gameState} />}

      {/* Controls Guide */}
      {hasStarted && !gameState.isEncounterActive && !isGameOver && <ControlsGuide />}

      {/* Encounter Overlay */}
      {gameState.isEncounterActive && gameState.currentEncounter && (
        <EncounterOverlay
          encounter={gameState.currentEncounter}
          onChoice={handleChoice}
        />
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <GameOverScreen
          distance={gameState.distance}
          reason={gameOverReason}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};
