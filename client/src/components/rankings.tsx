import { ParkWithRank } from "@shared/schema";
import ParkIcon from "./park-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

interface RankingsProps {
  parks: ParkWithRank[];
  isLoading: boolean;
}

export default function Rankings({ parks, isLoading }: RankingsProps) {
  // Only display top 10 parks in the rankings
  const displayParks = parks.slice(0, 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-semibold">rankings</h2>
        <div className="flex items-center gap-4 md:gap-12">
          <h2 className="text-xl font-display font-semibold">score</h2>
          <h2 className="text-xl font-display font-semibold">change</h2>
        </div>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[...Array(4)].map((_, index) => (
                <RankItemSkeleton key={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {displayParks.map((park) => (
                <RankItem key={park.id} park={park} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface RankItemProps {
  park: ParkWithRank;
}

function RankItem({ park }: RankItemProps) {
  // Determine change indicator UI
  let changeIndicator;
  
  if (park.rankChange && park.rankChange > 0) {
    changeIndicator = (
      <div className="flex items-center w-16">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span className="font-medium text-green-500 ml-1">{park.rankChange}</span>
      </div>
    );
  } else if (park.rankChange && park.rankChange < 0) {
    changeIndicator = (
      <div className="flex items-center w-16">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span className="font-medium text-red-500 ml-1">{Math.abs(park.rankChange)}</span>
      </div>
    );
  } else {
    changeIndicator = (
      <div className="flex items-center w-16">
        <span className="font-medium text-gray-500 ml-1">— 0</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-card p-4 flex items-center justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: 0.05 * (park.rank || 0)
      }}
    >
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-lg">{park.rank}</span>
        <div className={park.iconType === "mountain" ? "text-park-green-500" : 
                        park.iconType === "canyon" ? "text-park-blue-500" : 
                        park.iconType === "desert" ? "text-park-brown-700" : 
                        "text-park-green-600"}>
          <ParkIcon type={park.iconType} />
        </div>
        <span className="font-medium">{park.name}</span>
      </div>
      <div className="flex items-center gap-4 md:gap-12">
        <span className="font-semibold w-16 text-right">{park.rating}</span>
        {changeIndicator}
      </div>
    </motion.div>
  );
}

function RankItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex items-center gap-4 md:gap-12">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}
