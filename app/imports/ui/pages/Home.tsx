import { nanoid } from "nanoid";
import React, { ChangeEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import userService from "../services/user";
import * as pollMethods from "/imports/api/polls/methods";

export const Home = () => {
  const [topic, setTopic] = useState("");
  const history = useHistory();
  const userId = userService.getUserId();

  const createPoll = (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    const pollId = pollMethods.insert.call({
      topic,
      creatorId: userId,
    });

    history.push(`/${pollId}/edit`);
  };

  return (
    <form onSubmit={createPoll}>
      <label>
        <span className="sr-only">Topic or Question</span>
        <input
          type="text"
          className="topic"
          placeholder="Topic or Question"
          value={topic}
          onChange={(event) => {
            setTopic(event.currentTarget.value);
          }}
        />
      </label>
      <div>
        <button>Create poll</button>
      </div>
    </form>
  );
};
