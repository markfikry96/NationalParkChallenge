import { InsertPark, InsertUser, Matchup, Park, ParkWithRank, User, InsertMatchup, ParkIconType } from "../shared/schema";
import { IStorage } from "./storage";
import { db, parksTable, matchupsTable, usersTable } from "./db";
import { eq, sql, desc, asc } from "drizzle-orm";

// Validate ParkIconType
function validateParkIconType(iconType: string): ParkIconType {
  const iconTypes = Object.values(ParkIconType);
  
  if (iconTypes.includes(iconType as ParkIconType)) {
    return iconType as ParkIconType;
  }
  
  // Default to mountain if invalid
  console.warn(`Invalid park icon type: ${iconType}. Using "mountain" as default.`);
  return ParkIconType.MOUNTAIN;
}

/**
 * DatabaseStorage - A PostgreSQL implementation of the IStorage interface
 */
export class DatabaseStorage implements IStorage {
  /**
   * User Methods
   */
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    return users[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const insertedUsers = await db.insert(usersTable).values([user]).returning();
    return insertedUsers[0];
  }

  /**
   * Park Methods
   */
  async getAllParks(): Promise<Park[]> {
    return db.select().from(parksTable);
  }

  async getParkById(id: number): Promise<Park | undefined> {
    const parks = await db.select().from(parksTable).where(eq(parksTable.id, id)).limit(1);
    return parks[0];
  }

  async getParksByIds(ids: number[]): Promise<Park[]> {
    if (ids.length === 0) return [];
    
    // Using SQL in operator for getting multiple IDs
    return db.select().from(parksTable).where(sql`${parksTable.id} IN (${ids.join(',')})`);
  }

  async createPark(park: InsertPark): Promise<Park> {
    const parkToInsert = {
      ...park,
      iconType: validateParkIconType(park.iconType)
    };
    
    const insertedParks = await db.insert(parksTable).values([parkToInsert]).returning();
    // After inserting, update rankings to ensure the new park has a rank
    await this.updateRankings();
    return insertedParks[0];
  }

  async updatePark(id: number, park: Partial<Park>): Promise<Park | undefined> {
    if (Object.keys(park).length === 0) {
      return this.getParkById(id);
    }

    // Handle iconType if it's being updated
    const parkToUpdate = { ...park };
    if (parkToUpdate.iconType) {
      parkToUpdate.iconType = validateParkIconType(parkToUpdate.iconType as string);
    }

    const updatedParks = await db
      .update(parksTable)
      .set(parkToUpdate)
      .where(eq(parksTable.id, id))
      .returning();
    
    // If rating was updated, recalculate rankings
    if ('rating' in park) {
      await this.updateRankings();
    }
    
    return updatedParks[0];
  }

  async getRankedParks(): Promise<ParkWithRank[]> {
    // Get all parks ordered by rank
    const parks = await db
      .select()
      .from(parksTable)
      .orderBy(asc(parksTable.rank));
    
    // Convert to ParkWithRank type with change indicator
    return parks.map(park => ({
      ...park,
      rankChange: park.lastChange,
    }));
  }

  /**
   * Matchup Methods
   */
  async createMatchup(matchup: InsertMatchup): Promise<Matchup> {
    const insertedMatchups = await db
      .insert(matchupsTable)
      .values([matchup])
      .returning();
    
    return insertedMatchups[0];
  }

  async getMatchupById(id: number): Promise<Matchup | undefined> {
    const matchups = await db
      .select()
      .from(matchupsTable)
      .where(eq(matchupsTable.id, id))
      .limit(1);
    
    return matchups[0];
  }

  async updateMatchup(id: number, matchup: Partial<Matchup>): Promise<Matchup | undefined> {
    if (Object.keys(matchup).length === 0) {
      return this.getMatchupById(id);
    }

    const updatedMatchups = await db
      .update(matchupsTable)
      .set(matchup)
      .where(eq(matchupsTable.id, id))
      .returning();
    
    return updatedMatchups[0];
  }

  async getRandomMatchup(): Promise<{ id: number; park1Id: number; park2Id: number } | undefined> {
    // Get all park IDs
    const parks = await db.select({ id: parksTable.id }).from(parksTable);
    
    if (parks.length < 2) return undefined;
    
    // Select two random parks
    const parkIds = parks.map(p => p.id);
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
  
  /**
   * Private helper methods
   */
  private async updateRankings(): Promise<void> {
    // Get all parks ordered by rating (descending)
    const parks = await db
      .select()
      .from(parksTable)
      .orderBy(desc(parksTable.rating));
    
    // Update rank for each park
    for (let i = 0; i < parks.length; i++) {
      const park = parks[i];
      await db
        .update(parksTable)
        .set({ rank: i + 1 })
        .where(eq(parksTable.id, park.id));
    }
  }
}

// Create and export an instance of the database storage
export const dbStorage = new DatabaseStorage();