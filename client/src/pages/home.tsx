import { useRankedParks, useCurrentMatchup } from "@/hooks/use-parks";
import Matchup from "@/components/matchup";
import Rankings from "@/components/rankings";
import { Park } from "@shared/schema";

export default function Home() {
  const { 
    currentMatchup, 
    isLoading: isLoadingMatchup, 
    isVoting,
    isSkipping,
    voteForPark, 
    skipMatchup 
  } = useCurrentMatchup();
  
  const { 
    data: rankedParks, 
    isLoading: isLoadingRankings 
  } = useRankedParks();

  const handleVote = (park: Park) => {
    voteForPark(park.id);
  };

  return (
    <div className="font-body bg-park-brown-100 text-park-brown-800 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-park-green-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9l7-7 7 7M5 9v11a2 2 0 002 2h10a2 2 0 002-2V9" />
              </svg>
              nps rank
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Matchup Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-display font-semibold text-center mb-6">
              Which park would you rather visit?
            </h2>
            
            <Matchup 
              matchup={currentMatchup}
              isLoading={isLoadingMatchup}
              isVoting={isVoting}
              isSkipping={isSkipping}
              onVote={handleVote}
              onSkip={skipMatchup}
            />
          </section>
          
          {/* Rankings Section */}
          <section>
            <Rankings parks={rankedParks || []} isLoading={isLoadingRankings} />
          </section>
        </main>
      </div>
    </div>
  );
}
