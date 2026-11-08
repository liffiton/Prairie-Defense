// Tower definitions, upgrade branches, and stats for Native Midwest Guardians

export type TowerType = 'milkweed' | 'coneflower' | 'bur_oak' | 'beaver' | 'bat_roost' | 'opossum';

export type TargetPriority = 'first' | 'last' | 'strongest' | 'weakest' | 'flying' | 'closest';

export interface UpgradeTier {
  name: string;
  costSun: number;
  costBiomass: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  splashRadius?: number;
  pierce?: number;
  specialDescription: string;
  projectileSpeed: number;
  color: string;
  icon: string;
}

export interface TowerConfig {
  id: TowerType;
  name: string;
  scientificName: string;
  category: 'plant' | 'animal';
  description: string;
  baseCostSun: number;
  baseCostBiomass: number;
  placementType: 'ground' | 'water' | 'any';
  tiers: [UpgradeTier, UpgradeTier, UpgradeTier]; // Base, Tier 2, Tier 3
}

export const TOWERS: Record<TowerType, TowerConfig> = {
  milkweed: {
    id: 'milkweed',
    name: 'Common Milkweed',
    scientificName: 'Asclepias syriaca',
    category: 'plant',
    description: 'Fires silky seed pods rapidly at encroaching invaders. High single-target DPS.',
    baseCostSun: 100,
    baseCostBiomass: 0,
    placementType: 'ground',
    tiers: [
      {
        name: 'Seedling Milkweed',
        costSun: 100,
        costBiomass: 0,
        damage: 14,
        range: 135,
        fireRate: 1.5,
        specialDescription: 'Rapidly fires light seed-pod darts.',
        projectileSpeed: 380,
        color: '#d46b96',
        icon: '🌸',
      },
      {
        name: 'Toxic Latex Bloom',
        costSun: 140,
        costBiomass: 15,
        damage: 26,
        range: 160,
        fireRate: 2.0,
        specialDescription: 'Coats seeds with milky cardenolides, inflicting 15 poison damage over 3s.',
        projectileSpeed: 420,
        color: '#e05297',
        icon: '🌺',
      },
      {
        name: 'Monarch Haven',
        costSun: 240,
        costBiomass: 40,
        damage: 48,
        range: 190,
        fireRate: 2.8,
        specialDescription: 'Summons an orbiting Monarch Butterfly that dive-attacks foes and boosts adjacent plants by +25% attack speed!',
        projectileSpeed: 460,
        color: '#f97316',
        icon: '🦋',
      },
    ],
  },

  coneflower: {
    id: 'coneflower',
    name: 'Purple Coneflower',
    scientificName: 'Echinacea purpurea',
    category: 'plant',
    description: 'Long-range sniper that launches sharp herbal spines piercing through multiple invaders.',
    baseCostSun: 140,
    baseCostBiomass: 0,
    placementType: 'ground',
    tiers: [
      {
        name: 'Prairie Spire',
        costSun: 140,
        costBiomass: 0,
        damage: 32,
        range: 220,
        fireRate: 0.75,
        pierce: 2,
        specialDescription: 'Spines pierce through up to 2 enemies in a straight line.',
        projectileSpeed: 520,
        color: '#a855f7',
        icon: '🌼',
      },
      {
        name: 'Deep Taproot',
        costSun: 180,
        costBiomass: 20,
        damage: 60,
        range: 260,
        fireRate: 0.9,
        pierce: 3,
        specialDescription: 'Pierces 3 targets. Deep roots grant massive firing range.',
        projectileSpeed: 560,
        color: '#9333ea',
        icon: '💜',
      },
      {
        name: 'Herbal Aegis',
        costSun: 280,
        costBiomass: 50,
        damage: 110,
        range: 300,
        fireRate: 1.1,
        pierce: 5,
        specialDescription: 'Pierces 5 targets and releases sticky medicinal nectar slowing targets by 45% for 3 seconds.',
        projectileSpeed: 620,
        color: '#7e22ce',
        icon: '✨',
      },
    ],
  },

  bur_oak: {
    id: 'bur_oak',
    name: 'Bur Oak Mortar',
    scientificName: 'Quercus macrocarpa',
    category: 'plant',
    description: 'Artillery giant of the savanna. Lobs heavy acorns that crash with massive AoE and stuns armored foes.',
    baseCostSun: 220,
    baseCostBiomass: 0,
    placementType: 'ground',
    tiers: [
      {
        name: 'Savanna Sapling',
        costSun: 220,
        costBiomass: 0,
        damage: 55,
        range: 190,
        fireRate: 0.45,
        splashRadius: 55,
        specialDescription: 'Lobs heavy acorns causing blast damage. Destroys Zebra Mussel armor!',
        projectileSpeed: 280,
        color: '#65a30d',
        icon: '🌳',
      },
      {
        name: 'Cork-Barked Giant',
        costSun: 260,
        costBiomass: 30,
        damage: 105,
        range: 220,
        fireRate: 0.55,
        splashRadius: 75,
        specialDescription: 'Acorn blast radius increased, briefly stunning non-boss enemies for 0.6s.',
        projectileSpeed: 300,
        color: '#4d7c0f',
        icon: '🌰',
      },
      {
        name: 'Century Oak',
        costSun: 380,
        costBiomass: 70,
        damage: 210,
        range: 250,
        fireRate: 0.7,
        splashRadius: 95,
        specialDescription: 'Calls down cluster acorn bombardments that shatter armor and crush clusters of invasive pests.',
        projectileSpeed: 320,
        color: '#365314',
        icon: '👑',
      },
    ],
  },

  beaver: {
    id: 'beaver',
    name: 'North American Beaver',
    scientificName: 'Castor canadensis',
    category: 'animal',
    description: 'Wetland engineer. Slaps tail creating hydraulic shockwaves that knock enemies back and places slowing debris.',
    baseCostSun: 175,
    baseCostBiomass: 10,
    placementType: 'any',
    tiers: [
      {
        name: 'River Sentry',
        costSun: 175,
        costBiomass: 10,
        damage: 28,
        range: 120,
        fireRate: 0.9,
        splashRadius: 60,
        specialDescription: 'Tail slap sends water ripples that knock back ground and aquatic invaders.',
        projectileSpeed: 300,
        color: '#b45309',
        icon: '🦫',
      },
      {
        name: 'Wetland Engineer',
        costSun: 210,
        costBiomass: 30,
        damage: 52,
        range: 145,
        fireRate: 1.1,
        splashRadius: 80,
        specialDescription: 'Tail shockwave pushes back enemies with greater force and slows them by 30%.',
        projectileSpeed: 330,
        color: '#92400e',
        icon: '🪵',
      },
      {
        name: 'Hydraulic Keystone',
        costSun: 320,
        costBiomass: 60,
        damage: 95,
        range: 170,
        fireRate: 1.35,
        splashRadius: 100,
        specialDescription: 'Unleashes massive tidal surges that knock back multiple enemies and breaks Asian Carp leaps.',
        projectileSpeed: 360,
        color: '#78350f',
        icon: '🌊',
      },
    ],
  },

  bat_roost: {
    id: 'bat_roost',
    name: 'Little Brown Bat Roost',
    scientificName: 'Myotis lucifugus',
    category: 'animal',
    description: 'Aerial hunter that utilizes echolocation to detect and shred flying pests like Emerald Ash Borer.',
    baseCostSun: 190,
    baseCostBiomass: 10,
    placementType: 'ground',
    tiers: [
      {
        name: 'Bat Nesting Box',
        costSun: 190,
        costBiomass: 10,
        damage: 24,
        range: 200,
        fireRate: 2.2,
        specialDescription: 'Rapid echolocation pulses. Deals +100% bonus damage to airborne pests!',
        projectileSpeed: 550,
        color: '#6366f1',
        icon: '🦇',
      },
      {
        name: 'Ultrasonic Sweep',
        costSun: 230,
        costBiomass: 35,
        damage: 46,
        range: 240,
        fireRate: 2.8,
        specialDescription: 'Strikes airborne pests with ultrasonic waves, removing evasion and slowing flying speeds by 40%.',
        projectileSpeed: 600,
        color: '#4f46e5',
        icon: '📡',
      },
      {
        name: 'Maternity Roost Colony',
        costSun: 350,
        costBiomass: 65,
        damage: 82,
        range: 280,
        fireRate: 3.8,
        specialDescription: 'A swarm of bats sweeps the skies, striking up to 2 airborne targets simultaneously!',
        projectileSpeed: 650,
        color: '#3730a3',
        icon: '🌙',
      },
    ],
  },

  opossum: {
    id: 'opossum',
    name: 'Virginia Opossum',
    scientificName: 'Didelphis virginiana',
    category: 'animal',
    description: 'Immune to plant toxins. Devours ticks, slugs, and low-health pests on the path, generating bonus Biomass!',
    baseCostSun: 130,
    baseCostBiomass: 0,
    placementType: 'ground',
    tiers: [
      {
        name: 'Night Forager',
        costSun: 130,
        costBiomass: 0,
        damage: 38,
        range: 110,
        fireRate: 1.2,
        specialDescription: 'Bites pests in close range. Generates +50% bonus Biomass when defeating enemies.',
        projectileSpeed: 400,
        color: '#71717a',
        icon: '🦔',
      },
      {
        name: 'Tick & Slug Vacuum',
        costSun: 170,
        costBiomass: 20,
        damage: 72,
        range: 130,
        fireRate: 1.6,
        specialDescription: 'Instantly executes non-boss pests below 15% HP and completely ignores Garlic Mustard toxin auras.',
        projectileSpeed: 440,
        color: '#52525b',
        icon: '🐾',
      },
      {
        name: 'Savanna Sanitation Boss',
        costSun: 270,
        costBiomass: 45,
        damage: 135,
        range: 155,
        fireRate: 2.0,
        specialDescription: 'Viciously feasts on pests, executing non-bosses under 25% HP and dropping double Biomass compost!',
        projectileSpeed: 480,
        color: '#3f3f46',
        icon: '⭐',
      },
    ],
  },
};
