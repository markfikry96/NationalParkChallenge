import { InsertPark, InsertUser, Matchup, Park, ParkWithRank, User, InsertMatchup, ParkIconType, LatestVoteResult } from "../shared/schema";
import { IStorage } from "./storage";
import { db, parksTable, matchupsTable, usersTable } from "./db";
import { eq, sql, desc, asc, isNotNull } from "drizzle-orm";
import postgres from "postgres";

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
    
    console.log("Getting parks with IDs:", ids);
    
    if (ids.length === 1) {
      return db.select().from(parksTable).where(eq(parksTable.id, ids[0]));
    }
    
    // Use individual promises for each park to avoid SQL injection issues
    const promises = ids.map(id => this.getParkById(id));
    const parks = await Promise.all(promises);
    
    // Filter out any undefined values
    return parks.filter(park => park !== undefined) as Park[];
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
    try {
      console.log("Creating matchup with values:", JSON.stringify(matchup, null, 2));
      
      // Insert using Drizzle's API to avoid type issues
      const insertedMatchups = await db
        .insert(matchupsTable)
        .values({
          park1Id: Number(matchup.park1Id),
          park2Id: Number(matchup.park2Id)
        })
        .returning();
      
      if (!insertedMatchups || insertedMatchups.length === 0) {
        throw new Error("Failed to create matchup - no result returned");
      }
      
      const newMatchup = insertedMatchups[0];
      console.log("Created matchup:", newMatchup);
      
      return newMatchup;
    } catch (error) {
      console.error("Error in createMatchup:", error);
      throw error;
    }
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
    try {
      // Get all park IDs
      const parks = await db.select({ id: parksTable.id }).from(parksTable);
      console.log(`Found ${parks.length} parks in database`);
      
      if (parks.length < 2) {
        console.log("Not enough parks for a matchup");
        return undefined;
      }
      
      // Select two random parks
      const parkIds = parks.map(p => p.id);
      console.log("Available park IDs:", parkIds);
      
      const randomIndex1 = Math.floor(Math.random() * parkIds.length);
      let randomIndex2 = Math.floor(Math.random() * (parkIds.length - 1));
      if (randomIndex2 >= randomIndex1) randomIndex2++;
      
      const park1Id = parkIds[randomIndex1];
      const park2Id = parkIds[randomIndex2];
      console.log(`Selected parks for matchup: ${park1Id} vs ${park2Id}`);
      
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
    } catch (error) {
      console.error("Error in getRandomMatchup:", error);
      throw error;
    }
  }
  
  /**
   * Get the latest matchup with vote result
   */
  async getLatestVoteResult(): Promise<LatestVoteResult | undefined> {
    try {
      // Get the most recent completed matchup
      const latestMatchups = await db
        .select()
        .from(matchupsTable)
        .where(isNotNull(matchupsTable.winnerId))
        .orderBy(desc(matchupsTable.createdAt))
        .limit(1);
      
      if (latestMatchups.length === 0) {
        return undefined;
      }
      
      const latestMatchup = latestMatchups[0];
      
      // Ensure we have all the required data
      if (!latestMatchup.winnerId || 
          !latestMatchup.park1OldRating || 
          !latestMatchup.park2OldRating || 
          !latestMatchup.park1NewRating || 
          !latestMatchup.park2NewRating) {
        return undefined;
      }
      
      // Get the parks involved
      const [park1, park2] = await this.getParksByIds([latestMatchup.park1Id, latestMatchup.park2Id]);
      
      if (!park1 || !park2) {
        return undefined;
      }
      
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
      
      // Ensure we have a valid Date object for createdAt
      const createdAt = new Date();
      if (latestMatchup.createdAt) {
        if (latestMatchup.createdAt instanceof Date) {
          createdAt.setTime(latestMatchup.createdAt.getTime());
        } else if (typeof latestMatchup.createdAt === 'string') {
          createdAt.setTime(new Date(latestMatchup.createdAt).getTime());
        }
      }
      
      return {
        id: latestMatchup.id,
        winner,
        loser,
        winnerOldRating,
        winnerNewRating,
        loserOldRating,
        loserNewRating,
        createdAt
      };
    } catch (error) {
      console.error("Error in getLatestVoteResult:", error);
      return undefined;
    }
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