import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import { _ } from "meteor/underscore";

import { PollsCollection } from "./polls";

const configSchema = new SimpleSchema({
  multiSelect: Boolean,
});

export const insert = new ValidatedMethod({
  name: "polls.insert",
  validate: new SimpleSchema({
    topic: {
      type: String,
    },
    creatorId: {
      type: String,
    },
  }).validator(),
  run({ topic, creatorId, config }: any) {
    return PollsCollection.insert({
      topic,
      creatorId,
      options: [],
      createdAt: new Date(),
      config: { multiSelect: false },
    });
  },
});

export const update = new ValidatedMethod({
  name: "polls.update",
  validate: new SimpleSchema({
    pollId: {
      type: String,
    },
    creatorId: {
      type: String,
    },
    topic: {
      type: String,
    },
    options: {
      type: Array,
    },
    ["options.$"]: {
      type: String,
    },
    config: configSchema,
  }).validator(),
  run({ topic, creatorId, pollId, options, config }: any) {
    const poll = PollsCollection.findOne({ _id: pollId });

    if (!poll) {
      return;
    }

    // permissions check needed
    if (creatorId !== poll.creatorId) {
      return;
    }

    return PollsCollection.update(
      { _id: { $eq: pollId } },
      {
        topic,
        creatorId,
        options,
        createdAt: new Date(),
        config,
      }
    );
  },
});

export const getByMongoId = new ValidatedMethod({
  name: "polls.getByMongoId",
  validate: new SimpleSchema({
    pollId: {
      type: String,
    },
  }).validator(),
  run({ pollId }: any) {
    console.log({ pollId });

    const poll = PollsCollection.findOne(pollId);

    if (poll) {
      return _.pick(poll, ["options", "topic", "createdAt"]);
    } else {
      return null;
    }
  },
});

export const isOwner = new ValidatedMethod({
  name: "polls.isOwner",
  validate: new SimpleSchema({
    pollId: {
      type: String,
    },
    userId: {
      type: String,
    },
  }).validator(),
  run({ userId, pollId }: any) {
    const poll = PollsCollection.findOne({
      _id: pollId,
    });

    if (poll?.creatorId === userId) {
      return true;
    } else {
      return false;
    }
  },
});

export const closeVoting = new ValidatedMethod({
  name: "polls.closeVoting",
  validate: new SimpleSchema({
    pollId: {
      type: String,
    },
    creatorId: {
      type: String,
    },
  }).validator(),
  run({ creatorId, pollId }: any) {
    const poll = PollsCollection.findOne({ _id: pollId });

    if (!poll) {
      return;
    }

    // permissions check needed
    if (creatorId !== poll.creatorId) {
      return;
    }

    return PollsCollection.update(
      { _id: { $eq: pollId } },
      {
        ...poll,
        active: false,
      }
    );
  },
});

// Get list of all method names on Lists
const LISTS_METHODS = _.pluck(
  [insert, update, getByMongoId, isOwner, closeVoting],
  "name"
);

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
