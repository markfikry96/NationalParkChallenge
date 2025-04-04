import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { voteSchema } from "@shared/schema";
import { calculateEloRating } from "../client/src/lib/elo";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Parks API
  app.get("/api/parks", async (req: Request, res: Response) => {
    try {
      const parks = await storage.getAllParks();
      res.json(parks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parks" });
    }
  });
  
  app.get("/api/parks/ranked", async (req: Request, res: Response) => {
    try {
      const rankedParks = await storage.getRankedParks();
      res.json(rankedParks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ranked parks" });
    }
  });
  
  app.get("/api/parks/:id", async (req: Request, res: Response) => {
    try {
      const park = await storage.getParkById(Number(req.params.id));
      if (!park) {
        return res.status(404).json({ message: "Park not found" });
      }
      res.json(park);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch park" });
    }
  });
  
  // Matchups API
  app.get("/api/matchups/random", async (req: Request, res: Response) => {
    try {
      const matchup = await storage.getRandomMatchup();
      if (!matchup) {
        return res.status(404).json({ message: "Could not create matchup" });
      }
      
      // Get the park details
      const [park1, park2] = await storage.getParksByIds([matchup.park1Id, matchup.park2Id]);
      
      res.json({
        id: matchup.id,
        park1,
        park2
      });
    } catch (error) {
      console.error("Error creating matchup:", error);
      res.status(500).json({ message: "Failed to create matchup" });
    }
  });
  
  // Get the latest vote result
  app.get("/api/matchups/latest-result", async (req: Request, res: Response) => {
    try {
      const latestResult = await storage.getLatestVoteResult();
      
      if (!latestResult) {
        return res.status(404).json({ message: "No vote results found" });
      }
      
      res.json(latestResult);
    } catch (error) {
      console.error("Error fetching latest result:", error);
      res.status(500).json({ message: "Failed to fetch latest vote result" });
    }
  });
  
  app.post("/api/matchups/vote", async (req: Request, res: Response) => {
    try {
      // Validate the vote data
      const voteData = voteSchema.parse(req.body);
      
      // Get the matchup
      const matchup = await storage.getMatchupById(voteData.matchupId);
      if (!matchup) {
        return res.status(404).json({ message: "Matchup not found" });
      }
      
      // Check if vote is valid
      if (voteData.winnerId !== matchup.park1Id && voteData.winnerId !== matchup.park2Id) {
        return res.status(400).json({ message: "Invalid winner ID" });
      }
      
      // Get the parks
      const park1 = await storage.getParkById(matchup.park1Id);
      const park2 = await storage.getParkById(matchup.park2Id);
      if (!park1 || !park2) {
        return res.status(404).json({ message: "Park not found" });
      }
      
      // Store original ratings for the matchup record
      const park1OldRating = park1.rating;
      const park2OldRating = park2.rating;
      
      // Calculate new ELO ratings
      const loserId = voteData.winnerId === park1.id ? park2.id : park1.id;
      const winner = voteData.winnerId === park1.id ? park1 : park2;
      const loser = loserId === park1.id ? park1 : park2;
      
      const { winnerNewRating, loserNewRating } = calculateEloRating(
        winner.rating,
        loser.rating
      );
      
      // Update parks with new ratings
      const winnerChange = Math.abs(winnerNewRating - winner.rating);
      const loserChange = Math.abs(loser.rating - loserNewRating);
      
      // Update winner park
      await storage.updatePark(winner.id, {
        rating: winnerNewRating,
        trending: winnerChange > 10, // Mark as trending if rating changed significantly
        lastChange: (winner.lastChange ?? 0) > 0 ? (winner.lastChange ?? 0) + 1 : 1 // Increase change count if already positive
      });
      
      // Update loser park
      await storage.updatePark(loser.id, {
        rating: loserNewRating,
        trending: loserChange > 10, // Mark as trending if rating changed significantly
        lastChange: (loser.lastChange ?? 0) < 0 ? (loser.lastChange ?? 0) - 1 : -1 // Decrease change count if already negative
      });
      
      // Update matchup with results
      await storage.updateMatchup(matchup.id, {
        winnerId: voteData.winnerId,
        park1OldRating,
        park2OldRating,
        park1NewRating: voteData.winnerId === park1.id ? winnerNewRating : loserNewRating,
        park2NewRating: voteData.winnerId === park2.id ? winnerNewRating : loserNewRating
      });
      
      // Get updated rankings
      const rankedParks = await storage.getRankedParks();
      
      // Return the updated parks and rankings
      res.json({
        message: "Vote recorded successfully",
        rankings: rankedParks
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to record vote" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
