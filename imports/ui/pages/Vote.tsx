import { nanoid } from "nanoid";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { _ } from "meteor/underscore";

import usePoll from "../hooks/poll";
import useVote from "../hooks/vote";
import { TopicOption } from "/imports/types";
import * as voteMethods from "/imports/api/votes/methods";
import userService from "/imports/ui/services/user";

export const Vote = () => {
  const userId = userService.getUserId();
  const { pollId } = useParams<{ pollId: string }>();
  const { poll, isLoading: pollIsLoading } = usePoll(pollId);
  // const { vote, isLoading: voteIsLoading } = useVote(pollId);
  const [vote, setVote] = useState({} as any);
  console.log({ vote });
  const [currentVote, setCurrentVote] = useState<string[]>([]);

  useEffect(() => {
    // setVote();
    voteMethods.getPollVote.call(
      { voterId: userId, pollId },
      (error: any, result: any) => {
        console.log({ result });
        setVote(result);
        setCurrentVote(result.selectedOptions);
      }
    );
  }, []);

  const history = useHistory();

  const castVote = (event: any) => {
    event.preventDefault();

    voteMethods.upsert.call({
      pollId,
      selectedOptions: currentVote,
      voterId: userId,
    });

    history.push(`/${pollId}/results`);
  };

  const handleSelectionChange = (optionValue: string) => {
    if ((poll as any).multiSelect == true) {
      // TODO
    } else {
      setCurrentVote([optionValue]);
    }
    // console.log({ event });
  };

  console.log("selected", currentVote[0]);

  return (
    <form onSubmit={castVote}>
      <label className="h1">{poll?.topic}</label>

      {(poll?.options as TopicOption[]).map((option: TopicOption) => (
        <div key={option.text}>
          <label>
            <input
              className="sr-only"
              onChange={(event) => {
                handleSelectionChange(option.text);
              }}
              type="radio"
              name="vote-selection"
              value={option.text}
              checked={option.text === currentVote[0]}
            />
            <div className="input list-option">{option.text}</div>
          </label>
        </div>
      ))}
      <div>
        <button>Vote</button>
      </div>
    </form>
  );
};
