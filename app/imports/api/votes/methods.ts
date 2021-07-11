import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import { _ } from "meteor/underscore";

import { VotesCollection } from "./votes";
import { PollsCollection } from "../polls/polls";

export const getPollVote = new ValidatedMethod({
  name: "votes.getPollVote",
  validate: new SimpleSchema({
    voterId: {
      type: String,
    },
    pollId: {
      type: String,
    },
  }).validator(),
  run({ voterId, pollId }: any) {
    return VotesCollection.findOne({
      pollId,
      voterId,
    });
  },
});

export const upsert = new ValidatedMethod({
  name: "votes.upsert",
  validate: new SimpleSchema({
    voterId: {
      type: String,
    },
    pollId: {
      type: String,
    },
    selectedOptions: {
      type: Array,
    },
    ["selectedOptions.$"]: {
      type: String,
    },
  }).validator(),
  run({ voterId, pollId, selectedOptions }: any) {
    const vote = VotesCollection.findOne({ voterId });
    const poll = PollsCollection.findOne({ _id: pollId });

    if (poll?.active === false) {
      return { error: "Poll is no longer active" };
    }

    if (vote) {
      return VotesCollection.update(
        { _id: vote._id },
        {
          voterId,
          pollId,
          selectedOptions,
          createdAt: vote.createdAt,
        }
      );
    } else {
      return VotesCollection.insert({
        voterId,
        pollId,
        selectedOptions,
        createdAt: new Date(),
      });
    }
  },
});

// Get list of all method names on Lists
const LISTS_METHODS = _.pluck([upsert, getPollVote], "name");

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000
  );
}
