import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import from schema
import { ParkIconType } from '../shared/schema.js';

// Define the InsertPark type here to avoid import issues
type InsertPark = {
  name: string;
  description: string;
  iconType: string;
  imageUrl: string;
  rating: number;
  trending: boolean;
  lastChange: number;
};

// Helper function to determine the park icon type based on name and description
function determineParkIconType(name: string, description: string): string {
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  if (lowerName.includes('cave') || lowerDesc.includes('cave') || lowerDesc.includes('cavern')) {
    return ParkIconType.CAVE;
  } else if (lowerName.includes('volcano') || lowerDesc.includes('volcano') || lowerDesc.includes('volcanic') || lowerName.includes('lava')) {
    return ParkIconType.VOLCANIC;
  } else if (
    lowerName.includes('island') || 
    lowerDesc.includes('coast') || 
    lowerDesc.includes('ocean') || 
    lowerDesc.includes('sea') || 
    lowerDesc.includes('marine') ||
    lowerDesc.includes('beach')
  ) {
    return ParkIconType.COASTAL;
  } else if (lowerName.includes('canyon') || lowerDesc.includes('canyon') || lowerDesc.includes('gorge')) {
    return ParkIconType.CANYON;
  } else if (
    lowerName.includes('desert') || 
    lowerDesc.includes('desert') || 
    lowerDesc.includes('arid') || 
    lowerDesc.includes('sand dunes')
  ) {
    return ParkIconType.DESERT;
  } else if (
    lowerName.includes('lake') || 
    lowerDesc.includes('lake') || 
    lowerDesc.includes('water') || 
    lowerDesc.includes('reservoir')
  ) {
    return ParkIconType.LAKE;
  } else if (
    lowerName.includes('forest') || 
    lowerDesc.includes('forest') || 
    lowerDesc.includes('woodland') || 
    lowerDesc.includes('trees')
  ) {
    return ParkIconType.FOREST;
  } else if (
    lowerName.includes('mountain') || 
    lowerDesc.includes('mountain') || 
    lowerDesc.includes('peak') || 
    lowerDesc.includes('alpine')
  ) {
    return ParkIconType.MOUNTAIN;
  }
  
  // Default to mountain if no other type matches
  return ParkIconType.MOUNTAIN;
}

/**
 * Scrapes data from a Wikipedia page for a national park
 */
async function fetchParkData(parkName: string): Promise<InsertPark | null> {
  try {
    // Format park name for Wikipedia URL
    const formattedName = parkName.replace(/ /g, '_') + '_National_Park';
    let url = `https://en.wikipedia.org/wiki/${formattedName}`;
    
    console.log(`Fetching ${url}`);
    
    let response = await fetch(url);
    
    // Handle special cases
    if (!response.ok) {
      // Special case handling for parks with different naming conventions
      const specialCases: Record<string, string> = {
        'Gateway Arch': 'Gateway_Arch_National_Park',
        'Indiana Dunes': 'Indiana_Dunes_National_Park',
        'New River Gorge': 'New_River_Gorge_National_Park_and_Preserve',
        'Cuyahoga Valley': 'Cuyahoga_Valley_National_Park',
        'American Samoa': 'National_Park_of_American_Samoa',
        'Hot Springs': 'Hot_Springs_National_Park',
        'Virgin Islands': 'Virgin_Islands_National_Park',
        'Wind Cave': 'Wind_Cave_National_Park',
        'White Sands': 'White_Sands_National_Park'
      };
      
      if (specialCases[parkName]) {
        url = `https://en.wikipedia.org/wiki/${specialCases[parkName]}`;
        console.log(`Trying special case URL: ${url}`);
        response = await fetch(url);
      }
      
      if (!response.ok) {
        console.log(`Failed to fetch Wikipedia page for ${parkName}`);
        return null;
      }
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract data from infobox
    let imageUrl = '';
    const infoboxImage = $('.infobox-image img').first();
    if (infoboxImage.length) {
      imageUrl = 'https:' + infoboxImage.attr('src');
    } else {
      // Try alternative image sources
      const altImage = $('.image img').first();
      if (altImage.length) {
        imageUrl = 'https:' + altImage.attr('src');
      }
    }
    
    // Extract location
    let location = '';
    $('.infobox-label').each((i, el) => {
      const label = $(el).text().trim();
      if (label.includes('Location') || label === 'Location') {
        location = $(el).next('.infobox-data').text().trim().split('[')[0];
      }
    });
    
    // Extract date established
    let dateEstablished = '';
    $('.infobox-label').each((i, el) => {
      const label = $(el).text().trim();
      if (label.includes('Established') || label === 'Established' || label.includes('Date established')) {
        dateEstablished = $(el).next('.infobox-data').text().trim().split('[')[0];
      }
    });
    
    // Extract area
    let area = '';
    $('.infobox-label').each((i, el) => {
      const label = $(el).text().trim();
      if (label.includes('Area') || label === 'Area') {
        area = $(el).next('.infobox-data').text().trim().split('[')[0];
      }
    });
    
    // Extract description from the first few paragraphs
    const paragraphs = $('p').slice(0, 3);
    let description = '';
    paragraphs.each((i, el) => {
      if (!description && $(el).text().trim().length > 50) {
        description = $(el).text().trim()
          .replace(/\[\d+\]/g, '') // Remove citation brackets
          .replace(/\s+/g, ' '); // Normalize whitespace
      }
    });
    
    // Trim the description to a reasonable length
    description = description.length > 500 
      ? description.substring(0, 497) + '...' 
      : description;
      
    // If description is empty or too short, try the next paragraph
    if (description.length < 50) {
      const nextParagraph = $('p').eq(3).text().trim()
        .replace(/\[\d+\]/g, '')
        .replace(/\s+/g, ' ');
      
      if (nextParagraph.length > 50) {
        description = nextParagraph.length > 500 
          ? nextParagraph.substring(0, 497) + '...' 
          : nextParagraph;
      }
    }
    
    // Generate a rich description including location and date if we have them
    let richDescription = description;
    if (location) {
      richDescription = `Located in ${location}. ${richDescription}`;
    }
    
    // Determine icon type based on name and description
    const iconType = determineParkIconType(parkName, richDescription);
    
    return {
      name: parkName,
      description: richDescription,
      iconType: iconType as ParkIconType,
      imageUrl: imageUrl,
      rating: 1500,
      trending: false,
      lastChange: 0
    };
    
  } catch (error) {
    console.error(`Error fetching data for ${parkName}:`, error);
    return null;
  }
}

/**
 * Main function to fetch and save all park data
 */
async function fetchAllParksData() {
  console.log('Starting data fetch for a subset of national parks...');
  
  // List of a small subset of popular US National Parks for the demo
  const parks = [
    "Yellowstone", "Yosemite", "Grand Canyon", "Zion", "Glacier"
  ];
  
  const parksData: InsertPark[] = [];
  
  // Process parks sequentially to avoid rate limiting
  for (const park of parks) {
    const parkData = await fetchParkData(park);
    if (parkData) {
      console.log(`Found data for ${park}`);
      parksData.push(parkData);
    } else {
      console.log(`No data found for ${park}, using default values`);
      
      // Create a default entry if scraping fails
      parksData.push({
        name: park,
        description: `${park} National Park, one of America's natural treasures.`,
        iconType: 'mountain' as ParkIconType,
        imageUrl: '',
        rating: 1500,
        trending: false,
        lastChange: 0
      });
    }
    
    // Add a small delay between requests to be respectful to Wikipedia
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save the results to a JSON file for reference
  const outputPath = path.join(__dirname, '../park-data.json');
  await fs.writeFile(
    outputPath, 
    JSON.stringify(parksData, null, 2)
  );
  
  console.log(`Saved park data to ${outputPath}`);
  
  // Generate TypeScript code for updating the storage.ts file
  let storageFileContent = `// This file was generated by fetch-park-data.ts
import { InsertPark, InsertUser, Matchup, Park, ParkWithRank, User } from "../shared/schema";

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
    const nationalParks: InsertPark[] = ${JSON.stringify(parksData, null, 2)};

    // Add parks to the store
    nationalParks.forEach((park) => this.createPark(park));

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
    const park: Park = {
      ...insertPark,
      id,
      rank: this.parks.size + 1,
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
  await fs.writeFile(storageOutputPath, storageFileContent);
  
  console.log(`Generated and saved new storage.ts file to ${storageOutputPath}`);
}

// Execute the function
fetchAllParksData().catch(console.error);