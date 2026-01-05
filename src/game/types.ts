import * as THREE from 'three';

export interface GameState {
  supplies: number;
  maxSupplies: number;
  health: number;
  maxHealth: number;
  speed: number;
  maxSpeed: number;
  distance: number;
  money: number;
  isPaused: boolean;
  isGameOver: boolean;
  isEncounterActive: boolean;
  currentEncounter: Encounter | null;
  timeOfDay: number;
  weather: WeatherType;
}

export type WeatherType = 'clear' | 'dusty' | 'sandstorm' | 'windy';

export interface Encounter {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
}

export interface Choice {
  id: string;
  text: string;
  outcome: Outcome;
}

export interface Outcome {
  suppliesChange: number;
  healthChange: number;
  moneyChange?: number;
  message: string;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export interface Obstacle {
  mesh: THREE.Object3D;
  lane: number;
  z: number;
  type: 'rock' | 'debris' | 'cactus';
}

export interface SupplyDrop {
  mesh: THREE.Object3D;
  lane: number;
  z: number;
  type: 'fuel' | 'health' | 'money' | 'supplies';
  value: number;
}

export interface SaveData {
  playerName: string;
  distance: number;
  money: number;
  date: string;
}

export const ENCOUNTERS: Encounter[] = [
  {
    id: "merchant",
    title: "A Wandering Merchant",
    description: "A weathered traveler approaches your jeep. His cart is laden with goods, and he offers you a trade.",
    choices: [
      { id: "trade", text: "Trade some supplies for medicine", outcome: { suppliesChange: -15, healthChange: 25, moneyChange: 0, message: "You exchange goods. The medicine will serve you well." }},
      { id: "decline", text: "Politely decline and continue", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "You bid farewell and continue your journey." }},
      { id: "barter", text: "Attempt to barter aggressively", outcome: { suppliesChange: 10, healthChange: -10, moneyChange: 15, message: "Your hard bargaining pays off with extra cash!" }},
    ],
  },
  {
    id: "oasis",
    title: "A Hidden Oasis",
    description: "Your jeep stumbles upon a small oasis, shimmering in the desert heat.",
    choices: [
      { id: "rest", text: "Rest and replenish your strength", outcome: { suppliesChange: -10, healthChange: 30, moneyChange: 0, message: "The cool water revives your spirits." }},
      { id: "resupply", text: "Gather supplies from the oasis", outcome: { suppliesChange: 25, healthChange: 10, moneyChange: 0, message: "You gather dates and fill your waterskins." }},
      { id: "skip", text: "No time to stop, keep moving", outcome: { suppliesChange: 0, healthChange: -5, moneyChange: 0, message: "You press on, the oasis fading behind you." }},
    ],
  },
  {
    id: "bandits",
    title: "Bandits on the Horizon",
    description: "Shadows move among the dunes. A group of desperate souls block your path.",
    choices: [
      { id: "pay", text: "Pay the toll ($25)", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: -25, message: "They take their share and let you pass." }},
      { id: "fight", text: "Floor it and crash through!", outcome: { suppliesChange: -10, healthChange: -25, moneyChange: 0, message: "A brutal escape. You're wounded but free." }},
      { id: "flee", text: "Try to outrun them", outcome: { suppliesChange: -10, healthChange: -15, moneyChange: 0, message: "You escape, but supplies scatter in the chaos." }},
    ],
  },
  {
    id: "stranger",
    title: "A Stranger in Need",
    description: "A lone figure collapses near the road, begging for help.",
    choices: [
      { id: "help", text: "Share your water and food", outcome: { suppliesChange: -20, healthChange: 5, moneyChange: 30, message: "Gratitude fills their eyes. They reward your kindness with $30." }},
      { id: "ignore", text: "Hardened by the road, you pass by", outcome: { suppliesChange: 0, healthChange: -10, moneyChange: 0, message: "Their cries haunt your conscience." }},
    ],
  },
  {
    id: "ruins",
    title: "Ancient Ruins",
    description: "Crumbling stone structures emerge from the sand. They look ancient.",
    choices: [
      { id: "explore", text: "Explore thoroughly", outcome: { suppliesChange: -15, healthChange: -10, moneyChange: 75, message: "You find valuable artifacts worth $75!" }},
      { id: "quick", text: "Take a quick look", outcome: { suppliesChange: -5, healthChange: 0, moneyChange: 20, message: "A brief search yields $20 in old coins." }},
      { id: "leave", text: "Too risky, leave", outcome: { suppliesChange: 0, healthChange: 5, moneyChange: 0, message: "The peaceful moment restores your spirit." }},
    ],
  },
];
