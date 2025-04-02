import { CurrentMatchup, Park } from "@shared/schema";
import ParkCard, { ParkCardSkeleton } from "./park-card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MatchupProps {
  matchup: CurrentMatchup | undefined;
  isLoading: boolean;
  isVoting: boolean;
  isSkipping: boolean;
  onVote: (park: Park) => void;
  onSkip: () => void;
}

export default function Matchup({ 
  matchup, 
  isLoading, 
  isVoting,
  isSkipping,
  onVote, 
  onSkip 
}: MatchupProps) {
  return (
    <div>
      <AnimatePresence mode="wait">
        {isLoading || isSkipping ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center"
          >
            <ParkCardSkeleton />
            
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center border-2 border-park-green-500 text-park-green-500 font-display font-bold">
              VS
            </div>
            
            <ParkCardSkeleton />
          </motion.div>
        ) : matchup ? (
          <motion.div 
            key="matchup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center"
          >
            <ParkCard 
              park={matchup.park1} 
              onVote={onVote} 
              isVoting={isVoting}
              color="green"
            />
            
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center border-2 border-park-green-500 text-park-green-500 font-display font-bold">
              VS
            </div>
            
            <ParkCard 
              park={matchup.park2} 
              onVote={onVote} 
              isVoting={isVoting}
              color="blue"
            />
          </motion.div>
        ) : (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center p-10 bg-white rounded-xl shadow-card"
          >
            <p className="text-xl text-park-brown-700 mb-4">
              No parks available for comparison.
            </p>
            <Button onClick={onSkip} variant="outline">
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-4 text-center">
        <Button 
          onClick={onSkip} 
          variant="ghost"
          className="text-park-brown-700 hover:text-park-green-600 text-sm font-medium inline-flex items-center transition-colors"
          disabled={isLoading || isVoting || isSkipping}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Skip this matchup
        </Button>
      </div>
    </div>
  );
}
