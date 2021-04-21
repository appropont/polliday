import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import { _ } from "meteor/underscore";

import { PollsCollection } from "./polls";

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
  run({ topic, creatorId }: any) {
    return PollsCollection.insert({
      topic,
      creatorId,
      options: [],
      createdAt: new Date(),
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
  }).validator(),
  run({ topic, creatorId, pollId, options }: any) {
    // permissions check needed
    // if(creatorId !== ) {

    // }

    return PollsCollection.update(
      { _id: { $eq: pollId } },
      {
        topic,
        creatorId,
        options,
        createdAt: new Date(),
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

// Get list of all method names on Lists
const LISTS_METHODS = _.pluck([insert, update, getByMongoId], "name");

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
