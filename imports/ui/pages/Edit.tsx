import { nanoid } from "nanoid";
import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { TopicOption } from "../../types";
import * as pollMethods from "/imports/api/polls/methods";
import usePoll from "../hooks/poll";

import userService from "../services/user";

export const Edit = () => {
  const [topic, setTopic] = useState("");
  const [newOptionText, setNewOptionText] = useState("");
  const [topicOptions, setTopicOptions] = useState([] as TopicOption[]);
  const history = useHistory();
  const { pollId } = useParams<{ pollId: string }>();
  const userId = userService.getUserId();

  const { poll } = usePoll(pollId);

  useEffect(() => {
    if (poll) {
      setTopic(poll.topic);
      setTopicOptions(poll.options as TopicOption[]);
    }
  }, [poll]);

  const savePollDetails = () => {
    Meteor.call("polls.update", {
      pollId,
      creatorId: userId,
      topic,
      options: topicOptions.map((option) => option.text),
    });
    history.push(`/${pollId}/results`);
  };

  const handleOptionChange = (
    event: any,
    option: TopicOption,
    index: number
  ) => {
    const options = [...topicOptions];

    options[index] = {
      ...option,
      text: event.currentTarget.value,
    };

    setTopicOptions(options);
  };

  const addNewOption = () => {
    setTopicOptions([
      ...topicOptions,
      {
        text: newOptionText,
      },
    ]);

    setNewOptionText("");
  };

  return (
    <form onSubmit={savePollDetails}>
      <label>
        <span className="sr-only">Topic or Question</span>
        <input
          type="text"
          className="topic"
          value={topic}
          onInput={(event) => {
            setTopic(event.currentTarget.value);
          }}
        />
      </label>
      <ul>
        {topicOptions.map((option, index) => {
          return (
            <li className="option">
              <input
                type="text"
                value={option.text}
                onChange={(event) => {
                  handleOptionChange(event, option, index);
                }}
              />
            </li>
          );
        })}
        <li className="option">
          <input
            type="text"
            className="muted"
            placeholder="Add another option..."
            value={newOptionText}
            onInput={(event) => {
              // check for enter and auto add new option field
              setNewOptionText(event.currentTarget.value);
            }}
            onBlur={() => {
              if (newOptionText && newOptionText !== "") {
                addNewOption();
              }
            }}
          />
        </li>
      </ul>

      <button>Save</button>
    </form>
  );
};
