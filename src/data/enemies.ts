// Invasive species definitions and traits for Midwest Invaders

export type EnemyType =
  | 'emerald_ash_borer'
  | 'spotted_lanternfly'
  | 'garlic_mustard'
  | 'japanese_knotweed'
  | 'knotweed_sprout'
  | 'zebra_mussel'
  | 'asian_carp'
  | 'feral_hog'
  | 'buckthorn_titan';

export interface EnemyConfig {
  id: EnemyType;
  name: string;
  scientificName: string;
  description: string;
  health: number;
  speed: number; // pixels per second
  rewardSun: number;
  rewardBiomass: number;
  sanctuaryDamage: number;
  isFlying?: boolean;
  isArmored?: boolean; // takes 60% less light projectile damage
  isAllelopathic?: boolean; // slows nearby tower attack rate
  canSplitInto?: { type: EnemyType; count: number };
  regenRate?: number; // hp per second
  jumpInterval?: number; // seconds between speed bursts (Lanternfly / Carp)
  color: string;
  size: number;
  icon: string;
}

export const ENEMIES: Record<EnemyType, EnemyConfig> = {
  garlic_mustard: {
    id: 'garlic_mustard',
    name: 'Garlic Mustard',
    scientificName: 'Alliaria petiolata',
    description: 'Releases phytotoxins (allelopathy) into soil, reducing attack rates of nearby native plants.',
    health: 65,
    speed: 48,
    rewardSun: 14,
    rewardBiomass: 4,
    sanctuaryDamage: 1,
    isAllelopathic: true,
    color: '#84cc16',
    size: 13,
    icon: '🌿',
  },

  spotted_lanternfly: {
    id: 'spotted_lanternfly',
    name: 'Spotted Lanternfly',
    scientificName: 'Lycorma delicatula',
    description: 'Acrobatic sap-sucker that leaps forward in bursts and secretes honeydew.',
    health: 90,
    speed: 55,
    rewardSun: 20,
    rewardBiomass: 6,
    sanctuaryDamage: 1,
    jumpInterval: 3.5,
    color: '#f43f5e',
    size: 14,
    icon: '🪰',
  },

  emerald_ash_borer: {
    id: 'emerald_ash_borer',
    name: 'Emerald Ash Borer',
    scientificName: 'Agrilus planipennis',
    description: 'Fast metallic green wood-borer. Airborne, evasive, takes 50% less damage from non-aerial attacks.',
    health: 80,
    speed: 82,
    rewardSun: 22,
    rewardBiomass: 7,
    sanctuaryDamage: 2,
    isFlying: true,
    color: '#10b981',
    size: 13,
    icon: '🪲',
  },

  zebra_mussel: {
    id: 'zebra_mussel',
    name: 'Zebra Mussel Colony',
    scientificName: 'Dreissena polymorpha',
    description: 'Hard-shelled mollusk cluster. Extremely resistant to light darts; weak to Bur Oak acorn crushers!',
    health: 160,
    speed: 36,
    rewardSun: 28,
    rewardBiomass: 10,
    sanctuaryDamage: 2,
    isArmored: true,
    color: '#64748b',
    size: 16,
    icon: '🐚',
  },

  japanese_knotweed: {
    id: 'japanese_knotweed',
    name: 'Japanese Knotweed',
    scientificName: 'Fallopia japonica',
    description: 'Relentless creeping bamboo-like invader. When defeated, it splits into 2 aggressive Knotweed Sprouts!',
    health: 220,
    speed: 42,
    rewardSun: 32,
    rewardBiomass: 12,
    sanctuaryDamage: 3,
    canSplitInto: { type: 'knotweed_sprout', count: 2 },
    color: '#eab308',
    size: 17,
    icon: '🌾',
  },

  knotweed_sprout: {
    id: 'knotweed_sprout',
    name: 'Knotweed Sprout',
    scientificName: 'Fallopia japonica (juvenile)',
    description: 'Vigorous juvenile shoot running fast to take root in disturbed soil.',
    health: 75,
    speed: 68,
    rewardSun: 10,
    rewardBiomass: 3,
    sanctuaryDamage: 1,
    color: '#facc15',
    size: 11,
    icon: '🌱',
  },

  asian_carp: {
    id: 'asian_carp',
    name: 'Asian Silver Carp',
    scientificName: 'Hypophthalmichthys molitrix',
    description: 'Fast erratic swimmer and jumper that lunges along waterways, evading beaver blockades.',
    health: 140,
    speed: 78,
    rewardSun: 26,
    rewardBiomass: 8,
    sanctuaryDamage: 2,
    jumpInterval: 2.8,
    color: '#38bdf8',
    size: 15,
    icon: '🐟',
  },

  feral_hog: {
    id: 'feral_hog',
    name: 'Feral Hog [Boss]',
    scientificName: 'Sus scrofa',
    description: 'Destructive rooter with immense health. Rips through ground traps and cannot be slowed.',
    health: 1650,
    speed: 44,
    rewardSun: 160,
    rewardBiomass: 60,
    sanctuaryDamage: 8,
    color: '#78350f',
    size: 26,
    icon: '🐗',
  },

  buckthorn_titan: {
    id: 'buckthorn_titan',
    name: 'Buckthorn Titan [Boss]',
    scientificName: 'Rhamnus cathartica',
    description: 'Massive woody thicket that casts suffocating shade. Regenerates 40 HP per second and shields companions!',
    health: 2600,
    speed: 32,
    rewardSun: 240,
    rewardBiomass: 100,
    sanctuaryDamage: 10,
    isArmored: true,
    regenRate: 40,
    color: '#1e293b',
    size: 30,
    icon: '🌲',
  },
};
