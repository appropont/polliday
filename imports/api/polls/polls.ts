import { Mongo } from "meteor/mongo";
import { TopicOption } from "../../types";

export interface Poll {
  _id?: string;
  creatorId: string;
  topic: string;
  options: string[] | TopicOption[];
  createdAt: Date;
}

export const PollsCollection = new Mongo.Collection<Poll>("polls");

PollsCollection.deny({
  update: () => true,
  insert: () => true,
  remove: () => true,
});
