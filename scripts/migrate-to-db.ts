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
    
    // Get existing park names for checking
    const existingParkNames = existingParks.map(park => park.name);
    
    // Read the park data from the JSON file
    const parksFilePath = path.join(process.cwd(), 'park-data.json');
    const parksData = JSON.parse(fs.readFileSync(parksFilePath, 'utf-8'));
    
    console.log(`Found ${parksData.length} parks in the JSON file. Starting migration...`);
    console.log(`Database already has ${parkCount} parks.`);
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    // Insert/update each park into the database
    for (const park of parksData) {
      const parkData = {
        name: park.name,
        description: park.description,
        iconType: validateParkIconType(park.iconType),
        imageUrl: park.imageUrl || '',
        rating: park.rating || 1500,
        trending: park.trending || false,
        lastChange: park.lastChange || 0
      };
      
      // Check if park already exists
      if (existingParkNames.includes(park.name)) {
        // Update existing park
        const existingPark = existingParks.find(p => p.name === park.name);
        if (existingPark) {
          await db
            .update(parksTable)
            .set(parkData)
            .where(eq(parksTable.name, park.name));
          console.log(`Updated park: ${park.name}`);
          updatedCount++;
        }
      } else {
        // Insert new park
        await db.insert(parksTable).values([parkData]);
        console.log(`Inserted park: ${park.name}`);
        insertedCount++;
      }
    }
    
    // Update rankings - sort by rating (descending) to assign ranks
    const parks = await db.select().from(parksTable).orderBy({ ascending: false, column: parksTable.rating });
    
    for (let i = 0; i < parks.length; i++) {
      const park = parks[i];
      await db
        .update(parksTable)
        .set({ rank: i + 1 })
        .where(eq(parksTable.id, park.id));
    }
    
    console.log(`Migration completed successfully! Added ${insertedCount} new parks, updated ${updatedCount} existing parks.`);
    console.log(`Total parks in database: ${parks.length}`);
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