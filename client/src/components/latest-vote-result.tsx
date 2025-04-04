import { LatestVoteResult } from "@shared/schema";
import { Card } from "@/components/ui/card";
import ParkIcon from "./park-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, Zap } from "lucide-react";

interface LatestVoteResultProps {
  result: LatestVoteResult | undefined;
  isLoading: boolean;
}

export default function LatestVoteResultCard({ result, isLoading }: LatestVoteResultProps) {
  if (isLoading) {
    return <LatestVoteResultSkeleton />;
  }

  if (!result) {
    return (
      <Card className="bg-white rounded-xl shadow-card p-5 overflow-hidden text-center">
        <p className="text-gray-500 text-sm">No votes recorded yet</p>
      </Card>
    );
  }

  const winnerRatingChange = result.winnerNewRating - result.winnerOldRating;
  const loserRatingChange = result.loserNewRating - result.loserOldRating;

  return (
    <Card className="bg-white rounded-xl shadow-card p-5 overflow-hidden">
      <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center">
        <Zap className="h-5 w-5 text-yellow-500 mr-2" />
        Latest Vote Result
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Winner */}
        <div className="border border-green-100 bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-park-green-500">
              <ParkIcon type={result.winner.iconType} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{result.winner.name}</h4>
              <span className="text-xs text-gray-500">Winner</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              <span className="text-gray-500">Rating: </span>
              <span className="font-medium">{Math.round(result.winnerNewRating)}</span>
            </div>
            <div className="flex items-center text-green-600 text-xs font-medium">
              <ArrowUp className="h-3 w-3 mr-1" />
              {Math.round(winnerRatingChange)}
            </div>
          </div>
        </div>
        
        {/* Loser */}
        <div className="border border-red-100 bg-red-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-park-blue-500">
              <ParkIcon type={result.loser.iconType} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{result.loser.name}</h4>
              <span className="text-xs text-gray-500">Runner-up</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              <span className="text-gray-500">Rating: </span>
              <span className="font-medium">{Math.round(result.loserNewRating)}</span>
            </div>
            <div className="flex items-center text-red-600 text-xs font-medium">
              <ArrowDown className="h-3 w-3 mr-1" />
              {Math.abs(Math.round(loserRatingChange))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-center text-xs text-gray-500">
        {new Date(result.createdAt).toLocaleString()}
      </div>
    </Card>
  );
}

export function LatestVoteResultSkeleton() {
  return (
    <Card className="bg-white rounded-xl shadow-card p-5 overflow-hidden">
      <Skeleton className="h-6 w-40 mx-auto mb-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-100 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        
        <div className="border border-gray-100 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
      
      <Skeleton className="h-3 w-32 mx-auto mt-2" />
    </Card>
  );
}