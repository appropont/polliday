import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TopicOption } from "/imports/types";
import { _ } from "meteor/underscore";

import usePoll from "../hooks/poll";
import useVotes from "../hooks/votes";

export const Results = () => {
  const { pollId } = useParams<{ pollId: string }>();

  const [aggregatedOptions, setAggregatedOptions] = useState<
    { text: string; total: number }[]
  >([]);

  const { poll, isLoading: pollIsLoading } = usePoll(pollId);

  const { votes, isLoading: votesAreLoading } = useVotes(pollId);

  useEffect(() => {
    console.log({ votes });
    const options = _.pluck(poll?.options as TopicOption[], "text");

    const voteTotals: { [key: string]: number } = {};

    votes.forEach((vote) => {
      vote.selectedOptions.forEach((selectedOption) => {
        if (!voteTotals[selectedOption]) {
          voteTotals[selectedOption] = 1;
        } else {
          voteTotals[selectedOption] += 1;
        }
      });
    });

    const pickedTotals = _.pick(voteTotals, options);

    setAggregatedOptions(
      Object.keys(pickedTotals).map((key) => ({
        text: key,
        total: pickedTotals[key],
      }))
    );
  }, [votes]);

  const isLoading = pollIsLoading || votesAreLoading;

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (
        <div>
          <h1>
            {poll?.topic}
            <span className="actions">
              <Link to={`/${pollId}/vote`} className="button">
                Vote
              </Link>
            </span>
          </h1>

          <div className="status"></div>

          <div className="results">
            {aggregatedOptions.map((option) => {
              return (
                <div>
                  {option.text} {option.total}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
