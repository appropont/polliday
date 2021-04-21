import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { PublicationKeys } from "../../types";
import { VotesCollection } from "./votes";

Meteor.publish(PublicationKeys.pollsVotes, (params) => {
  new SimpleSchema({
    pollId: { type: String },
  }).validate(params);

  return VotesCollection.find(
    {
      pollId: { $eq: params.pollId },
    },
    {
      fields: {
        _id: 1,
        pollId: 1,
        selectedOptions: 1,
      },
    }
  );
});

Meteor.publish(PublicationKeys.pollVote, (params) => {
  new SimpleSchema({
    pollId: { type: String },
    voterId: { type: String },
  }).validate(params);

  const { pollId, voterId } = params;

  return VotesCollection.find(
    {
      pollId,
      voterId,
    },
    {
      fields: {
        _id: 1,
        pollId: 1,
        selectedOptions: 1,
      },
    }
  );
});
