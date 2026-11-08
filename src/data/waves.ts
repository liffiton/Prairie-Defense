// Wave compositions and progression for Prairie Defense

import type { EnemyType } from './enemies';

export interface WaveGroup {
  enemyType: EnemyType;
  count: number;
  interval: number; // spawn delay between units
  delay: number;    // delay before starting this group
  pathId?: string;  // optional path target
}

export interface WaveDef {
  waveNumber: number;
  name: string;
  hint: string;
  groups: WaveGroup[];
  rewardSun: number;
  rewardBiomass: number;
}

export const PRAIRIE_WAVES: WaveDef[] = [
  {
    waveNumber: 1,
    name: 'Mustard Incursion',
    hint: 'Garlic Mustard seeds are drifting in! Plant Common Milkweed to shoot them down.',
    groups: [
      { enemyType: 'garlic_mustard', count: 8, interval: 1.4, delay: 0 },
    ],
    rewardSun: 40,
    rewardBiomass: 5,
  },
  {
    waveNumber: 2,
    name: 'Spotted Leapers',
    hint: 'Spotted Lanternflies leap forward in bursts! Purple Coneflower pierces targets effectively.',
    groups: [
      { enemyType: 'garlic_mustard', count: 6, interval: 1.2, delay: 0 },
      { enemyType: 'spotted_lanternfly', count: 6, interval: 1.6, delay: 4 },
    ],
    rewardSun: 50,
    rewardBiomass: 8,
  },
  {
    waveNumber: 3,
    name: 'Ash Canopy Threat',
    hint: 'Emerald Ash Borers are airborne and take 50% less damage from ground attacks. Plant a Little Brown Bat Roost!',
    groups: [
      { enemyType: 'emerald_ash_borer', count: 7, interval: 1.2, delay: 0 },
      { enemyType: 'garlic_mustard', count: 8, interval: 1.0, delay: 4 },
    ],
    rewardSun: 60,
    rewardBiomass: 10,
  },
  {
    waveNumber: 4,
    name: 'Hard-Shelled Encrusters',
    hint: 'Zebra Mussels have thick armor that resists seed darts! Bur Oak acorns deal crushing blunt damage.',
    groups: [
      { enemyType: 'zebra_mussel', count: 6, interval: 2.0, delay: 0 },
      { enemyType: 'spotted_lanternfly', count: 8, interval: 1.2, delay: 5 },
    ],
    rewardSun: 70,
    rewardBiomass: 15,
  },
  {
    waveNumber: 5,
    name: 'Rhizome Sprouting',
    hint: 'Japanese Knotweed is hardy and splits into 2 juvenile sprouts upon defeat! Virginia Opossum excels at eating small sprouts.',
    groups: [
      { enemyType: 'japanese_knotweed', count: 5, interval: 2.2, delay: 0 },
      { enemyType: 'garlic_mustard', count: 10, interval: 0.9, delay: 4 },
    ],
    rewardSun: 80,
    rewardBiomass: 20,
  },
  {
    waveNumber: 6,
    name: 'Midwestern River Rush',
    hint: 'Asian Carp swim fast and make erratic leaps! Beaver tail slaps can knock them back.',
    groups: [
      { enemyType: 'asian_carp', count: 9, interval: 1.1, delay: 0 },
      { enemyType: 'emerald_ash_borer', count: 8, interval: 1.0, delay: 5 },
    ],
    rewardSun: 90,
    rewardBiomass: 25,
  },
  {
    waveNumber: 7,
    name: 'Allelopathic Tide',
    hint: 'Large packs of Garlic Mustard suppress nearby plant attack speed. Use Coneflowers with Deep Taproots!',
    groups: [
      { enemyType: 'garlic_mustard', count: 16, interval: 0.7, delay: 0 },
      { enemyType: 'zebra_mussel', count: 6, interval: 1.8, delay: 4 },
      { enemyType: 'japanese_knotweed', count: 4, interval: 2.0, delay: 8 },
    ],
    rewardSun: 100,
    rewardBiomass: 30,
  },
  {
    waveNumber: 8,
    name: 'Sky Swarm & Leapers',
    hint: 'Emerald Ash Borers flying in formation alongside Lanternfly vanguards! Upgrade your Bat Roost to Ultrasonic Sweep.',
    groups: [
      { enemyType: 'emerald_ash_borer', count: 14, interval: 0.8, delay: 0 },
      { enemyType: 'spotted_lanternfly', count: 12, interval: 0.9, delay: 3 },
    ],
    rewardSun: 110,
    rewardBiomass: 35,
  },
  {
    waveNumber: 9,
    name: 'Armored Column',
    hint: 'Heavy Zebra Mussel colonies escorted by fast carp! Combine Bur Oak mortar fire with Beaver dams.',
    groups: [
      { enemyType: 'zebra_mussel', count: 12, interval: 1.4, delay: 0 },
      { enemyType: 'asian_carp', count: 10, interval: 1.0, delay: 5 },
      { enemyType: 'japanese_knotweed', count: 6, interval: 1.8, delay: 8 },
    ],
    rewardSun: 125,
    rewardBiomass: 40,
  },
  {
    waveNumber: 10,
    name: 'BOSS: The Feral Hog',
    hint: 'WARNING: Feral Hog approaching! Massive health pool, immune to slows. Focus high-damage upgraded defenders on it!',
    groups: [
      { enemyType: 'garlic_mustard', count: 12, interval: 0.8, delay: 0 },
      { enemyType: 'feral_hog', count: 1, interval: 1, delay: 4 },
      { enemyType: 'asian_carp', count: 8, interval: 1.0, delay: 8 },
    ],
    rewardSun: 180,
    rewardBiomass: 60,
  },
  {
    waveNumber: 11,
    name: 'Sprouting Chaos',
    hint: 'Japanese Knotweed thicket! Prepare for multiple split sprouts flooding the prairie trail.',
    groups: [
      { enemyType: 'japanese_knotweed', count: 10, interval: 1.5, delay: 0 },
      { enemyType: 'spotted_lanternfly', count: 14, interval: 0.8, delay: 4 },
      { enemyType: 'emerald_ash_borer', count: 10, interval: 1.0, delay: 8 },
    ],
    rewardSun: 140,
    rewardBiomass: 45,
  },
  {
    waveNumber: 12,
    name: 'Great Lakes Aerial & Aquatic Blitz',
    hint: 'Simultaneous aerial strike and river charge! Keep both skies and water locked down.',
    groups: [
      { enemyType: 'asian_carp', count: 14, interval: 0.8, delay: 0 },
      { enemyType: 'emerald_ash_borer', count: 16, interval: 0.7, delay: 2 },
      { enemyType: 'zebra_mussel', count: 8, interval: 1.5, delay: 6 },
    ],
    rewardSun: 160,
    rewardBiomass: 50,
  },
  {
    waveNumber: 13,
    name: 'Twin Boar Rush',
    hint: 'Two Feral Hogs detected rooting up the native prairie glades! Maximum firepower needed!',
    groups: [
      { enemyType: 'feral_hog', count: 1, interval: 1, delay: 0 },
      { enemyType: 'zebra_mussel', count: 10, interval: 1.2, delay: 4 },
      { enemyType: 'feral_hog', count: 1, interval: 1, delay: 10 },
      { enemyType: 'spotted_lanternfly', count: 12, interval: 0.8, delay: 12 },
    ],
    rewardSun: 200,
    rewardBiomass: 75,
  },
  {
    waveNumber: 14,
    name: 'All-Out Infestation',
    hint: 'Every invasive species has joined the swarm! Utilize Monarch Havens and Century Oaks.',
    groups: [
      { enemyType: 'garlic_mustard', count: 18, interval: 0.6, delay: 0 },
      { enemyType: 'emerald_ash_borer', count: 16, interval: 0.7, delay: 3 },
      { enemyType: 'japanese_knotweed', count: 8, interval: 1.4, delay: 6 },
      { enemyType: 'zebra_mussel', count: 10, interval: 1.2, delay: 9 },
      { enemyType: 'asian_carp', count: 12, interval: 0.8, delay: 12 },
    ],
    rewardSun: 220,
    rewardBiomass: 90,
  },
  {
    waveNumber: 15,
    name: 'FINAL BOSS: Buckthorn Titan',
    hint: 'FINAL STAND: The Buckthorn Titan has emerged! It regenerates HP and shelters trailing invaders. Protect the Sanctuary!',
    groups: [
      { enemyType: 'garlic_mustard', count: 15, interval: 0.6, delay: 0 },
      { enemyType: 'buckthorn_titan', count: 1, interval: 1, delay: 4 },
      { enemyType: 'emerald_ash_borer', count: 14, interval: 0.8, delay: 8 },
      { enemyType: 'feral_hog', count: 1, interval: 1, delay: 16 },
      { enemyType: 'asian_carp', count: 10, interval: 0.9, delay: 20 },
    ],
    rewardSun: 350,
    rewardBiomass: 150,
  },
];
