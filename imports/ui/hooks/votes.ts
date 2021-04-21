import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { VotesCollection } from "/imports/api/votes/votes";
import { PublicationKeys } from "/imports/types";

export default function (pollId: string) {
  return useTracker(() => {
    const votesSubscription = Meteor.subscribe(PublicationKeys.pollsVotes, {
      pollId,
    });

    const votes = VotesCollection.find({
      pollId,
    });

    return {
      votes,
      isLoading: !votesSubscription.ready(),
    };
  }, [pollId]);
}
