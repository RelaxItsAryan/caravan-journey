export interface GameState {
  supplies: number;
  health: number;
  distance: number;
  speed: number;
  maxSpeed: number;
  isPaused: boolean;
  isEncounterActive: boolean;
  currentEncounter: Encounter | null;
}

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
  message: string;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export const ENCOUNTERS: Encounter[] = [
  {
    id: "merchant",
    title: "A Wandering Merchant",
    description: "A weathered traveler approaches your caravan. His cart is laden with goods, and he offers you a trade.",
    choices: [
      {
        id: "trade",
        text: "Trade some supplies for medicine",
        outcome: {
          suppliesChange: -15,
          healthChange: 25,
          message: "You exchange goods. The medicine will serve you well on the road ahead.",
        },
      },
      {
        id: "decline",
        text: "Politely decline and continue",
        outcome: {
          suppliesChange: 0,
          healthChange: 0,
          message: "You bid farewell and continue your journey. The merchant waves goodbye.",
        },
      },
      {
        id: "barter",
        text: "Attempt to barter aggressively",
        outcome: {
          suppliesChange: 10,
          healthChange: -10,
          message: "Your hard bargaining pays off, but the stress takes its toll.",
        },
      },
    ],
  },
  {
    id: "oasis",
    title: "A Hidden Oasis",
    description: "Your caravan stumbles upon a small oasis, shimmering in the desert heat. A chance to rest at last.",
    choices: [
      {
        id: "rest",
        text: "Rest and replenish your strength",
        outcome: {
          suppliesChange: -10,
          healthChange: 30,
          message: "The cool water revives your spirits. You feel refreshed and ready to continue.",
        },
      },
      {
        id: "resupply",
        text: "Gather supplies from the oasis",
        outcome: {
          suppliesChange: 25,
          healthChange: 10,
          message: "You gather dates and fill your waterskins. The oasis provides.",
        },
      },
      {
        id: "skip",
        text: "No time to stop, keep moving",
        outcome: {
          suppliesChange: 0,
          healthChange: -5,
          message: "You press on, the mirage-like oasis fading behind you.",
        },
      },
    ],
  },
  {
    id: "bandits",
    title: "Bandits on the Horizon",
    description: "Shadows move among the dunes. A group of desperate souls block your path, weapons drawn.",
    choices: [
      {
        id: "pay",
        text: "Pay the toll they demand",
        outcome: {
          suppliesChange: -25,
          healthChange: 0,
          message: "They take their share and let you pass. A costly but safe passage.",
        },
      },
      {
        id: "fight",
        text: "Stand your ground and fight",
        outcome: {
          suppliesChange: 5,
          healthChange: -25,
          message: "A brutal skirmish. You drive them off but bear the wounds.",
        },
      },
      {
        id: "flee",
        text: "Attempt to outrun them",
        outcome: {
          suppliesChange: -10,
          healthChange: -15,
          message: "You escape, but in the chaos, supplies scatter and the chase exhausts you.",
        },
      },
    ],
  },
  {
    id: "stranger",
    title: "A Stranger in Need",
    description: "A lone figure collapses near the road. They reach out with trembling hands, begging for help.",
    choices: [
      {
        id: "help",
        text: "Share your water and food",
        outcome: {
          suppliesChange: -20,
          healthChange: 5,
          message: "Gratitude fills their eyes. They share knowledge of a safer route ahead.",
        },
      },
      {
        id: "ignore",
        text: "Hardened by the road, you pass by",
        outcome: {
          suppliesChange: 0,
          healthChange: -10,
          message: "Their cries haunt your conscience. The desert is merciless.",
        },
      },
      {
        id: "take",
        text: "Take what little they have",
        outcome: {
          suppliesChange: 15,
          healthChange: -20,
          message: "Desperate times... but at what cost to your soul?",
        },
      },
    ],
  },
  {
    id: "caravan",
    title: "A Fellow Caravan",
    description: "Another caravan approaches from the opposite direction. Their leader signals for a meeting.",
    choices: [
      {
        id: "share",
        text: "Share news and trade stories",
        outcome: {
          suppliesChange: 5,
          healthChange: 10,
          message: "Good company lifts your spirits. They share some dried meat for the road.",
        },
      },
      {
        id: "trade",
        text: "Propose a formal trade agreement",
        outcome: {
          suppliesChange: 15,
          healthChange: 0,
          message: "A fair exchange of goods. Both caravans benefit from the deal.",
        },
      },
      {
        id: "hurry",
        text: "Wave and continue without stopping",
        outcome: {
          suppliesChange: 0,
          healthChange: 0,
          message: "They nod in understanding. The road calls to all travelers.",
        },
      },
    ],
  },
];
