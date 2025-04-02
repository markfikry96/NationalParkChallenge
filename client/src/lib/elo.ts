/**
 * Calculate new ELO ratings for two players after a match
 * 
 * @param winnerRating - Current rating of the winner
 * @param loserRating - Current rating of the loser
 * @param kFactor - How much ratings should change after a match (default: 32)
 * @returns Object with new ratings for both players
 */
export function calculateEloRating(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): { winnerNewRating: number; loserNewRating: number } {
  // Calculate expected scores
  const expectedScoreWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedScoreLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  // Calculate new ratings
  const winnerNewRating = Math.round(winnerRating + kFactor * (1 - expectedScoreWinner));
  const loserNewRating = Math.round(loserRating + kFactor * (0 - expectedScoreLoser));
  
  return { winnerNewRating, loserNewRating };
}
