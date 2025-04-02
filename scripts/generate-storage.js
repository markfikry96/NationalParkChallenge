import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define ParkIconType constants here since we can't import directly from TypeScript
const ParkIconType = {
  MOUNTAIN: 'mountain',
  CANYON: 'canyon',
  DESERT: 'desert',
  LAKE: 'lake',
  FOREST: 'forest',
  COASTAL: 'coastal',
  VOLCANIC: 'volcanic',
  CAVE: 'cave'
};

/**
 * Generate storage.ts file from parks data
 */
async function generateStorageFile() {
  // Load parks data from park-data.json
  const dataPath = path.join(__dirname, '../park-data.json');
  let parks = [];
  
  try {
    console.log(`Loading park data from ${dataPath}`);
    const data = fs.readFileSync(dataPath, 'utf8');
    parks = JSON.parse(data);
    console.log(`Loaded ${parks.length} parks from park-data.json`);
  } catch (error) {
    console.error('Error loading park data:', error);
    return;
  }
  
  const storageContent = `// This file was generated by scripts/generate-storage.js
import { InsertPark, InsertUser, Matchup, Park, ParkWithRank, User, InsertMatchup, ParkIconType } from "../shared/schema";
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
    const nationalParks: InsertPark[] = ${JSON.stringify(parks, null, 2)};

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
}

export const storage = new MemStorage();
`;

  const storageOutputPath = path.join(__dirname, '../server/storage.ts');
  fs.writeFileSync(storageOutputPath, storageContent);
  
  console.log(`Generated and saved new storage.ts file to ${storageOutputPath}`);
}

// Execute the function
generateStorageFile().catch(console.error);