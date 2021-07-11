import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import userService from "../services/user";
import { VotesCollection } from "/imports/api/votes/votes";
import { PublicationKeys } from "/imports/types";

export default function (pollId: string) {
  const userId = userService.getUserId();

  return useTracker(() => {
    const pollSubscription = Meteor.subscribe(PublicationKeys.pollVote, {
      pollId,
      voterId: userId,
    });

    const vote = VotesCollection.findOne({
      pollId,
      voterId: userId,
    });

    return {
      vote,
      isLoading: !pollSubscription.ready(),
    };
  }, [userId, pollId]);
}
