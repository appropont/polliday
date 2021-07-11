import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { PublicationKeys } from "../../types";
import { PollsCollection } from "./polls";

Meteor.publish(PublicationKeys.poll, (params) => {
  new SimpleSchema({
    pollId: { type: String },
  }).validate(params);

  return PollsCollection.find(
    {
      _id: { $eq: params.pollId },
    },
    {
      fields: {
        _id: 1,
        topic: 1,
        options: 1,
        config: 1,
        active: 1,
      },
    }
  );
});
