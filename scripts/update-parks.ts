import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
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
        'Acadia': 'Acadia_National_Park',
        'American Samoa': 'National_Park_of_American_Samoa',
        'Arches': 'Arches_National_Park',
        'Badlands': 'Badlands_National_Park',
        'Big Bend': 'Big_Bend_National_Park',
        'Biscayne': 'Biscayne_National_Park',
        'Black Canyon of the Gunnison': 'Black_Canyon_of_the_Gunnison_National_Park',
        'Bryce Canyon': 'Bryce_Canyon_National_Park',
        'Canyonlands': 'Canyonlands_National_Park',
        'Capitol Reef': 'Capitol_Reef_National_Park',
        'Carlsbad Caverns': 'Carlsbad_Caverns_National_Park',
        'Channel Islands': 'Channel_Islands_National_Park',
        'Congaree': 'Congaree_National_Park',
        'Crater Lake': 'Crater_Lake_National_Park',
        'Cuyahoga Valley': 'Cuyahoga_Valley_National_Park',
        'Death Valley': 'Death_Valley_National_Park',
        'Denali': 'Denali_National_Park_and_Preserve',
        'Dry Tortugas': 'Dry_Tortugas_National_Park',
        'Everglades': 'Everglades_National_Park',
        'Gates of the Arctic': 'Gates_of_the_Arctic_National_Park_and_Preserve',
        'Gateway Arch': 'Gateway_Arch_National_Park',
        'Glacier': 'Glacier_National_Park_(U.S.)',
        'Glacier Bay': 'Glacier_Bay_National_Park_and_Preserve',
        'Grand Canyon': 'Grand_Canyon_National_Park',
        'Grand Teton': 'Grand_Teton_National_Park',
        'Great Basin': 'Great_Basin_National_Park',
        'Great Sand Dunes': 'Great_Sand_Dunes_National_Park_and_Preserve',
        'Great Smoky Mountains': 'Great_Smoky_Mountains_National_Park',
        'Guadalupe Mountains': 'Guadalupe_Mountains_National_Park',
        'Haleakalā': 'Haleakalā_National_Park',
        'Hawaiʻi Volcanoes': 'Hawaii_Volcanoes_National_Park',
        'Hot Springs': 'Hot_Springs_National_Park',
        'Indiana Dunes': 'Indiana_Dunes_National_Park',
        'Isle Royale': 'Isle_Royale_National_Park',
        'Joshua Tree': 'Joshua_Tree_National_Park',
        'Katmai': 'Katmai_National_Park_and_Preserve',
        'Kenai Fjords': 'Kenai_Fjords_National_Park',
        'Kings Canyon': 'Kings_Canyon_National_Park',
        'Kobuk Valley': 'Kobuk_Valley_National_Park',
        'Lake Clark': 'Lake_Clark_National_Park_and_Preserve',
        'Lassen Volcanic': 'Lassen_Volcanic_National_Park',
        'Mammoth Cave': 'Mammoth_Cave_National_Park',
        'Mesa Verde': 'Mesa_Verde_National_Park',
        'Mount Rainier': 'Mount_Rainier_National_Park',
        'New River Gorge': 'New_River_Gorge_National_Park_and_Preserve',
        'North Cascades': 'North_Cascades_National_Park',
        'Olympic': 'Olympic_National_Park',
        'Petrified Forest': 'Petrified_Forest_National_Park',
        'Pinnacles': 'Pinnacles_National_Park',
        'Redwood': 'Redwood_National_and_State_Parks',
        'Rocky Mountain': 'Rocky_Mountain_National_Park',
        'Saguaro': 'Saguaro_National_Park',
        'Sequoia': 'Sequoia_National_Park',
        'Shenandoah': 'Shenandoah_National_Park',
        'Theodore Roosevelt': 'Theodore_Roosevelt_National_Park',
        'Virgin Islands': 'Virgin_Islands_National_Park',
        'Voyageurs': 'Voyageurs_National_Park',
        'White Sands': 'White_Sands_National_Park',
        'Wind Cave': 'Wind_Cave_National_Park',
        'Wrangell–St. Elias': 'Wrangell–St._Elias_National_Park_and_Preserve',
        'Yellowstone': 'Yellowstone_National_Park',
        'Yosemite': 'Yosemite_National_Park',
        'Zion': 'Zion_National_Park'
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
 * Fetch all national parks from the Wikipedia list page
 */
async function fetchParkList(): Promise<string[]> {
  try {
    const url = 'https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States';
    console.log(`Fetching national parks list from ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch parks list: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract park names from the table
    const parkNames: string[] = [];
    
    // The parks are in a table with links to each park
    $('.wikitable tbody tr').each((i, row) => {
      const firstCell = $(row).find('td:first-child');
      if (firstCell.length) {
        const parkLink = firstCell.find('a').first();
        if (parkLink.length) {
          const name = parkLink.text().trim();
          if (name && !parkNames.includes(name)) {
            parkNames.push(name);
          }
        }
      }
    });
    
    console.log(`Found ${parkNames.length} national parks`);
    return parkNames;
  } catch (error) {
    console.error('Error fetching park list:', error);
    return [];
  }
}

/**
 * Generate storage.ts file from parks data
 */
async function generateStorageFile(parks: InsertPark[]): Promise<void> {
  const storageContent = `// This file was generated by update-parks.ts
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
    let nationalParks: InsertPark[] = [];
    
    try {
      // Try to load from park-data.json if it exists
      if (fs.existsSync('./park-data.json')) {
        console.log('Loading parks from park-data.json');
        const parksData = fs.readFileSync('./park-data.json', 'utf8');
        const parsedParks = JSON.parse(parksData);
        
        // Ensure icons are properly converted to ParkIconType
        nationalParks = parsedParks.map((park: any) => ({
          ...park,
          iconType: park.iconType as ParkIconType,
          trending: park.trending ?? false,
          lastChange: park.lastChange ?? 0
        }));
        
        console.log(\`Loaded \${nationalParks.length} parks from park-data.json\`);
      } else {
        console.log('park-data.json not found, using default parks');
        // Use default parks
        nationalParks = [
          {
            "name": "Yellowstone",
            "description": "Located in United States, the first national park in the U.S.",
            "iconType": ParkIconType.MOUNTAIN,
            "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Grand_Canyon_of_yellowstone.jpg/250px-Grand_Canyon_of_yellowstone.jpg",
            "rating": 1500,
            "trending": false,
            "lastChange": 0
          },
          {
            "name": "Yosemite",
            "description": "Located in California. Famous for its waterfalls and giant sequoia trees.",
            "iconType": ParkIconType.FOREST,
            "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Tunnel_View%2C_Yosemite_Valley%2C_Yosemite_NP_-_Diliff.jpg/330px-Tunnel_View%2C_Yosemite_Valley%2C_Yosemite_NP_-_Diliff.jpg",
            "rating": 1500,
            "trending": false,
            "lastChange": 0
          }
        ];
      }
    } catch (error) {
      console.error('Error loading parks data:', error);
      nationalParks = [];
    }

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
      imageUrl: insertPark.imageUrl ?? null,
      rating: insertPark.rating ?? 1500,
      rank: this.parks.size + 1,
      trending: insertPark.trending ?? null,
      lastChange: insertPark.lastChange ?? null
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

/**
 * Main function to fetch and save park data in batches
 */
async function fetchAllParksData() {
  console.log('Starting data fetch for all national parks...');
  
  // Get the list of all national parks from Wikipedia
  let parkNames = await fetchParkList();
  
  if (parkNames.length === 0) {
    console.error('Failed to fetch park names from Wikipedia. Using backup list.');
    // Backup list in case the Wikipedia fetch fails
    parkNames = [
      "Acadia", "American Samoa", "Arches", "Badlands", "Big Bend", 
      "Biscayne", "Black Canyon of the Gunnison", "Bryce Canyon", "Canyonlands", "Capitol Reef",
      "Carlsbad Caverns", "Channel Islands", "Congaree", "Crater Lake", "Cuyahoga Valley",
      "Death Valley", "Denali", "Dry Tortugas", "Everglades", "Gates of the Arctic",
      "Gateway Arch", "Glacier", "Glacier Bay", "Grand Canyon", "Grand Teton",
      "Great Basin", "Great Sand Dunes", "Great Smoky Mountains", "Guadalupe Mountains", "Haleakalā",
      "Hawaiʻi Volcanoes", "Hot Springs", "Indiana Dunes", "Isle Royale", "Joshua Tree",
      "Katmai", "Kenai Fjords", "Kings Canyon", "Kobuk Valley", "Lake Clark",
      "Lassen Volcanic", "Mammoth Cave", "Mesa Verde", "Mount Rainier", "New River Gorge",
      "North Cascades", "Olympic", "Petrified Forest", "Pinnacles", "Redwood",
      "Rocky Mountain", "Saguaro", "Sequoia", "Shenandoah", "Theodore Roosevelt",
      "Virgin Islands", "Voyageurs", "White Sands", "Wind Cave", "Wrangell–St. Elias",
      "Yellowstone", "Yosemite", "Zion"
    ];
  }
  
  // Load existing data if it exists
  let parksData: InsertPark[] = [];
  try {
    if (fs.existsSync(path.join(__dirname, '../park-data.json'))) {
      console.log('Found existing park-data.json, loading data...');
      const existingData = fs.readFileSync(path.join(__dirname, '../park-data.json'), 'utf8');
      parksData = JSON.parse(existingData);
      console.log(`Loaded ${parksData.length} parks from existing data`);
      
      // Filter out parks we've already processed
      const existingParkNames = parksData.map(p => p.name);
      const remainingParks = parkNames.filter(name => !existingParkNames.includes(name));
      console.log(`${existingParkNames.length} parks already processed, ${remainingParks.length} remaining`);
      
      // If all parks are already processed, we're done
      if (remainingParks.length === 0) {
        console.log('All parks already processed!');
        await generateStorageFile(parksData);
        return;
      }
      
      // Update parkNames to only include parks we haven't processed yet
      parkNames = remainingParks;
    }
  } catch (error) {
    console.error('Error loading existing park data:', error);
    console.log('Starting with fresh data collection');
  }
  
  // Determine how many parks to process in this batch
  let batchSize = 10; // Default size
  
  // If we have more than 40 parks, process them all remaining
  // If we have more than 20, process 20 more
  if (parksData.length > 40) {
    batchSize = parkNames.length;
  } else if (parksData.length > 20) {
    batchSize = 20;
  }
  
  // Limit batch to the number of remaining parks
  batchSize = Math.min(batchSize, parkNames.length);
  
  console.log(`Processing ${batchSize} parks in this batch`);
  const parksToProcess = parkNames.slice(0, batchSize);
  
  // Process parks sequentially to avoid rate limiting
  for (const park of parksToProcess) {
    console.log(`Processing park: ${park}`);
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
    
    // Save after each park to avoid losing progress
    console.log('Saving progress...');
    fs.writeFileSync(
      path.join(__dirname, '../park-data.json'), 
      JSON.stringify(parksData, null, 2)
    );
    
    // Add a small delay between requests to be respectful to Wikipedia
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`Processed ${parksToProcess.length} parks, total parks: ${parksData.length}`);
  
  // Generate the storage.ts file with updated park data
  await generateStorageFile(parksData);
  
  console.log('Script completed successfully!');
}

// Execute the function
fetchAllParksData().catch(console.error);