import { Park } from "@shared/schema";
import ParkIcon from "./park-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ParkCardProps {
  park: Park;
  onVote: (park: Park) => void;
  isVoting: boolean;
  color?: "green" | "blue";
}

export default function ParkCard({ park, onVote, isVoting, color = "green" }: ParkCardProps) {
  const handleVote = () => {
    onVote(park);
  };

  const colorClasses = {
    green: {
      button: "bg-park-green-500 hover:bg-park-green-600 text-white",
      icon: "text-park-green-500"
    },
    blue: {
      button: "bg-park-blue-500 hover:bg-park-blue-700 text-white",
      icon: "text-park-blue-500"
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-5 w-full md:w-80">
      <div className="flex items-start gap-2 mb-3">
        <div className={colorClasses[color].icon}>
          <ParkIcon type={park.iconType} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{park.name}</h3>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        {park.trending && (
          <span className="inline-block px-3 py-1 bg-park-green-100 text-park-green-600 rounded-full text-xs font-medium">
            Trending
          </span>
        )}
        {park.rank && (
          <span className="inline-block px-3 py-1 bg-park-brown-200 text-park-brown-700 rounded-full text-xs font-medium">
            rank #{park.rank}
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {park.description}
      </p>
      
      <Button 
        onClick={handleVote}
        className={`w-full py-6 rounded-lg font-medium transition-colors ${colorClasses[color].button}`}
        disabled={isVoting}
      >
        Choose This Park
      </Button>
    </Card>
  );
}

export function ParkCardSkeleton() {
  return (
    <Card className="bg-white rounded-xl shadow-card p-5 w-full md:w-80">
      <div className="flex items-start gap-2 mb-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <Skeleton className="h-10 w-full rounded-lg" />
    </Card>
  );
}
