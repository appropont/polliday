import { Mongo } from "meteor/mongo";
import { TopicOption } from "../../types";

export interface Vote {
  _id?: string;
  pollId: string;
  voterId: string;
  createdAt: Date;
  selectedOptions: string[];
}

export const VotesCollection = new Mongo.Collection<Vote>("votes");

VotesCollection.deny({
  update: () => true,
  insert: () => true,
  remove: () => true,
});
