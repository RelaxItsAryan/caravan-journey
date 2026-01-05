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
  weatherIntensity: number;
  isTrading: boolean;
  tradingPost: TradingPost | null;
}

export interface TradingPost {
  name: string;
  items: TradingItem[];
}

export interface TradingItem {
  id: string;
  name: string;
  type: 'supplies' | 'health' | 'upgrade';
  cost: number;
  value: number;
  description: string;
}

export type WeatherType = 'clear' | 'dusty' | 'sandstorm' | 'windy';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'insane';

export interface DifficultyConfig {
  name: string;
  description: string;
  obstacleSpawnRate: number;      // Multiplier for obstacle spawn frequency
  obstacleDamage: number;         // Multiplier for damage taken
  fuelConsumption: number;        // Multiplier for fuel drain speed
  supplyDropRate: number;         // Multiplier for supply drop frequency
  startingFuel: number;           // Starting fuel percentage
  startingHealth: number;         // Starting health percentage
  startingMoney: number;          // Starting money
  scoreMultiplier: number;        // Score multiplier
  color: string;                  // UI color for the difficulty
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    description: 'Relaxed journey with plenty of supplies',
    obstacleSpawnRate: 0.6,
    obstacleDamage: 0.7,
    fuelConsumption: 0.5,
    supplyDropRate: 1.5,
    startingFuel: 100,
    startingHealth: 100,
    startingMoney: 100,
    scoreMultiplier: 0.5,
    color: 'text-green-400'
  },
  medium: {
    name: 'Medium',
    description: 'Balanced challenge for experienced drivers',
    obstacleSpawnRate: 1.0,
    obstacleDamage: 1.0,
    fuelConsumption: 0.6,
    supplyDropRate: 1.0,
    startingFuel: 100,
    startingHealth: 100,
    startingMoney: 50,
    scoreMultiplier: 1.0,
    color: 'text-yellow-400'
  },
  hard: {
    name: 'Hard',
    description: 'Treacherous roads and scarce resources',
    obstacleSpawnRate: 1.5,
    obstacleDamage: 1.3,
    fuelConsumption: 0.6,
    supplyDropRate: 0.7,
    startingFuel: 90,
    startingHealth: 100,
    startingMoney: 30,
    scoreMultiplier: 1.5,
    color: 'text-orange-400'
  },
  insane: {
    name: 'Insane',
    description: 'Only the bravest dare attempt this',
    obstacleSpawnRate: 2.0,
    obstacleDamage: 1.8,
    fuelConsumption: 0.6,
    supplyDropRate: 0.5,
    startingFuel: 80,
    startingHealth: 80,
    startingMoney: 10,
    scoreMultiplier: 2.5,
    color: 'text-red-500'
  }
};

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
  type: 'rock' | 'debris' | 'cactus' | 'barrel' | 'tumbleweed' | 'brokenCar' | 'oilSpill' | 'trafficCar' | 'truck' | 'motorcycle' | 'pothole' | 'constructionBarrier' | 'sandbags' | 'policeCar' | 'ambulance' | 'sportsCar' | 'bus' | 'pickupTruck' | 'taxi';
  isMoving?: boolean;
  moveDirection?: number;
}

export interface SupplyDrop {
  mesh: THREE.Object3D;
  lane: number;
  z: number;
  type: 'fuel' | 'health' | 'money' | 'coin' | 'goldCoin' | 'diamond' | 'gem' | 'ruby' | 'emerald';
  value: number;
}

export interface SaveData {
  playerName: string;
  distance: number;
  money: number;
  date: string;
  weather?: WeatherType;
}

export const TRADING_POSTS: TradingPost[] = [
  {
    name: "Desert Outpost",
    items: [
      { id: "water", name: "Water Canteen", type: "supplies", cost: 20, value: 25, description: "Fresh water from the oasis" },
      { id: "medkit", name: "First Aid Kit", type: "health", cost: 30, value: 30, description: "Bandages and medicine" },
      { id: "fuel", name: "Fuel Can", type: "supplies", cost: 25, value: 20, description: "Extra fuel for the journey" },
    ]
  },
  {
    name: "Nomad Camp",
    items: [
      { id: "provisions", name: "Dried Provisions", type: "supplies", cost: 15, value: 20, description: "Long-lasting food" },
      { id: "herbs", name: "Healing Herbs", type: "health", cost: 20, value: 20, description: "Natural remedies" },
      { id: "repair", name: "Repair Kit", type: "health", cost: 40, value: 40, description: "Fix vehicle damage" },
    ]
  },
  {
    name: "Smuggler's Den",
    items: [
      { id: "premium_fuel", name: "Premium Fuel", type: "supplies", cost: 35, value: 35, description: "High-octane fuel" },
      { id: "armor", name: "Armor Plating", type: "health", cost: 50, value: 50, description: "Reduce future damage" },
      { id: "rations", name: "Military Rations", type: "supplies", cost: 30, value: 30, description: "Compact nutrition" },
    ]
  }
];

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
  {
    id: "sandstorm_warning",
    title: "Storm Approaching",
    description: "Dark clouds of sand loom on the horizon. A massive sandstorm is coming!",
    choices: [
      { id: "shelter", text: "Find shelter and wait it out", outcome: { suppliesChange: -20, healthChange: 5, moneyChange: 0, message: "You wait safely as the storm passes. Time and supplies spent." }},
      { id: "drive_through", text: "Floor it through the storm!", outcome: { suppliesChange: -10, healthChange: -25, moneyChange: 0, message: "The sand batters your jeep mercilessly." }},
      { id: "detour", text: "Take a long detour", outcome: { suppliesChange: -25, healthChange: 0, moneyChange: 0, message: "The detour uses extra fuel but keeps you safe." }},
    ],
  },
  {
    id: "broken_vehicle",
    title: "Stranded Travelers",
    description: "A family is stranded with a broken-down vehicle. They wave desperately for help.",
    choices: [
      { id: "help_fix", text: "Help repair their vehicle", outcome: { suppliesChange: -15, healthChange: 0, moneyChange: 40, message: "They reward your kindness with $40!" }},
      { id: "share_supplies", text: "Share your supplies", outcome: { suppliesChange: -25, healthChange: 10, moneyChange: 0, message: "Their gratitude warms your heart." }},
      { id: "ignore", text: "You can't help everyone", outcome: { suppliesChange: 0, healthChange: -5, moneyChange: 0, message: "Their pleas fade behind you..." }},
    ],
  },
  {
    id: "trading_caravan",
    title: "Trading Caravan",
    description: "A well-protected trading caravan crosses your path. They're open for business!",
    choices: [
      { id: "buy_supplies", text: "Buy supplies ($30)", outcome: { suppliesChange: 35, healthChange: 0, moneyChange: -30, message: "You stock up on essential supplies." }},
      { id: "buy_medicine", text: "Buy medicine ($25)", outcome: { suppliesChange: 0, healthChange: 30, moneyChange: -25, message: "Quality medicine for the road ahead." }},
      { id: "sell_info", text: "Sell route information ($15)", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 15, message: "Your knowledge of the desert proves valuable." }},
      { id: "pass", text: "Just passing through", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "They wish you safe travels." }},
    ],
  },
  {
    id: "night_camp",
    title: "Nightfall Approaches",
    description: "The sun is setting fast. You'll need to decide how to spend the night.",
    choices: [
      { id: "camp", text: "Set up camp and rest", outcome: { suppliesChange: -10, healthChange: 25, moneyChange: 0, message: "A good night's sleep restores your energy." }},
      { id: "drive_night", text: "Drive through the night", outcome: { suppliesChange: -15, healthChange: -15, moneyChange: 0, message: "The darkness is treacherous, but you gain distance." }},
      { id: "guard", text: "Light rest, stay alert", outcome: { suppliesChange: -5, healthChange: 10, moneyChange: 0, message: "A cautious rest proves wise." }},
    ],
  },
  {
    id: "mirage",
    title: "Is That... Water?",
    description: "In the shimmering heat, you spot what looks like a lake ahead.",
    choices: [
      { id: "investigate", text: "Investigate carefully", outcome: { suppliesChange: -5, healthChange: 0, moneyChange: 0, message: "It was just a mirage. The desert plays tricks." }},
      { id: "rush", text: "Rush toward it!", outcome: { suppliesChange: -15, healthChange: -10, moneyChange: 0, message: "You waste fuel chasing an illusion." }},
      { id: "ignore_mirage", text: "Trust your instincts, ignore it", outcome: { suppliesChange: 0, healthChange: 5, moneyChange: 0, message: "Your experience serves you well." }},
    ],
  },
  {
    id: "wildlife",
    title: "Desert Wildlife",
    description: "You encounter a group of wild camels. They seem calm but unpredictable.",
    choices: [
      { id: "slow", text: "Slow down and let them pass", outcome: { suppliesChange: -5, healthChange: 0, moneyChange: 0, message: "The herd passes peacefully." }},
      { id: "honk", text: "Honk and push through", outcome: { suppliesChange: 0, healthChange: -15, moneyChange: 0, message: "An angry camel kicks your jeep!" }},
      { id: "detour_wildlife", text: "Take a wide detour", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 0, message: "Better safe than sorry." }},
    ],
  },
  {
    id: "fuel_cache",
    title: "Hidden Cache",
    description: "You spot what appears to be an abandoned supply cache partially buried in sand.",
    choices: [
      { id: "dig", text: "Dig it up!", outcome: { suppliesChange: 30, healthChange: -5, moneyChange: 10, message: "Jackpot! Supplies and some cash!" }},
      { id: "careful_dig", text: "Dig carefully", outcome: { suppliesChange: 15, healthChange: 0, moneyChange: 5, message: "You find some useful supplies." }},
      { id: "trap", text: "Could be a trap, leave it", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "You continue on, uncertain if you made the right choice." }},
    ],
  },
  {
    id: "racing_challenge",
    title: "Desert Racer!",
    description: "A souped-up dune buggy pulls alongside you. The driver challenges you to a race for $50!",
    choices: [
      { id: "accept_race", text: "Accept the challenge! ($20 entry)", outcome: { suppliesChange: -20, healthChange: -10, moneyChange: 50, message: "You push your jeep to the limit and WIN! $50 earned!" }},
      { id: "decline_race", text: "Too risky, decline", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "The racer speeds off in a cloud of dust." }},
      { id: "sabotage", text: "Pretend to race, then let them go", outcome: { suppliesChange: 5, healthChange: 5, moneyChange: 0, message: "Smart. You conserve energy while they waste theirs." }},
    ],
  },
  {
    id: "vultures",
    title: "Circling Vultures",
    description: "Vultures circle overhead. Not a good sign... Then you see it: a crashed vehicle ahead.",
    choices: [
      { id: "investigate_crash", text: "Investigate the crash", outcome: { suppliesChange: 20, healthChange: -5, moneyChange: 35, message: "You salvage supplies and find $35. The previous owner won't need them..." }},
      { id: "mark_location", text: "Mark location, keep moving", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "You note the location for others who might help." }},
      { id: "speed_away", text: "Bad omen! Speed away!", outcome: { suppliesChange: -10, healthChange: 5, moneyChange: 0, message: "Your superstition keeps you safe... or does it?" }},
    ],
  },
  {
    id: "military_checkpoint",
    title: "Military Checkpoint",
    description: "Armed soldiers block the road ahead. They're checking all vehicles passing through.",
    choices: [
      { id: "cooperate", text: "Cooperate fully", outcome: { suppliesChange: -5, healthChange: 0, moneyChange: -10, message: "They 'confiscate' some supplies and charge a 'tax'. But you pass safely." }},
      { id: "bribe", text: "Offer a generous bribe ($30)", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: -30, message: "The soldiers wave you through with a smile." }},
      { id: "alternate_route", text: "Find an alternate route", outcome: { suppliesChange: -25, healthChange: -10, moneyChange: 0, message: "The detour is long and dangerous, but you avoid the checkpoint." }},
    ],
  },
  {
    id: "treasure_map",
    title: "Mysterious Map",
    description: "An old man approaches, offering to sell you a 'genuine treasure map' for $25.",
    choices: [
      { id: "buy_map", text: "Buy the map ($25)", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 50, message: "Incredibly, the map leads to a hidden stash worth $75! Net profit: $50!" }},
      { id: "haggle", text: "Haggle for $10", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: -10, message: "He accepts, but the map is fake. You've been scammed!" }},
      { id: "refuse_map", text: "Obvious scam, refuse", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "You drive away. Smart... or did you miss out?" }},
    ],
  },
  {
    id: "engine_trouble",
    title: "Engine Warning!",
    description: "Your jeep's engine starts making concerning noises. Something's not right...",
    choices: [
      { id: "stop_repair", text: "Stop and repair (-15 supplies)", outcome: { suppliesChange: -15, healthChange: 0, moneyChange: 0, message: "You fix the issue. The jeep runs better than ever!" }},
      { id: "nurse_it", text: "Nurse it along carefully", outcome: { suppliesChange: -5, healthChange: 0, moneyChange: 0, message: "You manage to keep going, but the jeep is struggling." }},
      { id: "ignore_engine", text: "Floor it! It'll be fine!", outcome: { suppliesChange: -30, healthChange: -20, moneyChange: 0, message: "The engine blows! Major damage and fuel loss!" }},
    ],
  },
  {
    id: "dust_devil",
    title: "Dust Devil!",
    description: "A massive dust devil forms directly in your path! There's barely time to react!",
    choices: [
      { id: "hard_left", text: "Swerve LEFT hard!", outcome: { suppliesChange: -5, healthChange: -5, moneyChange: 0, message: "You narrowly avoid the worst of it!" }},
      { id: "hard_right", text: "Swerve RIGHT hard!", outcome: { suppliesChange: -5, healthChange: -5, moneyChange: 0, message: "Close call! You scrape by!" }},
      { id: "brake_hard", text: "Brake and brace!", outcome: { suppliesChange: -15, healthChange: -15, moneyChange: 0, message: "The dust devil batters your jeep mercilessly!" }},
    ],
  },
  {
    id: "radio_signal",
    title: "Mysterious Signal",
    description: "Your radio crackles to life with coordinates. Someone is broadcasting a distress signal!",
    choices: [
      { id: "follow_signal", text: "Follow the signal", outcome: { suppliesChange: -20, healthChange: 10, moneyChange: 60, message: "You rescue a wealthy traveler who rewards you handsomely!" }},
      { id: "ignore_signal", text: "Could be a trap", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "You'll never know what awaited at those coordinates." }},
      { id: "broadcast_back", text: "Broadcast your location", outcome: { suppliesChange: 10, healthChange: 5, moneyChange: 20, message: "Other travelers find YOU and share supplies!" }},
    ],
  },
];
