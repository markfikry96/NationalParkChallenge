// This file was generated by scripts/generate-storage.js
import { InsertPark, InsertUser, Matchup, Park, ParkWithRank, User, InsertMatchup, ParkIconType, LatestVoteResult } from "../shared/schema";
import fs from 'fs';

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
  updateMatchup(
    id: number,
    matchup: Partial<Matchup>,
  ): Promise<Matchup | undefined>;
  getRandomMatchup(): Promise<
    { id: number; park1Id: number; park2Id: number } | undefined
  >;
  
  // Get the latest completed matchup with vote result
  getLatestVoteResult(): Promise<LatestVoteResult | undefined>;
}

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

    this.initializeParks();
  }

  // Initialize with national parks data
  private initializeParks() {
    const nationalParks: InsertPark[] = [
  {
    "name": "Yellowstone",
    "description": "Located in United States\nPark County, Wyoming\nTeton County, Wyoming\nGallatin County, Montana\nPark County, Montana\nFremont County, Idaho. Yellowstone National Park is a national park of the United States located in the northwest corner of Wyoming and extending into Montana and Idaho. It was established by the 42nd U.S. Congress through the Yellowstone National Park Protection Act and signed into law by President Ulysses S. Grant on March 1, 1872. Yellowstone was the first national park in the U.S. and is also widely held to be the first national park in the world. The park is known for its wildlife and its many geothermal featu...",
    "iconType": "mountain",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Grand_Canyon_of_yellowstone.jpg/250px-Grand_Canyon_of_yellowstone.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Yosemite",
    "description": "Located in Tuolumne, Mariposa, Mono and Madera Counties, California, United States. Yosemite National Park (/joʊˈsɛmɪti/ yoh-SEM-ih-tee) is a national park of the United States in California. It is bordered on the southeast by Sierra National Forest and on the northwest by Stanislaus National Forest. The park is managed by the National Park Service and covers 759,620 acres (1,187 sq mi; 3,074 km2) in four counties – centered in Tuolumne and Mariposa, extending north and east to Mono and south to Madera. Designated a World Heritage Site in 1984, Yosemite is internationally re...",
    "iconType": "forest",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Tunnel_View%2C_Yosemite_Valley%2C_Yosemite_NP_-_Diliff.jpg/330px-Tunnel_View%2C_Yosemite_Valley%2C_Yosemite_NP_-_Diliff.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Grand Canyon",
    "description": "Located in Coconino and Mohave counties, Arizona, United States. Grand Canyon National Park is a national park of the United States located in northwestern Arizona, the 15th site to have been named as a national park. The park's central feature is the Grand Canyon, a gorge of the Colorado River, which is often considered one of the Wonders of the World. The park, which covers 1,217,262 acres (1,901.972 sq mi; 4,926.08 km2) of unincorporated area in Coconino and Mohave counties, received more than 4.7 million recreational visitors in 2023. The Grand Canyon ...",
    "iconType": "canyon",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg/330px-Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Zion",
    "description": "Located in Washington, Kane, and Iron counties, Utah, United States. Zion National Park is a national park of the United States located in southwestern Utah near the town of Springdale. Located at the junction of the Colorado Plateau, Great Basin, and Mojave Desert regions, the park has a unique geography and a variety of life zones that allow for unusual plant and animal diversity. Numerous plant species as well as 289 species of birds, 75 mammals (including 19 species of bat), and 32 reptiles inhabit the park's four life zones: desert, riparian, woodland, an...",
    "iconType": "desert",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Zion_angels_landing_view.jpg/284px-Zion_angels_landing_view.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Glacier",
    "description": "",
    "iconType": "mountain",
    "imageUrl": "",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Big Bend",
    "description": "Located in Brewster County, Texas, United States. Big Bend National Park is a national park of the United States located in West Texas, bordering Mexico. The park has national significance as the largest protected area of Chihuahuan Desert topography and ecology in the United States, and was named after a large bend in the Rio Grande/Río Bravo. The park protects more than 1,200 species of plants, more than 450 species of birds, 56 species of reptiles, and 75 species of mammals. Additional park activities include scenic drives, programs led b...",
    "iconType": "desert",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Canyon%2C_Rio_Grande%2C_Texas.jpeg/284px-Canyon%2C_Rio_Grande%2C_Texas.jpeg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Carlsbad Caverns",
    "description": "Located in Eddy County, New Mexico, US. Carlsbad Caverns National Park is a national park of the United States in the Guadalupe Mountains of southeastern New Mexico. The primary attraction of the park is the show cave Carlsbad Cavern. Visitors to the cave can hike in on their own via the natural entrance or take an elevator from the visitor center.",
    "iconType": "cave",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Carlsbad_Interior_Formations.jpg/330px-Carlsbad_Interior_Formations.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Channel Islands",
    "description": "Located in Santa Barbara County & Ventura County, California, United States. Channel Islands National Park is a national park of the United States, which consists of five of the eight Channel Islands off the coast of California. Although the islands are close to the shore of the densely populated state, they have been relatively undeveloped. The park covers 249,561 acres (100,994 ha), of which 79,019 acres (31,978 ha) are federal land.",
    "iconType": "coastal",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Channel_Islands_National_Park_by_Sentinel-2.jpg/284px-Channel_Islands_National_Park_by_Sentinel-2.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Congaree",
    "description": "Located in Richland County, South Carolina, United States. Congaree National Park is a 26,692.6-acre (41.7 sq mi; 108.0 km2) national park of the United States in central South Carolina, 18 miles southeast of the state capital, Columbia. The park preserves the largest tract of old growth bottomland hardwood forest left in the United States. The lush trees growing in its floodplain forest are some of the tallest in the eastern United States, forming one of the highest temperate deciduous forest canopies remaining in the world. The Congaree River flows...",
    "iconType": "forest",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/A548%2C_Congaree_National_Park%2C_South_Carolina%2C_USA%2C_2012.jpg/330px-A548%2C_Congaree_National_Park%2C_South_Carolina%2C_USA%2C_2012.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Death Valley",
    "description": "Located in California and Nevada, United States. Death Valley National Park is a national park of the United States that straddles the California–Nevada border, east of the Sierra Nevada. The park boundaries include Death Valley, the northern section of Panamint Valley, the southern section of Eureka Valley and most of Saline Valley.",
    "iconType": "mountain",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Mesquite_Sand_Dunes_in_Death_Valley.jpg/284px-Mesquite_Sand_Dunes_in_Death_Valley.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Denali",
    "description": "Located in Denali Borough and Matanuska-Susitna Borough, Alaska, United States. Denali National Park and Preserve, formerly known as Mount McKinley National Park, is a United States national park and preserve located in Interior Alaska, centered on Denali (federally designated as Mount McKinley), the highest mountain in North America. The park and contiguous preserve encompass 6,045,153 acres (2,446,387 ha; 9,446 sq mi; 24,464 km2) which is larger than the state of New Hampshire. On December 2, 1980, 2,146,580-acre (3,354 sq mi; 8,687 km2) Denali Wilderness was establish...",
    "iconType": "mountain",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Every_Road-_Denali_%287945497984%29.jpg/330px-Every_Road-_Denali_%287945497984%29.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Dry Tortugas",
    "description": "Located in end of the Florida Keys, United States. Dry Tortugas National Park is a national park of the United States located about 68 miles (109 km) west of Key West in the Gulf of Mexico, in the United States. The park preserves Fort Jefferson and the several Dry Tortugas islands, the westernmost and most isolated of the Florida Keys. The archipelago's coral reefs are the least disturbed of the Florida Keys reefs.",
    "iconType": "mountain",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Fort-Jefferson_Dry-Tortugas.jpg/284px-Fort-Jefferson_Dry-Tortugas.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  },
  {
    "name": "Everglades",
    "description": "Located in Miami-Dade, Monroe, & Collier counties, Florida, United States. Everglades National Park is a national park of the United States that protects the southern twenty percent of the original Everglades in Florida. The park is the largest tropical wilderness in the United States and the largest wilderness of any kind east of the Mississippi River. An average of one million people visit the park each year. Everglades is the third-largest national park in the contiguous United States after Death Valley and Yellowstone. UNESCO declared the Everglades & Dry Tortug...",
    "iconType": "mountain",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sunset_over_the_River_of_Grass%2C_NPSphoto%2C_G.Gardner_%289255157507%29.jpg/330px-Sunset_over_the_River_of_Grass%2C_NPSphoto%2C_G.Gardner_%289255157507%29.jpg",
    "rating": 1500,
    "trending": false,
    "lastChange": 0
  }
];

    // Add parks to the store
    nationalParks.forEach((park) => this.createPark(park));

    // Update rankings
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
      (user) => user.username === username,
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
    return ids.map((id) => this.parks.get(id)).filter(Boolean) as Park[];
  }

  async createPark(insertPark: InsertPark): Promise<Park> {
    const id = this.parkIdCounter++;
    // We need to manually construct the Park object to ensure correct types
    const park: Park = {
      id,
      name: insertPark.name,
      description: insertPark.description,
      iconType: insertPark.iconType as ParkIconType,  // Type assertion to ensure compatibility
      imageUrl: insertPark.imageUrl ?? '',
      rating: insertPark.rating ?? 1500,
      rank: this.parks.size + 1,
      trending: insertPark.trending ?? false,
      lastChange: insertPark.lastChange ?? 0
    };
    this.parks.set(id, park);
    return park;
  }

  async updatePark(
    id: number,
    parkUpdate: Partial<Park>,
  ): Promise<Park | undefined> {
    const park = this.parks.get(id);
    if (!park) return undefined;

    const updatedPark = { ...park, ...parkUpdate };
    this.parks.set(id, updatedPark);

    // Update rankings if rating changed
    if (parkUpdate.rating !== undefined) {
      this.updateRankings();
    }

    return updatedPark;
  }

  async getRankedParks(): Promise<ParkWithRank[]> {
    // Get all parks and sort by rank
    const parksList = Array.from(this.parks.values());
    parksList.sort((a, b) => (a.rank || 999) - (b.rank || 999));

    // Convert to ParkWithRank type with change indicator
    return parksList.map((park) => ({
      ...park,
      rankChange: park.lastChange,
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

  async updateMatchup(
    id: number,
    matchupUpdate: Partial<Matchup>,
  ): Promise<Matchup | undefined> {
    const matchup = this.matchups.get(id);
    if (!matchup) return undefined;

    const updatedMatchup = { ...matchup, ...matchupUpdate };
    this.matchups.set(id, updatedMatchup);
    return updatedMatchup;
  }

  async getRandomMatchup(): Promise<
    { id: number; park1Id: number; park2Id: number } | undefined
  > {
    const parks = Array.from(this.parks.values());
    
    if (parks.length < 2) return undefined;

    // Select two random parks
    const parkIds = parks.map((p) => p.id);
    const randomIndex1 = Math.floor(Math.random() * parkIds.length);
    let randomIndex2 = Math.floor(Math.random() * (parkIds.length - 1));
    if (randomIndex2 >= randomIndex1) randomIndex2++;

    const park1Id = parkIds[randomIndex1];
    const park2Id = parkIds[randomIndex2];

    // Create a new matchup
    const matchup = await this.createMatchup({
      park1Id,
      park2Id,
    });

    return {
      id: matchup.id,
      park1Id: matchup.park1Id,
      park2Id: matchup.park2Id,
    };
  }
  
  async getLatestVoteResult(): Promise<LatestVoteResult | undefined> {
    // Get all matchups that have a winnerId (completed votes)
    const completedMatchups = Array.from(this.matchups.values())
      .filter(m => m.winnerId !== null)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
        return dateB.getTime() - dateA.getTime();
      });
    
    if (completedMatchups.length === 0) return undefined;
    
    // Get the most recent completed matchup
    const latestMatchup = completedMatchups[0];
    
    // Ensure we have all the required data
    if (!latestMatchup.winnerId || 
        !latestMatchup.park1OldRating || 
        !latestMatchup.park2OldRating || 
        !latestMatchup.park1NewRating || 
        !latestMatchup.park2NewRating) {
      return undefined;
    }
    
    // Get the parks involved
    const park1 = await this.getParkById(latestMatchup.park1Id);
    const park2 = await this.getParkById(latestMatchup.park2Id);
    
    if (!park1 || !park2) return undefined;
    
    const winner = latestMatchup.winnerId === park1.id ? park1 : park2;
    const loser = latestMatchup.winnerId === park1.id ? park2 : park1;
    
    const winnerOldRating = latestMatchup.winnerId === park1.id 
      ? latestMatchup.park1OldRating 
      : latestMatchup.park2OldRating;
    
    const winnerNewRating = latestMatchup.winnerId === park1.id 
      ? latestMatchup.park1NewRating 
      : latestMatchup.park2NewRating;
    
    const loserOldRating = latestMatchup.winnerId === park1.id 
      ? latestMatchup.park2OldRating 
      : latestMatchup.park1OldRating;
    
    const loserNewRating = latestMatchup.winnerId === park1.id 
      ? latestMatchup.park2NewRating 
      : latestMatchup.park1NewRating;
    
    return {
      id: latestMatchup.id,
      winner,
      loser,
      winnerOldRating,
      winnerNewRating,
      loserOldRating,
      loserNewRating,
      createdAt: latestMatchup.createdAt instanceof Date ? latestMatchup.createdAt : new Date()
    };
  }
}

// Database Storage Implementation 
import { dbStorage } from './db-storage';

// Use database storage instead of memory storage
export const storage = dbStorage;
