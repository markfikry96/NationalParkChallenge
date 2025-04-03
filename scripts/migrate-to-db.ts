import fs from 'fs';
import path from 'path';
import { db, parksTable } from '../server/db';
import { ParkIconType } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Function to validate ParkIconType
function validateParkIconType(iconType: string): ParkIconType {
  const iconTypes = Object.values(ParkIconType);
  
  if (iconTypes.includes(iconType as ParkIconType)) {
    return iconType as ParkIconType;
  }
  
  console.warn(`Invalid park icon type: ${iconType}. Using "mountain" as default.`);
  return ParkIconType.MOUNTAIN;
}

/**
 * Migrates park data from JSON file to PostgreSQL database
 */
async function migrateParksToDatabase() {
  try {
    // Check if there's already data in the parks table
    const existingParks = await db.select().from(parksTable);
    const parkCount = existingParks.length;
    
    if (parkCount > 0) {
      console.log(`Database already has ${parkCount} parks. Skipping migration.`);
      return;
    }
    
    // Read the park data from the JSON file
    const parksFilePath = path.join(process.cwd(), 'park-data.json');
    const parksData = JSON.parse(fs.readFileSync(parksFilePath, 'utf-8'));
    
    console.log(`Found ${parksData.length} parks in the JSON file. Starting migration...`);
    
    // Insert each park into the database
    for (const park of parksData) {
      const parkToInsert = {
        name: park.name,
        description: park.description,
        iconType: validateParkIconType(park.iconType),
        imageUrl: park.imageUrl || '',
        rating: park.rating || 1500,
        trending: park.trending || false,
        lastChange: park.lastChange || 0
      };
      
      await db.insert(parksTable).values([parkToInsert]);
      console.log(`Inserted park: ${parkToInsert.name}`);
    }
    
    // Update rankings
    const parks = await db.select().from(parksTable).orderBy(parksTable.rating);
    
    for (let i = 0; i < parks.length; i++) {
      const park = parks[i];
      await db
        .update(parksTable)
        .set({ rank: parks.length - i })
        .where(eq(parksTable.id, park.id));
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration script
migrateParksToDatabase()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running migration script:', error);
    process.exit(1);
  });