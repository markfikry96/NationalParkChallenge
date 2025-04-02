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
        name: "Grand Canyon",
        description: "A steep-sided canyon carved by the Colorado River in Arizona, known for its visually overwhelming size and colorful landscape.",
        iconType: "canyon",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/USA_09847_Grand_Canyon_Luca_Galuzzi_2007.jpg/1280px-USA_09847_Grand_Canyon_Luca_Galuzzi_2007.jpg",
        rating: 1600,
        trending: true,
        lastChange: 2
      },
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
