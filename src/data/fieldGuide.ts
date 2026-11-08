// Midwestern Ecological Bestiary & Field Guide
// Educational lore, ecological interactions, and conservation tips

export interface GuideEntry {
  id: string;
  name: string;
  scientificName: string;
  category: 'native' | 'invasive';
  type: string;
  status: string;
  habitat: string;
  midwestFact: string;
  ecologicalRole: string;
  conservationTip: string;
  icon: string;
  color: string;
}

export const FIELD_GUIDE: GuideEntry[] = [
  // Native Guardians
  {
    id: 'milkweed',
    name: 'Common Milkweed',
    scientificName: 'Asclepias syriaca',
    category: 'native',
    type: 'Flowering Perennial Plant',
    status: 'Native & Vital Keystone',
    habitat: 'Tallgrass prairies, meadows, roadsides, open fields across the Midwest',
    midwestFact:
      'Common Milkweed is the essential host plant for Monarch butterfly (*Danaus plexippus*) caterpillars. The caterpillars eat only milkweed leaves, absorbing cardiac glycosides (cardenolides) that make both caterpillars and adult butterflies toxic to avian predators.',
    ecologicalRole:
      'Provides high-energy nectar for hundreds of native bee species, pollinating wasps, beetles, and migratory butterflies while acting as an exclusive nursery for monarchs.',
    conservationTip:
      'Plant native milkweeds (Common, Swamp, or Butterfly Weed) in your home garden or community lot to support the Eastern Monarch migration corridor!',
    icon: '🌸',
    color: '#d46b96',
  },
  {
    id: 'coneflower',
    name: 'Purple Coneflower',
    scientificName: 'Echinacea purpurea',
    category: 'native',
    type: 'Prairie Forb / Wildflower',
    status: 'Native Prairie Perennial',
    habitat: 'Tallgrass prairies, dry open woods, barrens, savannas',
    midwestFact:
      'Purple Coneflower features deep taproots that can reach 5 to 8 feet deep into Midwestern prairie soil, helping it survive extreme summer droughts and historic prairie fires.',
    ecologicalRole:
      'The central spiky cone contains hundreds of disc florets providing abundant nectar in mid-summer; in autumn and winter, the dried seed heads feed American Goldfinches.',
    conservationTip:
      'Leave dried coneflower stalks standing through the winter instead of cutting them down in autumn—native songbirds rely on them for essential winter seed forage.',
    icon: '🌼',
    color: '#a855f7',
  },
  {
    id: 'bur_oak',
    name: 'Bur Oak',
    scientificName: 'Quercus macrocarpa',
    category: 'native',
    type: 'Savanna Keystone Hardwood Tree',
    status: 'Native Keystone Master',
    habitat: 'Oak savannas, prairie-forest ecotones, limestone glades',
    midwestFact:
      'Bur Oaks possess extraordinarily thick, corky, fire-resistant bark, which historically allowed them to survive frequent prairie wildfires that wiped out competing tree saplings, creating the iconic Midwest Oak Savannas.',
    ecologicalRole:
      'A single mature Bur Oak supports over 500 species of native moth and butterfly caterpillars, which in turn feed nesting songbirds like Eastern Bluebirds and Warblers. Acorns feed deer, wild turkeys, and native rodents.',
    conservationTip:
      'Protect mature savanna bur oaks and plant native oaks in parks and yards—oaks are the single most ecologically productive plant genus in North America.',
    icon: '🌳',
    color: '#65a30d',
  },
  {
    id: 'beaver',
    name: 'North American Beaver',
    scientificName: 'Castor canadensis',
    category: 'native',
    type: 'Semiaquatic Mammal / Ecosystem Engineer',
    status: 'Native Keystone Engineer',
    habitat: 'Rivers, streams, lakes, marshes throughout the Midwest',
    midwestFact:
      'Beavers are nature’s original wetland architects. By felling trees and building dams, they slow stream runoff, retain groundwater during droughts, create fire breaks, and filter agricultural silt.',
    ecologicalRole:
      'Beaver ponds and wetlands create critical habitat for ducks, herons, amphibians, native river fish, and otters, while recharging regional Midwestern aquifers.',
    conservationTip:
      'Support non-lethal beaver coexistence strategies such as pond levelers ("beaver deceivers") and tree-trunk wire wraps to maintain these natural water-retention systems.',
    icon: '🦫',
    color: '#b45309',
  },
  {
    id: 'bat_roost',
    name: 'Little Brown Bat',
    scientificName: 'Myotis lucifugus',
    category: 'native',
    type: 'Insectivorous Mammal',
    status: 'Species of Conservation Need (Threatened by White-Nose Syndrome)',
    habitat: 'Forest edges, savannas, caves, mines, bat houses near water',
    midwestFact:
      'A single Little Brown Bat can catch and consume up to 1,000 mosquito- and moth-sized insects in just one hour, providing millions of dollars in free natural pest control for Midwest farmers.',
    ecologicalRole:
      'Crucial nocturnal insect predator that controls agricultural pests, invasive moths, and biting flies through ultrasonic echolocation.',
    conservationTip:
      'Install a certified bat house mounted on a sunny pole or building side at least 15 feet high, and avoid disturbing caves during winter bat hibernation.',
    icon: '🦇',
    color: '#6366f1',
  },
  {
    id: 'opossum',
    name: 'Virginia Opossum',
    scientificName: 'Didelphis virginiana',
    category: 'native',
    type: 'Marsupial (North America’s Only Native Marsupial)',
    status: 'Native Scavenger Benefactor',
    habitat: 'Deciduous woodlands, river valleys, prairie borders, suburban greenways',
    midwestFact:
      'Opossums have a naturally lower body temperature than most mammals, making them almost completely immune to rabies. They are also remarkably resistant to pit viper venom and Lyme disease.',
    ecologicalRole:
      'Meticulous groomers that attract and eat thousands of blacklegged ticks each season, while cleaning up carrion, rotting fruit, slugs, and garden pests.',
    conservationTip:
      'Never harm opossums! Welcome them in your yard as gentle, harmless nocturnal neighbors that keep tick and rodent populations naturally in check.',
    icon: '🦔',
    color: '#71717a',
  },

  // Invasive Threats
  {
    id: 'garlic_mustard',
    name: 'Garlic Mustard',
    scientificName: 'Alliaria petiolata',
    category: 'invasive',
    type: 'Biennial Herbaceous Plant (from Europe)',
    status: 'High Impact Invasive Weed',
    habitat: 'Midwest forest understories, woodlots, shaded floodplains',
    midwestFact:
      'Garlic Mustard engages in chemical warfare known as "allelopathy": its roots exude sinigrin and glucosinolates into the soil, killing off beneficial mycorrhizal fungi that native tree seedlings require to absorb nutrients.',
    ecologicalRole:
      'Displaces native spring ephemerals like Trilliums, Bloodroot, and Wild Geraniums, creating dense monocultures that deer refuse to browse.',
    conservationTip:
      'Join local spring volunteer workdays to hand-pull Garlic Mustard before it sets seed. Always pull the full taproot and bag/dispose of it, or sauté the young leaves for wild pesto!',
    icon: '🌿',
    color: '#84cc16',
  },
  {
    id: 'spotted_lanternfly',
    name: 'Spotted Lanternfly',
    scientificName: 'Lycorma delicatula',
    category: 'invasive',
    type: 'Planthopper Insect (from Eastern Asia)',
    status: 'Rapidly Spreading Invasive Threat',
    habitat: 'Midwest vineyards, fruit orchards, hardwoods, urban corridors',
    midwestFact:
      'Lanternflies pierce tree bark and vines to suck phloem sap, excreting large quantities of sticky, sugary liquid called "honeydew" that promotes toxic black sooty mold growth over crops and gardens.',
    ecologicalRole:
      'Weakens agricultural crops like grapes, apples, hops, and native Midwestern hardwoods (especially Black Walnut and Maples), reducing frost hardiness.',
    conservationTip:
      'Inspect outdoor gear, vehicles, and firewood for mud-like egg masses before traveling. Scrape egg masses into alcohol and report sightings to your state Department of Agriculture!',
    icon: '🪰',
    color: '#f43f5e',
  },
  {
    id: 'emerald_ash_borer',
    name: 'Emerald Ash Borer',
    scientificName: 'Agrilus planipennis',
    category: 'invasive',
    type: 'Buprestid Beetle (from Northeast Asia)',
    status: 'Catastrophic Forest Pest',
    habitat: 'Midwestern ash forests, riparian corridors, urban street canopies',
    midwestFact:
      'First discovered near Detroit in 2002, EAB larvae chew S-shaped galleries through the ash tree’s phloem and cambium layer, choking off water and nutrient transport and killing 99% of infected ash trees within 3 to 5 years.',
    ecologicalRole:
      'Responsible for the death of tens of millions of ash trees across the Midwest, decimating riparian shade and opening forest canopies to invasive weeds.',
    conservationTip:
      'Never move firewood long distances! "Buy Where You Burn" to prevent transporting beetle larvae tucked beneath tree bark.',
    icon: '🪲',
    color: '#10b981',
  },
  {
    id: 'zebra_mussel',
    name: 'Zebra Mussel',
    scientificName: 'Dreissena polymorpha',
    category: 'invasive',
    type: 'Bivalve Mollusk (from Black/Caspian Seas)',
    status: 'Aquatic Invasive Disrupter',
    habitat: 'Great Lakes, inland lakes, rivers, water intake pipes',
    midwestFact:
      'A single female Zebra Mussel can produce over 1 million microscopic larvae (veligers) per year. They form dense encrusting colonies on native clams, boat hulls, and water intake pipes, causing billions in damage.',
    ecologicalRole:
      'They filter-feed massive volumes of plankton, stripping the fundamental base of the aquatic food web and making water artificially clear, which triggers toxic algae blooms.',
    conservationTip:
      'Practice "Clean, Drain, Dry" on all boats, trailers, and fishing equipment after leaving any body of water to stop the spread between inland lakes.',
    icon: '🐚',
    color: '#64748b',
  },
  {
    id: 'japanese_knotweed',
    name: 'Japanese Knotweed',
    scientificName: 'Fallopia japonica',
    category: 'invasive',
    type: 'Herbaceous Perennial Rhizome (from East Asia)',
    status: 'High Impact Infrastructure Invader',
    habitat: 'Midwestern riverbanks, roadsides, disturbed soils, urban lots',
    midwestFact:
      'Japanese Knotweed can sprout from rhizome fragments as tiny as half an inch. Its roots can penetrate concrete foundations, asphalt roads, and retaining walls, making it one of the hardest plants on Earth to eradicate.',
    ecologicalRole:
      'Forms impenetrable thickets along rivers, outcompeting native sedges and willows and increasing riverbank erosion during spring floods.',
    conservationTip:
      'Never mow or weed-whack Japanese Knotweed—chipping it spreads rhizome fragments downstream. Consult local invasive plant managers for targeted herbicide or excavation treatments.',
    icon: '🌾',
    color: '#eab308',
  },
  {
    id: 'asian_carp',
    name: 'Asian Silver Carp',
    scientificName: 'Hypophthalmichthys molitrix',
    category: 'invasive',
    type: 'Filter-feeding Cyprinid Fish (from Eastern Asia)',
    status: 'Severe Threat to Great Lakes Fisheries',
    habitat: 'Mississippi, Illinois, and Ohio River basins',
    midwestFact:
      'Silver Carp are infamous for leaping up to 10 feet out of the water when startled by outboard motor vibrations, frequently injuring boaters, water-skiers, and anglers.',
    ecologicalRole:
      'Consumes huge amounts of phytoplankton and zooplankton, starving out native paddlefish, bigmouth buffalo, and young sportfish.',
    conservationTip:
      'Never transport live bait or release fish into unapproved waterways. Support electrical and acoustic barrier systems safeguarding the Great Lakes navigation canals.',
    icon: '🐟',
    color: '#38bdf8',
  },
  {
    id: 'feral_hog',
    name: 'Feral Hog / Wild Boar',
    scientificName: 'Sus scrofa',
    category: 'invasive',
    type: 'Mammalian Invasive Omnivore',
    status: 'Destructive Invasive Pest',
    habitat: 'Oak savannas, wetlands, agricultural prairies, river bottoms',
    midwestFact:
      'Feral hogs use their tough snouts to "root" deeply into the ground, turning delicate prairie soil upside down like a rototiller, destroying native plant root systems and causing massive erosion.',
    ecologicalRole:
      'Preys on native bird nests, salamanders, turtles, and fawns while introducing diseases like swine brucellosis and pseudorabies to livestock and wildlife.',
    conservationTip:
      'Report sightings and rooting damage to your state Department of Natural Resources immediately to aid professional eradication efforts before sounder herds establish.',
    icon: '🐗',
    color: '#78350f',
  },
  {
    id: 'buckthorn_titan',
    name: 'European Buckthorn',
    scientificName: 'Rhamnus cathartica',
    category: 'invasive',
    type: 'Invasive Deciduous Shrub / Small Tree',
    status: 'Pervasive Forest Invader',
    habitat: 'Midwest woodlands, savannas, fence lines, prairies',
    midwestFact:
      'Buckthorn leaves contain emodin, a natural laxative compound. When birds eat the shiny black berries, it rapidly passes through their digestive tract without providing nutrition, dispersing seeds everywhere while dehydrating birds.',
    ecologicalRole:
      'Leaves out early in spring and retains green leaves late into November, completely shading out native wildflower seedlings and oak regeneration.',
    conservationTip:
      'Cut buckthorn shrubs at the base in late autumn or winter and treat the stumps immediately with targeted approved herbicide to prevent vigorous re-sprouting.',
    icon: '🌲',
    color: '#1e293b',
  },
];
