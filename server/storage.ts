import { 
  parks, 
  matchups, 
  type Park, 
  type InsertPark, 
  type Matchup, 
  type InsertMatchup,
  type ParkWithRank,
  type User,
  type InsertUser,
  users,
  ParkIconType
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User methods (required by template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Park methods
  getAllParks(): Promise<Park[]>;
  getParkById(id: number): Promise<Park | undefined>;
  getParksByIds(ids: number[]): Promise<Park[]>;
  createPark(park: InsertPark): Promise<Park>;
  updatePark(id: number, park: Partial<Park>): Promise<Park | undefined>;
  getRankedParks(): Promise<ParkWithRank[]>;
  
  // Matchup methods
  createMatchup(matchup: InsertMatchup): Promise<Matchup>;
  getMatchupById(id: number): Promise<Matchup | undefined>;
  updateMatchup(id: number, matchup: Partial<Matchup>): Promise<Matchup | undefined>;
  getRandomMatchup(): Promise<{ id: number, park1Id: number, park2Id: number } | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private parks: Map<number, Park>;
  private matchups: Map<number, Matchup>;
  private users: Map<number, User>;
  private parkIdCounter: number;
  private matchupIdCounter: number;
  private userIdCounter: number;
  
  constructor() {
    this.parks = new Map();
    this.matchups = new Map();
    this.users = new Map();
    this.parkIdCounter = 1;
    this.matchupIdCounter = 1;
    this.userIdCounter = 1;
    
    // Initialize with seed data
    this.initializeParks();
  }
  
  // Initialize with national parks data
  private initializeParks() {
    const nationalParks: InsertPark[] = [
      {
        name: "Acadia",
        description: "Located in Maine, featuring rocky beaches, granite peaks, and diverse wildlife.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bass_Harbor_Head_Light_Station_2016.jpg/1280px-Bass_Harbor_Head_Light_Station_2016.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "American Samoa",
        description: "Tropical park spanning three islands in the South Pacific, protecting coral reefs and rainforests.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Vatia_Bay_National_Park_of_American_Samoa.jpg/1280px-Vatia_Bay_National_Park_of_American_Samoa.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Arches",
        description: "Located in Utah, featuring over 2,000 natural stone arches and unique geological features.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Double_O_Arch_-_Arches_NP.jpg/1280px-Double_O_Arch_-_Arches_NP.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Badlands",
        description: "Dramatic landscapes and fossil beds in South Dakota.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/BadlandsView.jpg/1280px-BadlandsView.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Big Bend",
        description: "Texas park featuring Chihuahuan Desert landscapes and Rio Grande river canyons.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Big_Bend_National_Park_PB112573.jpg/1280px-Big_Bend_National_Park_PB112573.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Biscayne",
        description: "Protecting Florida's coral reefs and marine ecosystems.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Biscayne_NP_snorkeling.jpg/1280px-Biscayne_NP_snorkeling.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Black Canyon of the Gunnison",
        description: "Deep, steep-walled gorge in Colorado.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Black_canyon_gunnison_Colorado.jpg/1280px-Black_canyon_gunnison_Colorado.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Bryce Canyon",
        description: "Utah's distinctive hoodoo rock formations and amphitheaters.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bryce_Canyon_hoodoos_Amphitheater.jpg/1280px-Bryce_Canyon_hoodoos_Amphitheater.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Canyonlands",
        description: "Utah's colorful landscape of canyons, mesas, and buttes.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Canyonlands_National_Park%E2%80%A6Needles_area_%286294480744%29.jpg/1280px-Canyonlands_National_Park%E2%80%A6Needles_area_%286294480744%29.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Capitol Reef",
        description: "Utah's Waterpocket Fold, a geologic monocline extending almost 100 miles.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Capitol_Reef_National_Park_panorama.jpg/1280px-Capitol_Reef_National_Park_panorama.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Carlsbad Caverns",
        description: "New Mexico's underground limestone caves and formations.",
        iconType: "cave",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Carlsbad_Caverns_Natural_Entrance.jpg/1280px-Carlsbad_Caverns_Natural_Entrance.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Channel Islands",
        description: "Five islands off California's coast with unique wildlife.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Channel_Islands_National_Park.jpg/1280px-Channel_Islands_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Congaree",
        description: "South Carolina's largest intact expanse of old growth bottomland hardwood forest.",
        iconType: "forest",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Congaree_National_Park_Boardwalk.jpg/1280px-Congaree_National_Park_Boardwalk.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Crater Lake",
        description: "Oregon's deep blue lake in a dormant volcano crater.",
        iconType: "lake",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Crater_lake_oregon.jpg/1280px-Crater_lake_oregon.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Cuyahoga Valley",
        description: "Ohio's historic canal towpath and scenic railway.",
        iconType: "forest",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Cuyahoga_Valley_National_Park.jpg/1280px-Cuyahoga_Valley_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Death Valley",
        description: "California's below-sea-level basin with extreme desert conditions.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Mesquite_Sand_Dunes_in_Death_Valley.jpg/1280px-Mesquite_Sand_Dunes_in_Death_Valley.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Denali",
        description: "Alaska's highest peak and diverse wildlife.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Wonder_Lake_and_Denali.jpg/1280px-Wonder_Lake_and_Denali.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Dry Tortugas",
        description: "Florida's historic Fort Jefferson and marine life.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Fort_Jefferson_Dry_Tortugas.jpg/1280px-Fort_Jefferson_Dry_Tortugas.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Everglades",
        description: "Florida's unique wetlands ecosystem.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Everglades_National_Park_cypress.jpg/1280px-Everglades_National_Park_cypress.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Gates of the Arctic",
        description: "Alaska's northernmost national park, entirely above the Arctic Circle.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Gates_of_the_Arctic_National_Park.jpg/1280px-Gates_of_the_Arctic_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Gateway Arch",
        description: "St. Louis' iconic stainless steel arch.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/St_Louis_night_expblend.jpg/1280px-St_Louis_night_expblend.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Glacier",
        description: "Montana's glacier-carved peaks and valleys.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mountain_Goat_at_Glacier_National_Park.jpg/1280px-Mountain_Goat_at_Glacier_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Glacier Bay",
        description: "Alaska's tidewater glaciers and marine wildlife.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Glacier_Bay_National_Park_and_Preserve.jpg/1280px-Glacier_Bay_National_Park_and_Preserve.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Grand Canyon",
        description: "Arizona's mile-deep gorge carved by the Colorado River.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/USA_09847_Grand_Canyon_Luca_Galuzzi_2007.jpg/1280px-USA_09847_Grand_Canyon_Luca_Galuzzi_2007.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Grand Teton",
        description: "Wyoming's iconic mountain range and pristine lakes.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Grand_Teton_National_Park_banner.jpg/1280px-Grand_Teton_National_Park_banner.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Great Basin",
        description: "Nevada's ancient bristlecone pines and limestone caves.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Great_Basin_National_Park_Wheeler_Peak.jpg/1280px-Great_Basin_National_Park_Wheeler_Peak.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Great Sand Dunes",
        description: "Colorado's tallest sand dunes in North America.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Great_Sand_Dunes_National_Park_and_Preserve.jpg/1280px-Great_Sand_Dunes_National_Park_and_Preserve.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Great Smoky Mountains",
        description: "Ancient mountains straddling Tennessee and North Carolina.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Mountain_vista_Great_Smoky_Mountains_National_Park.jpg/1280px-Mountain_vista_Great_Smoky_Mountains_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Guadalupe Mountains",
        description: "Texas' ancient marine fossil reef.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Guadalupe_Mountains_National_Park_GUMO1.jpg/1280px-Guadalupe_Mountains_National_Park_GUMO1.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Haleakalā",
        description: "Hawaii's dormant volcano and unique landscapes.",
        iconType: "volcanic",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Haleakala_crater.jpg/1280px-Haleakala_crater.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Hawaii Volcanoes",
        description: "Hawaii's active volcanoes and unique ecosystems.",
        iconType: "volcanic",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sulfur_dioxide_emissions_from_the_Halemaumau_vent_04-08-1.jpg/1280px-Sulfur_dioxide_emissions_from_the_Halemaumau_vent_04-08-1.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Hot Springs",
        description: "Arkansas' natural hot springs and historic bathhouses.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Bathhouse_Row_in_Hot_Springs,_Arkansas.jpg/1280px-Bathhouse_Row_in_Hot_Springs,_Arkansas.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Indiana Dunes",
        description: "Indiana's diverse plant life and sand dunes along Lake Michigan.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Indiana_Dunes_State_Park_-_beach.jpg/1280px-Indiana_Dunes_State_Park_-_beach.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Isle Royale",
        description: "Michigan's remote island wilderness in Lake Superior.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Isle_royale_national_park.jpg/1280px-Isle_royale_national_park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Joshua Tree",
        description: "California's unique desert landscapes and iconic trees.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Joshua_Tree_-_Rock_Formation_in_Hidden_Valley.jpg/1280px-Joshua_Tree_-_Rock_Formation_in_Hidden_Valley.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Katmai",
        description: "Alaska's brown bears and volcanic landscape.",
        iconType: "volcanic",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Brown_bears_brooks_falls.jpg/1280px-Brown_bears_brooks_falls.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Kenai Fjords",
        description: "Alaska's glaciers and marine wildlife.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Kenai_Fjords_National_Park_KEFJ0006.jpg/1280px-Kenai_Fjords_National_Park_KEFJ0006.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Kings Canyon",
        description: "California's deep canyons and towering sequoias.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Kings_Canyon.jpg/1280px-Kings_Canyon.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Kobuk Valley",
        description: "Alaska's arctic sand dunes and caribou migration routes.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Kobuk_Dunes_-_Kobuk_Valley_National_Park.jpg/1280px-Kobuk_Dunes_-_Kobuk_Valley_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Lake Clark",
        description: "Alaska's volcanoes, glaciers, and salmon-bearing rivers.",
        iconType: "lake",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Lake_Clark_National_Park_and_Preserve.jpg/1280px-Lake_Clark_National_Park_and_Preserve.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Lassen Volcanic",
        description: "California's hydrothermal features and volcanic landscapes.",
        iconType: "volcanic",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Lassen_Peak_from_Lake_Helen.jpg/1280px-Lassen_Peak_from_Lake_Helen.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Mammoth Cave",
        description: "Kentucky's extensive cave system.",
        iconType: "cave",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Mammoth_Cave_National_Park_007.jpg/1280px-Mammoth_Cave_National_Park_007.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Mesa Verde",
        description: "Colorado's ancient Puebloan cliff dwellings.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Mesa_Verde_National_Park_Cliff_Palace.jpg/1280px-Mesa_Verde_National_Park_Cliff_Palace.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Mount Rainier",
        description: "Washington's iconic stratovolcano.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Mount_Rainier_from_west.jpg/1280px-Mount_Rainier_from_west.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "New River Gorge",
        description: "West Virginia's scenic river gorge and historic sites.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/New_River_Gorge_Bridge.jpg/1280px-New_River_Gorge_Bridge.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "North Cascades",
        description: "Washington's rugged mountains and glaciers.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Cascade_Pass.jpg/1280px-Cascade_Pass.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Olympic",
        description: "Washington's diverse ecosystems from rainforest to coast.",
        iconType: "forest",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hoh_Rainforest%2C_Olympic_National_Park.jpg/1280px-Hoh_Rainforest%2C_Olympic_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Petrified Forest",
        description: "Arizona's petrified wood and painted desert.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Petrified_Forest_National_Park_PEFO0002.jpg/1280px-Petrified_Forest_National_Park_PEFO0002.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Pinnacles",
        description: "California's volcanic spires and rare wildlife.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Pinnacles_National_Park_-_High_Peaks.jpg/1280px-Pinnacles_National_Park_-_High_Peaks.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Redwood",
        description: "California's coastal redwood forests.",
        iconType: "forest",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Redwood_National_Park%2C_fog_in_the_forest.jpg/1280px-Redwood_National_Park%2C_fog_in_the_forest.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Rocky Mountain",
        description: "Colorado's majestic mountain environments.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rocky_mountain_national_park_longs_peak.jpg/1280px-Rocky_mountain_national_park_longs_peak.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Saguaro",
        description: "Arizona's giant saguaro cacti.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Giant_Saguaro_Cactus_in_Saguaro_National_Park.jpg/1280px-Giant_Saguaro_Cactus_in_Saguaro_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Sequoia",
        description: "California's giant sequoia trees.",
        iconType: "forest",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Giant_Sequoia_Trees_in_Sequoia_National_Park.jpg/1280px-Giant_Sequoia_Trees_in_Sequoia_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Shenandoah",
        description: "Virginia's Blue Ridge Mountains and waterfalls.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Skylinedrive.jpg/1280px-Skylinedrive.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Theodore Roosevelt",
        description: "North Dakota's badlands and wildlife.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Theodore_Roosevelt_National_Park.jpg/1280px-Theodore_Roosevelt_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Virgin Islands",
        description: "Caribbean coral reefs and pristine beaches.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Virgin_Islands_National_Park_-_Trunk_Bay.jpg/1280px-Virgin_Islands_National_Park_-_Trunk_Bay.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Voyageurs",
        description: "Minnesota's interconnected waterways.",
        iconType: "lake",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Voyageurs_National_Park.jpg/1280px-Voyageurs_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "White Sands",
        description: "New Mexico's white gypsum sand dunes.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/White_Sands_New_Mexico_USA.jpg/1280px-White_Sands_New_Mexico_USA.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Wind Cave",
        description: "South Dakota's unique cave formations.",
        iconType: "cave",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Wind_Cave_boxwork.jpg/1280px-Wind_Cave_boxwork.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Wrangell-St. Elias",
        description: "Alaska's largest national park with massive glaciers.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Wrangell-St._Elias_National_Park.jpg/1280px-Wrangell-St._Elias_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Yellowstone",
        description: "The world's first national park, known for geothermal features.",
        iconType: "volcanic",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Grand_Prismatic_Spring_2013.jpg/1280px-Grand_Prismatic_Spring_2013.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Yosemite",
        description: "California's granite cliffs and waterfalls.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Half_Dome_from_Glacier_Point%2C_Yosemite_NP_-_Diliff.jpg/1280px-Half_Dome_from_Glacier_Point%2C_Yosemite_NP_-_Diliff.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Zion",
        description: "Utah's spectacular red rock canyons.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Angels_Landing.jpg/1280px-Angels_Landing.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      }
    ];
      {
        name: "Joshua Tree",
        description: "Located at the intersection of the Mojave and Colorado deserts in Southern California, known for its twisted, contorted Joshua trees.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Joshua_Tree_-_Rock_Formation_in_Hidden_Valley.jpg/1280px-Joshua_Tree_-_Rock_Formation_in_Hidden_Valley.jpg",
        rating: 1550,
        trending: false,
        lastChange: -1
      },
      {
        name: "Great Smoky Mountains",
        description: "The scenic ridge line along the border between North Carolina and Tennessee, known for its diverse plant and animal life.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Mountain_vista_Great_Smoky_Mountains_National_Park.jpg/1280px-Mountain_vista_Great_Smoky_Mountains_National_Park.jpg",
        rating: 1530,
        trending: true,
        lastChange: 0
      },
      {
        name: "Bryce Canyon",
        description: "Bryce Canyon National Park in southwestern Utah, is famous for crimson-colored hoodoos, which are spire-shaped rock formations.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bryce_Canyon_hoodoos_Amphitheater.jpg/1280px-Bryce_Canyon_hoodoos_Amphitheater.jpg",
        rating: 1520,
        trending: true,
        lastChange: 3
      },
      {
        name: "Yellowstone",
        description: "The first national park in the U.S. and widely held to be the first national park in the world, known for its wildlife and geothermal features.",
        iconType: "volcanic",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Grand_Prismatic_Spring_2013.jpg/1280px-Grand_Prismatic_Spring_2013.jpg",
        rating: 1510,
        trending: false,
        lastChange: 0
      },
      {
        name: "Yosemite",
        description: "Located in California's Sierra Nevada mountains, known for its waterfalls, giant sequoia trees, and impressive valley views.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Half_Dome_from_Glacier_Point%2C_Yosemite_NP_-_Diliff.jpg/1280px-Half_Dome_from_Glacier_Point%2C_Yosemite_NP_-_Diliff.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Zion",
        description: "Located in southwestern Utah, known for its steep red cliffs, emerald pools, and narrow slot canyons.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Angels_Landing.jpg/1280px-Angels_Landing.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Acadia",
        description: "Located on Mount Desert Island in Maine, known for its rocky beaches, woodland, and glacier-scoured granite peaks.",
        iconType: "coastal",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bass_Harbor_Head_Light_Station_2016.jpg/1280px-Bass_Harbor_Head_Light_Station_2016.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Olympic",
        description: "Encompassing nearly a million acres on Washington's Olympic Peninsula, featuring glacier-capped mountains, old-growth temperate rain forests, and Pacific coastline.",
        iconType: "forest",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hoh_Rainforest%2C_Olympic_National_Park.jpg/1280px-Hoh_Rainforest%2C_Olympic_National_Park.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Crater Lake",
        description: "Located in southern Oregon, known for its deep blue lake formed in a crater of an ancient volcano.",
        iconType: "lake",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Crater_lake_oregon.jpg/1280px-Crater_lake_oregon.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Arches",
        description: "Located in eastern Utah, known for its more than 2,000 natural stone arches, including the world-famous Delicate Arch.",
        iconType: "desert",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Double_O_Arch_-_Arches_NP.jpg/1280px-Double_O_Arch_-_Arches_NP.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      },
      {
        name: "Shenandoah",
        description: "Located in the Blue Ridge Mountains in Virginia, featuring cascading waterfalls, spectacular vistas, and quiet wooded hollows.",
        iconType: "mountain",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Skylinedrive.jpg/1280px-Skylinedrive.jpg",
        rating: 1500,
        trending: false,
        lastChange: 0
      }
    ];
    
    // Add parks to the store
    nationalParks.forEach(park => this.createPark(park));
    
    // Update park rankings
    this.updateRankings();
  }
  
  // Update rankings of all parks based on their ratings
  private updateRankings() {
    const parksList = Array.from(this.parks.values());
    parksList.sort((a, b) => b.rating - a.rating);
    
    // Update rank for each park
    parksList.forEach((park, index) => {
      this.parks.set(park.id, { ...park, rank: index + 1 });
    });
  }
  
  // User methods (required by template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Park methods
  async getAllParks(): Promise<Park[]> {
    return Array.from(this.parks.values());
  }
  
  async getParkById(id: number): Promise<Park | undefined> {
    return this.parks.get(id);
  }
  
  async getParksByIds(ids: number[]): Promise<Park[]> {
    return ids.map(id => this.parks.get(id)).filter(Boolean) as Park[];
  }
  
  async createPark(insertPark: InsertPark): Promise<Park> {
    const id = this.parkIdCounter++;
    const park: Park = { 
      id,
      name: insertPark.name,
      description: insertPark.description,
      iconType: insertPark.iconType as ParkIconType,
      imageUrl: insertPark.imageUrl || null,
      rating: insertPark.rating || 1500,
      rank: null,
      trending: insertPark.trending || null,
      lastChange: insertPark.lastChange || null
    };
    this.parks.set(id, park);
    return park;
  }
  
  async updatePark(id: number, parkUpdate: Partial<Park>): Promise<Park | undefined> {
    const park = this.parks.get(id);
    if (!park) return undefined;
    
    const updatedPark = { ...park, ...parkUpdate };
    this.parks.set(id, updatedPark);
    return updatedPark;
  }
  
  async getRankedParks(): Promise<ParkWithRank[]> {
    // Update rankings first
    this.updateRankings();
    
    // Get all parks and sort by rating
    const allParks = Array.from(this.parks.values());
    allParks.sort((a, b) => b.rating - a.rating);
    
    // Convert to ParkWithRank type
    return allParks.map(park => ({
      ...park,
      rankChange: park.lastChange
    }));
  }
  
  // Matchup methods
  async createMatchup(insertMatchup: InsertMatchup): Promise<Matchup> {
    const id = this.matchupIdCounter++;
    const matchup: Matchup = { 
      ...insertMatchup, 
      id, 
      createdAt: new Date(),
      winnerId: null,
      park1OldRating: null,
      park2OldRating: null,
      park1NewRating: null,
      park2NewRating: null
    };
    this.matchups.set(id, matchup);
    return matchup;
  }
  
  async getMatchupById(id: number): Promise<Matchup | undefined> {
    return this.matchups.get(id);
  }
  
  async updateMatchup(id: number, matchupUpdate: Partial<Matchup>): Promise<Matchup | undefined> {
    const matchup = this.matchups.get(id);
    if (!matchup) return undefined;
    
    const updatedMatchup = { ...matchup, ...matchupUpdate };
    this.matchups.set(id, updatedMatchup);
    return updatedMatchup;
  }
  
  async getRandomMatchup(): Promise<{ id: number, park1Id: number, park2Id: number } | undefined> {
    const allParks = Array.from(this.parks.values());
    if (allParks.length < 2) return undefined;
    
    // Get two random parks
    const shuffled = [...allParks].sort(() => 0.5 - Math.random());
    const [park1, park2] = shuffled.slice(0, 2);
    
    // Create a new matchup
    const matchup = await this.createMatchup({
      park1Id: park1.id,
      park2Id: park2.id
    });
    
    return {
      id: matchup.id,
      park1Id: park1.id,
      park2Id: park2.id
    };
  }
}

// Instantiate and export the storage interface
export const storage = new MemStorage();
