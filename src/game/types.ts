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
    fuelConsumption: 0.1,
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
    fuelConsumption: 0.2,
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
    fuelConsumption: 0.2,
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
    fuelConsumption: 0.2,
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
  {
    id: "abandoned_gas_station",
    title: "Abandoned Gas Station",
    description: "A rusted gas station emerges from the sand. The pumps look ancient, but there might be fuel underground.",
    choices: [
      { id: "siphon_fuel", text: "Try to siphon remaining fuel", outcome: { suppliesChange: 40, healthChange: -5, moneyChange: 0, message: "Success! The underground tank still had fuel!" }},
      { id: "search_station", text: "Search the building", outcome: { suppliesChange: 10, healthChange: 0, moneyChange: 25, message: "You find some snacks and cash in the register!" }},
      { id: "set_camp", text: "Use it as shelter", outcome: { suppliesChange: -5, healthChange: 20, moneyChange: 0, message: "A good rest in the shade does wonders." }},
      { id: "leave_station", text: "Too creepy, leave", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "Better not to linger in abandoned places." }},
    ],
  },
  {
    id: "helicopter_overhead",
    title: "Helicopter Overhead!",
    description: "A helicopter circles above you, its spotlight tracking your jeep. They're coming down!",
    choices: [
      { id: "signal_help", text: "Signal for help", outcome: { suppliesChange: 20, healthChange: 15, moneyChange: 0, message: "It's a rescue team! They drop supplies and medicine!" }},
      { id: "hide", text: "Hide under cover", outcome: { suppliesChange: -5, healthChange: 0, moneyChange: 0, message: "You wait nervously as the helicopter passes." }},
      { id: "keep_driving", text: "Ignore them, keep driving", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "The helicopter eventually loses interest." }},
    ],
  },
  {
    id: "quicksand",
    title: "Quicksand Trap!",
    description: "The ground beneath your tires feels soft... too soft! You're sinking!",
    choices: [
      { id: "gun_it", text: "Gun the engine! Full power!", outcome: { suppliesChange: -25, healthChange: 0, moneyChange: 0, message: "You burn fuel but escape the trap!" }},
      { id: "slow_escape", text: "Slowly reverse out", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 0, message: "Patient maneuvering gets you free safely." }},
      { id: "use_planks", text: "Use boards from your cargo", outcome: { suppliesChange: -15, healthChange: 5, moneyChange: 0, message: "Smart thinking! You create traction and escape." }},
    ],
  },
  {
    id: "meteor_shower",
    title: "Meteor Shower!",
    description: "The night sky lights up with falling stars! But wait... some are landing nearby!",
    choices: [
      { id: "collect_meteor", text: "Search for meteor fragments", outcome: { suppliesChange: -10, healthChange: -10, moneyChange: 100, message: "You find rare space rocks worth $100 to collectors!" }},
      { id: "watch_safely", text: "Watch from the jeep", outcome: { suppliesChange: 0, healthChange: 5, moneyChange: 0, message: "A beautiful show that lifts your spirits." }},
      { id: "flee_meteors", text: "This is dangerous! Drive away!", outcome: { suppliesChange: -15, healthChange: 0, moneyChange: 0, message: "You escape the impact zone safely." }},
    ],
  },
  {
    id: "nomad_tribe",
    title: "Nomad Tribe Gathering",
    description: "You stumble upon a large nomad gathering. Colorful tents and the smell of cooking food fill the air.",
    choices: [
      { id: "join_feast", text: "Join their feast", outcome: { suppliesChange: 20, healthChange: 25, moneyChange: -15, message: "An unforgettable night! You're welcomed as a guest." }},
      { id: "trade_stories", text: "Trade stories for information", outcome: { suppliesChange: 5, healthChange: 10, moneyChange: 0, message: "The elders share knowledge of safe routes ahead." }},
      { id: "buy_camel", text: "Buy a pack camel ($40)", outcome: { suppliesChange: 30, healthChange: 0, moneyChange: -40, message: "The camel carries extra supplies for you!" }},
      { id: "decline_politely", text: "Decline politely and leave", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "They wave you off with a blessing." }},
    ],
  },
  {
    id: "canyon_crossing",
    title: "Canyon Crossing",
    description: "A massive canyon blocks your path. There's a rickety bridge... or a long way around.",
    choices: [
      { id: "cross_bridge", text: "Risk the bridge!", outcome: { suppliesChange: 0, healthChange: -20, moneyChange: 0, message: "The bridge holds... barely. Your heart races!" }},
      { id: "reinforce_bridge", text: "Reinforce it first", outcome: { suppliesChange: -20, healthChange: 0, moneyChange: 0, message: "Smart! You cross safely with your repairs." }},
      { id: "long_detour", text: "Take the long way", outcome: { suppliesChange: -35, healthChange: 0, moneyChange: 0, message: "Hours of driving, but you're safe." }},
    ],
  },
  {
    id: "mysterious_cave",
    title: "Mysterious Cave",
    description: "A dark cave entrance beckons. Strange symbols are carved around its mouth.",
    choices: [
      { id: "explore_deep", text: "Explore deep inside", outcome: { suppliesChange: -20, healthChange: -15, moneyChange: 120, message: "Ancient treasure! Gold and jewels worth $120!" }},
      { id: "explore_entrance", text: "Check just the entrance", outcome: { suppliesChange: 5, healthChange: 5, moneyChange: 20, message: "You find a traveler's old stash." }},
      { id: "camp_outside", text: "Camp near the cool entrance", outcome: { suppliesChange: -5, healthChange: 15, moneyChange: 0, message: "A refreshing break from the heat." }},
      { id: "avoid_cave", text: "Something feels wrong, leave", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "Trust your instincts." }},
    ],
  },
  {
    id: "ghost_town",
    title: "Ghost Town",
    description: "An abandoned town looms ahead. The buildings are crumbling, but some look intact.",
    choices: [
      { id: "loot_thoroughly", text: "Search every building", outcome: { suppliesChange: 25, healthChange: -20, moneyChange: 45, message: "You find supplies and valuables, but the floors are treacherous!" }},
      { id: "quick_search", text: "Quick supply run", outcome: { suppliesChange: 15, healthChange: -5, moneyChange: 15, message: "You grab what you can safely reach." }},
      { id: "just_fuel", text: "Check for fuel only", outcome: { suppliesChange: 20, healthChange: 0, moneyChange: 0, message: "An old gas station still has fuel!" }},
      { id: "drive_through", text: "Too spooky, drive through", outcome: { suppliesChange: 0, healthChange: 5, moneyChange: 0, message: "You feel relieved leaving it behind." }},
    ],
  },
  {
    id: "injured_animal",
    title: "Injured Animal",
    description: "A beautiful desert fox is trapped under rocks, whimpering in pain.",
    choices: [
      { id: "rescue_fox", text: "Stop and rescue it", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 0, message: "The grateful fox leads you to a hidden water source! (+15 supplies)" }},
      { id: "put_out_misery", text: "A mercy ending...", outcome: { suppliesChange: 0, healthChange: -5, moneyChange: 0, message: "You did what had to be done. The desert is harsh." }},
      { id: "leave_animal", text: "Nature must take its course", outcome: { suppliesChange: 0, healthChange: -10, moneyChange: 0, message: "Its cries haunt you for miles..." }},
    ],
  },
  {
    id: "rival_driver",
    title: "Rival Driver!",
    description: "Another jeep pulls alongside! The driver looks competitive and revs their engine.",
    choices: [
      { id: "street_race", text: "Race them for pink slips!", outcome: { suppliesChange: -25, healthChange: -15, moneyChange: 80, message: "A dangerous race, but you WIN! $80 prize!" }},
      { id: "friendly_wave", text: "Wave and drive together", outcome: { suppliesChange: 5, healthChange: 5, moneyChange: 0, message: "They share some supplies and tips!" }},
      { id: "let_pass", text: "Let them pass", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "They speed off into the distance." }},
    ],
  },
  {
    id: "solar_eclipse",
    title: "Solar Eclipse",
    description: "The sky darkens as the moon covers the sun. An eerie silence falls over the desert.",
    choices: [
      { id: "observe_eclipse", text: "Stop and observe the phenomenon", outcome: { suppliesChange: -5, healthChange: 10, moneyChange: 0, message: "A spiritual moment that renews your determination." }},
      { id: "use_darkness", text: "Use the darkness to rest", outcome: { suppliesChange: -10, healthChange: 20, moneyChange: 0, message: "The cool darkness lets you sleep peacefully." }},
      { id: "keep_moving_eclipse", text: "Unusual events are bad omens", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 0, message: "You drive nervously until the sun returns." }},
    ],
  },
  {
    id: "underground_bunker",
    title: "Underground Bunker",
    description: "A hatch in the ground reveals a sealed underground bunker. The lock looks old.",
    choices: [
      { id: "break_in", text: "Break the lock and enter", outcome: { suppliesChange: 35, healthChange: 0, moneyChange: 50, message: "Military rations, medicine, and emergency cash!" }},
      { id: "check_carefully", text: "Check for traps first", outcome: { suppliesChange: 20, healthChange: 10, moneyChange: 30, message: "You avoided a booby trap and found supplies!" }},
      { id: "leave_bunker", text: "Could be contaminated, leave", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "Better safe than sorry in the wasteland." }},
    ],
  },
  {
    id: "flash_flood",
    title: "Flash Flood Warning!",
    description: "Dark clouds gather rapidly. The wash ahead could flood any moment!",
    choices: [
      { id: "race_across", text: "Race across NOW!", outcome: { suppliesChange: -10, healthChange: -10, moneyChange: 0, message: "You barely make it! Water crashes behind you!" }},
      { id: "wait_out", text: "Wait for the flood to pass", outcome: { suppliesChange: -20, healthChange: 5, moneyChange: 0, message: "Hours pass, but you survive safely." }},
      { id: "find_high_ground", text: "Find higher ground", outcome: { suppliesChange: -15, healthChange: 0, moneyChange: 10, message: "From up high, you spot debris with valuables!" }},
    ],
  },
  {
    id: "hot_air_balloon",
    title: "Hot Air Balloon!",
    description: "A colorful hot air balloon descends nearby. The pilot seems friendly!",
    choices: [
      { id: "trade_balloon", text: "Trade for aerial reconnaissance", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: -20, message: "They spot safe routes and supply drops ahead!" }},
      { id: "buy_supplies_balloon", text: "Buy their premium supplies ($30)", outcome: { suppliesChange: 35, healthChange: 0, moneyChange: -30, message: "Top-quality provisions from the sky!" }},
      { id: "just_chat", text: "Just chat and share stories", outcome: { suppliesChange: 5, healthChange: 10, moneyChange: 5, message: "A delightful conversation and small gift!" }},
    ],
  },
  {
    id: "scorpion_nest",
    title: "Scorpion Nest!",
    description: "You accidentally park near a scorpion nest! They're swarming toward your jeep!",
    choices: [
      { id: "drive_away", text: "Floor it immediately!", outcome: { suppliesChange: -5, healthChange: -5, moneyChange: 0, message: "You escape with minor stings!" }},
      { id: "use_fire", text: "Use a flare to scare them", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 0, message: "The fire drives them back! Clever!" }},
      { id: "wait_car", text: "Stay in the jeep and wait", outcome: { suppliesChange: 0, healthChange: -15, moneyChange: 0, message: "Some get inside! Painful stings!" }},
    ],
  },
  {
    id: "time_capsule",
    title: "Time Capsule",
    description: "You dig up what looks like a rusty box. Inside are items from decades ago!",
    choices: [
      { id: "take_all", text: "Take everything valuable", outcome: { suppliesChange: 5, healthChange: 0, moneyChange: 65, message: "Vintage coins and collectibles worth $65!" }},
      { id: "take_useful", text: "Take only useful items", outcome: { suppliesChange: 15, healthChange: 10, moneyChange: 10, message: "Old medicine still works! Plus some cash." }},
      { id: "add_item", text: "Add something and rebury it", outcome: { suppliesChange: -5, healthChange: 15, moneyChange: 0, message: "A meaningful moment. You feel at peace." }},
    ],
  },
  {
    id: "photographer",
    title: "Wildlife Photographer",
    description: "A photographer is taking pictures of rare desert wildlife. They need a ride!",
    choices: [
      { id: "give_ride", text: "Give them a ride", outcome: { suppliesChange: -15, healthChange: 0, moneyChange: 75, message: "They pay handsomely for the transport!" }},
      { id: "pose_photo", text: "Pose for a photo", outcome: { suppliesChange: 0, healthChange: 5, moneyChange: 10, message: "They give you $10 and a great memory!" }},
      { id: "decline_ride", text: "No passengers, too risky", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "They understand and wish you well." }},
    ],
  },
  {
    id: "drifting_sand",
    title: "Drifting Sands",
    description: "The road ahead is covered in deep, shifting sand. Your options are limited.",
    choices: [
      { id: "plow_through", text: "Plow straight through!", outcome: { suppliesChange: -20, healthChange: 0, moneyChange: 0, message: "Hard work and lots of fuel, but you make it!" }},
      { id: "deflate_tires", text: "Deflate tires for traction", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 0, message: "Smart desert driving! You cross easily." }},
      { id: "wait_wind", text: "Wait for wind to shift the sand", outcome: { suppliesChange: -15, healthChange: 5, moneyChange: 0, message: "Patience pays off. The path clears!" }},
    ],
  },
  {
    id: "medicine_man",
    title: "Desert Medicine Man",
    description: "An elderly healer approaches, offering his services. His remedies look... unusual.",
    choices: [
      { id: "full_treatment", text: "Full healing treatment ($25)", outcome: { suppliesChange: 0, healthChange: 40, moneyChange: -25, message: "Whatever was in that drink, you feel AMAZING!" }},
      { id: "buy_potions", text: "Buy healing potions ($15)", outcome: { suppliesChange: 0, healthChange: 20, moneyChange: -15, message: "Strange but effective medicine!" }},
      { id: "trade_supplies", text: "Trade supplies for healing", outcome: { suppliesChange: -20, healthChange: 30, moneyChange: 0, message: "He accepts your goods and heals your wounds." }},
      { id: "politely_refuse", text: "No thanks, just passing", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "He nods wisely and returns to the dunes." }},
    ],
  },
  {
    id: "crash_landing",
    title: "Crash Landing!",
    description: "A small plane crashes in the distance! Smoke rises from the wreckage!",
    choices: [
      { id: "rush_help", text: "Rush to help survivors!", outcome: { suppliesChange: -20, healthChange: -10, moneyChange: 100, message: "You save the pilot who rewards you with $100!" }},
      { id: "approach_carefully", text: "Approach carefully", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 50, message: "No survivors, but you salvage valuables." }},
      { id: "call_it_in", text: "Mark location and report it", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 20, message: "Authorities reward your civic duty." }},
      { id: "avoid_crash", text: "Too dangerous, avoid", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "You continue on, the smoke fading behind." }},
    ],
  },
  {
    id: "sandworm_rumble",
    title: "The Ground Rumbles!",
    description: "The earth shakes beneath you! Something MASSIVE is moving underground!",
    choices: [
      { id: "drive_rocks", text: "Drive to rocky ground!", outcome: { suppliesChange: -10, healthChange: 0, moneyChange: 0, message: "You reach safety just in time!" }},
      { id: "stay_still", text: "Stop and stay perfectly still", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 0, message: "The rumbling passes... whatever it was." }},
      { id: "speed_escape", text: "FLOOR IT!", outcome: { suppliesChange: -25, healthChange: -15, moneyChange: 0, message: "A close call! The thing nearly got you!" }},
    ],
  },
  {
    id: "lucky_break",
    title: "Lucky Break!",
    description: "You notice something glinting in your tire treads. It's a rare gem!",
    choices: [
      { id: "keep_gem", text: "Keep it for yourself", outcome: { suppliesChange: 0, healthChange: 0, moneyChange: 80, message: "It's worth $80! Your lucky day!" }},
      { id: "search_more", text: "Search the area for more", outcome: { suppliesChange: -15, healthChange: -5, moneyChange: 120, message: "More gems! Total haul: $120!" }},
      { id: "leave_gem", text: "Leave it, might be cursed", outcome: { suppliesChange: 0, healthChange: 5, moneyChange: 0, message: "Superstition or wisdom? You'll never know." }},
    ],
  },
];
