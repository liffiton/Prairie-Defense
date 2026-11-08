// Map layouts, waypoints, and biome terrain for Prairie Defense

export interface Waypoint {
  x: number;
  y: number;
}

export interface PathDef {
  id: string;
  name: string;
  waypoints: Waypoint[];
  isWater?: boolean;
}

export interface WaterZone {
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
}

export interface Decoration {
  type: 'tree' | 'grass_cluster' | 'rock' | 'wildflower' | 'cattail' | 'lilypad';
  x: number;
  y: number;
  scale?: number;
  color?: string;
}

export interface GameMap {
  id: string;
  name: string;
  biome: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  paths: PathDef[];
  startingSun: number;
  startingBiomass: number;
  sanctuaryHealth: number;
  groundColor: string;
  pathColor: string;
  pathWidth: number;
  decorations: Decoration[];
  waterZones?: WaterZone[];
}

export const MAPS: Record<string, GameMap> = {
  prairie: {
    id: 'prairie',
    name: 'Tallgrass Prairie Sanctuary',
    biome: 'Tallgrass Prairie',
    description: 'A winding trail through big bluestem grass and wild coneflowers. Ideal for establishing core native defenses.',
    difficulty: 'Easy',
    startingSun: 380,
    startingBiomass: 0,
    sanctuaryHealth: 20,
    groundColor: '#789c4a',
    pathColor: '#c2a675',
    pathWidth: 44,
    paths: [
      {
        id: 'main',
        name: 'Prairie Trail',
        waypoints: [
          { x: -20, y: 120 },
          { x: 180, y: 120 },
          { x: 260, y: 220 },
          { x: 200, y: 380 },
          { x: 380, y: 460 },
          { x: 540, y: 360 },
          { x: 500, y: 180 },
          { x: 680, y: 140 },
          { x: 800, y: 280 },
          { x: 740, y: 480 },
          { x: 880, y: 520 },
          { x: 990, y: 520 },
        ],
      },
    ],
    decorations: [
      { type: 'wildflower', x: 80, y: 60, color: '#f43f5e' },
      { type: 'wildflower', x: 140, y: 40, color: '#a855f7' },
      { type: 'grass_cluster', x: 220, y: 50 },
      { type: 'wildflower', x: 380, y: 80, color: '#eab308' },
      { type: 'grass_cluster', x: 420, y: 240 },
      { type: 'wildflower', x: 340, y: 320, color: '#f43f5e' },
      { type: 'grass_cluster', x: 620, y: 80 },
      { type: 'tree', x: 620, y: 280, scale: 1.1 },
      { type: 'wildflower', x: 640, y: 420, color: '#a855f7' },
      { type: 'rock', x: 100, y: 260 },
      { type: 'grass_cluster', x: 120, y: 460 },
      { type: 'tree', x: 80, y: 540, scale: 1.3 },
      { type: 'wildflower', x: 480, y: 560, color: '#eab308' },
      { type: 'grass_cluster', x: 700, y: 600 },
      { type: 'wildflower', x: 900, y: 380, color: '#f43f5e' },
      { type: 'tree', x: 900, y: 80, scale: 1.2 },
    ],
  },

  savanna: {
    id: 'savanna',
    name: 'Oak Savanna & Glade',
    biome: 'Oak Savanna',
    description: 'Scattered ancient bur oaks with dual encroaching trails that converge near the core nature reserve.',
    difficulty: 'Medium',
    startingSun: 420,
    startingBiomass: 15,
    sanctuaryHealth: 20,
    groundColor: '#6e8f42',
    pathColor: '#baa070',
    pathWidth: 42,
    paths: [
      {
        id: 'north',
        name: 'Northern Ridge Trail',
        waypoints: [
          { x: -20, y: 100 },
          { x: 240, y: 100 },
          { x: 380, y: 180 },
          { x: 480, y: 300 },
          { x: 620, y: 320 },
          { x: 780, y: 320 },
          { x: 990, y: 320 },
        ],
      },
      {
        id: 'south',
        name: 'Southern Creek Trail',
        waypoints: [
          { x: -20, y: 520 },
          { x: 260, y: 520 },
          { x: 400, y: 440 },
          { x: 480, y: 320 },
          { x: 620, y: 320 },
          { x: 780, y: 320 },
          { x: 990, y: 320 },
        ],
      },
    ],
    decorations: [
      { type: 'tree', x: 180, y: 310, scale: 1.7 }, // Giant central oak
      { type: 'tree', x: 520, y: 120, scale: 1.4 },
      { type: 'tree', x: 540, y: 500, scale: 1.3 },
      { type: 'tree', x: 720, y: 150, scale: 1.5 },
      { type: 'tree', x: 700, y: 480, scale: 1.4 },
      { type: 'rock', x: 300, y: 260 },
      { type: 'rock', x: 320, y: 380 },
      { type: 'wildflower', x: 120, y: 220, color: '#6366f1' },
      { type: 'wildflower', x: 140, y: 410, color: '#a855f7' },
      { type: 'grass_cluster', x: 360, y: 60 },
      { type: 'grass_cluster', x: 600, y: 220 },
      { type: 'wildflower', x: 840, y: 200, color: '#f43f5e' },
      { type: 'wildflower', x: 860, y: 440, color: '#eab308' },
    ],
  },

  wetland: {
    id: 'wetland',
    name: 'Great Lakes Coastal Wetland',
    biome: 'Coastal Marsh & Riparian Zone',
    description: 'A winding marsh stream where Asian Carp and Zebra Mussels advance alongside an upland trail. Amphibious beaver dams excel here!',
    difficulty: 'Hard',
    startingSun: 450,
    startingBiomass: 20,
    sanctuaryHealth: 25,
    groundColor: '#4d7c49',
    pathColor: '#9c8159',
    pathWidth: 42,
    waterZones: [
      { x: 0, y: 260, w: 960, h: 120 },
      { x: 320, y: 180, w: 280, h: 260 },
    ],
    paths: [
      {
        id: 'waterway',
        name: 'Riparian Water Channel',
        isWater: true,
        waypoints: [
          { x: -20, y: 320 },
          { x: 220, y: 320 },
          { x: 350, y: 240 },
          { x: 500, y: 220 },
          { x: 650, y: 320 },
          { x: 820, y: 320 },
          { x: 990, y: 320 },
        ],
      },
      {
        id: 'shoreline',
        name: 'Marsh Sedge Boardwalk',
        waypoints: [
          { x: -20, y: 140 },
          { x: 260, y: 140 },
          { x: 340, y: 80 },
          { x: 580, y: 80 },
          { x: 700, y: 180 },
          { x: 780, y: 460 },
          { x: 880, y: 520 },
          { x: 990, y: 520 },
        ],
      },
    ],
    decorations: [
      { type: 'cattail', x: 160, y: 270 },
      { type: 'cattail', x: 260, y: 360 },
      { type: 'cattail', x: 420, y: 360 },
      { type: 'cattail', x: 580, y: 370 },
      { type: 'cattail', x: 740, y: 270 },
      { type: 'lilypad', x: 280, y: 310 },
      { type: 'lilypad', x: 460, y: 260 },
      { type: 'lilypad', x: 620, y: 310 },
      { type: 'tree', x: 120, y: 60, scale: 1.3 },
      { type: 'tree', x: 780, y: 80, scale: 1.2 },
      { type: 'tree', x: 460, y: 540, scale: 1.5 },
      { type: 'wildflower', x: 200, y: 480, color: '#38bdf8' },
      { type: 'wildflower', x: 320, y: 520, color: '#a855f7' },
      { type: 'wildflower', x: 660, y: 500, color: '#f43f5e' },
      { type: 'rock', x: 220, y: 230 },
      { type: 'rock', x: 680, y: 380 },
    ],
  },
};
