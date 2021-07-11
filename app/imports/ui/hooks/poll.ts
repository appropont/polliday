import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PollsCollection } from "/imports/api/polls/polls";
import { PublicationKeys, TopicOption } from "/imports/types";

export default function (pollId: string) {
  return useTracker(() => {
    const pollSubscription = Meteor.subscribe(PublicationKeys.poll, {
      pollId,
    });

    const poll = PollsCollection.findOne({
      _id: pollId,
    });

    if (poll) {
      poll.options = (poll.options as string[]).map((option: string) => ({
        text: option,
      })) as TopicOption[];
    }

    return {
      poll,
      isLoading: !pollSubscription.ready(),
    };
  }, [pollId]);
}
