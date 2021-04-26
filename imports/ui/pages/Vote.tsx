import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { _ } from "meteor/underscore";

import usePoll from "../hooks/poll";
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
    if ((poll as any)?.config?.multiSelect == true) {
      const index = currentVote.indexOf(optionValue);

      if (index > -1) {
        console.log({ currentVote, optionValue });
        setCurrentVote(
          currentVote.filter((selection) => selection !== optionValue)
        );
      } else {
        setCurrentVote([...currentVote, optionValue]);
      }
    } else {
      setCurrentVote([optionValue]);
    }
    // console.log({ event });
  };

  return (
    <form onSubmit={castVote}>
      <label className="h1">{poll?.topic}</label>

      <div className="status">
        {poll?.active === false && (
          <div className="status-message error">
            Voting has closed. Check out the{" "}
            <Link to={`/${poll._id}/results`}>results</Link>
          </div>
        )}
      </div>
      {poll?.active !== false &&
        (poll?.options as TopicOption[]).map((option: TopicOption) => {
          if (poll?.config?.multiSelect) {
            return (
              <div key={option.text}>
                <label>
                  <input
                    className="sr-only"
                    onChange={(event) => {
                      console.log("foo", event);
                      handleSelectionChange(option.text);
                    }}
                    type="checkbox"
                    value={option.text}
                    checked={currentVote.indexOf(option.text) > -1}
                  />
                  <div className="input list-option">{option.text}</div>
                </label>
              </div>
            );
          } else {
            return (
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
            );
          }
        })}
      {poll?.active !== false && (
        <div>
          <button>Vote</button>
        </div>
      )}
    </form>
  );
};
