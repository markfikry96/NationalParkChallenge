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
    <Card className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-5 w-full md:w-80 overflow-hidden">
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
      
      <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
        {park.imageUrl ? (
          <img 
            src={park.imageUrl}
            alt={`${park.name} National Park`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null; // Prevent infinite loop
              
              // Try to fix common issues with Wikipedia image URLs
              const originalUrl = park.imageUrl || '';
              let fixedUrl = originalUrl;
              
              // Try to fix special character encoding issues
              if (originalUrl.includes('Haleakal')) {
                fixedUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Haleakala_crater.jpg/1280px-Haleakala_crater.jpg";
              } else if (originalUrl.includes('Kings_Canyon')) {
                fixedUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Kings_Canyon_National_Park_-_Dusy_Basin.jpg/1280px-Kings_Canyon_National_Park_-_Dusy_Basin.jpg";
              }
              
              // If we have a fixed URL that's different from the original, try that first
              if (fixedUrl !== originalUrl) {
                target.src = fixedUrl;
              } else {
                // Otherwise fall back to Unsplash
                target.src = `https://source.unsplash.com/800x400/?national,park,${encodeURIComponent(park.name.replace(/ā/g, 'a').replace(/ô/g, 'o'))}`;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className={`text-4xl ${colorClasses[color].icon}`}>
              <ParkIcon type={park.iconType} />
            </div>
          </div>
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
    <Card className="bg-white rounded-xl shadow-card p-5 w-full md:w-80 overflow-hidden">
      <div className="flex items-start gap-2 mb-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Image skeleton */}
      <Skeleton className="h-40 w-full rounded-lg mb-4" />
      
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <Skeleton className="h-10 w-full rounded-lg" />
    </Card>
  );
}
