import { useQuery, useMutation } from "@tanstack/react-query";
import { CurrentMatchup, Park, ParkWithRank, Vote } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useRankedParks() {
  return useQuery<ParkWithRank[]>({
    queryKey: ["/api/parks/ranked"],
  });
}

export function useCurrentMatchup() {
  // Use state to store the current matchup
  const [isSkipping, setIsSkipping] = useState(false);
  const { toast } = useToast();

  // Query for the current matchup
  const matchupQuery = useQuery<CurrentMatchup>({
    queryKey: ["/api/matchups/random"],
  });

  // Mutation for voting on a matchup
  const voteMutation = useMutation({
    mutationFn: async (vote: Vote) => {
      const res = await apiRequest("POST", "/api/matchups/vote", vote);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate the rankings query to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/parks/ranked"] });
      // Get a new matchup after voting
      queryClient.invalidateQueries({ queryKey: ["/api/matchups/random"] });
      
      // Show success toast
      toast({
        title: "Vote recorded!",
        description: "Thanks for your vote. New matchup has been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error voting",
        description: error instanceof Error ? error.message : "Failed to record vote",
        variant: "destructive",
      });
    },
  });

  // Function to vote for a park
  const voteForPark = (parkId: number) => {
    if (!matchupQuery.data) return;
    
    voteMutation.mutate({
      winnerId: parkId,
      matchupId: matchupQuery.data.id,
    });
  };

  // Function to skip the current matchup
  const skipMatchup = () => {
    setIsSkipping(true);
    queryClient.invalidateQueries({ queryKey: ["/api/matchups/random"] });
    
    // Reset skipping state after a delay
    setTimeout(() => {
      setIsSkipping(false);
    }, 500);
  };

  return {
    currentMatchup: matchupQuery.data,
    isLoading: matchupQuery.isLoading,
    isVoting: voteMutation.isPending,
    isSkipping,
    voteForPark,
    skipMatchup,
  };
}
