import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TopicOption } from "/imports/types";
import { _ } from "meteor/underscore";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  VictoryBar,
  VictoryLabel,
  VictoryPie,
  VictoryThemeDefinition,
  VictoryTooltip,
} from "victory";

import usePoll from "../hooks/poll";
import useVotes from "../hooks/votes";
import * as pollMethods from "../../api/polls/methods";
import * as voteMethods from "../../api/votes/methods";
import user from "../services/user";
import { Poll } from "/imports/api/polls/polls";
import { Vote } from "/imports/api/votes/votes";

const colorScale = ["#84DCC6", "#5CD1B4", "#37C3A0", "#2C9B7F", "#21735F"];

const bermudaTheme = {
  pie: {
    colorScale,
  },
} as VictoryThemeDefinition;

const { protocol, hostname, port } = window.location;
let baseUrl = "";

baseUrl += protocol + "//";
baseUrl += hostname;
if (port && port !== "80" && port !== "443") {
  baseUrl += ":" + port;
}

export const Results = () => {
  const userId = user.getUserId();
  const { pollId } = useParams<{ pollId: string }>();

  const [aggregatedOptions, setAggregatedOptions] = useState<
    { text: string; total: number }[]
  >([]);
  const [isOwner, setIsOwner] = useState(false);
  const [vote, setVote] = useState<Vote | undefined>();

  const { poll, isLoading: pollIsLoading } = usePoll(pollId);

  const { votes, isLoading: votesAreLoading } = useVotes(pollId, pollIsLoading);

  useEffect(() => {
    pollMethods.isOwner.call(
      {
        pollId,
        userId,
      },
      (error: any, result: any) => {
        setIsOwner(!!result);
      }
    );

    voteMethods.getPollVote.call(
      {
        voterId: userId,
        pollId,
      },
      (error: any, result: any) => {
        setVote(result);
      }
    );
  }, [pollId]);

  useEffect(() => {
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

    const newAggregatedOptions =
      Object.keys(pickedTotals)?.map((key) => ({
        text: key,
        total: pickedTotals[key],
      })) ?? [];
    console.log({ newAggregatedOptions });
    setAggregatedOptions(newAggregatedOptions);
  }, [votes]);

  function handleVotingStop() {
    pollMethods.closeVoting.call({ pollId, creatorId: userId });
  }

  const isLoading = pollIsLoading || votesAreLoading;

  console.log({ aggregatedOptions, poll });

  const totalVotes = aggregatedOptions.reduce((acc, option, arr) => {
    return acc + option.total;
  }, 0);

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (
        <div>
          <h1>
            {poll?.topic}
            <span className="actions">
              {isOwner && poll?.active !== false && (
                <>
                  <Link to={`/${pollId}/edit`} className="button">
                    Edit
                  </Link>
                  <CopyToClipboard text={`${baseUrl}/${pollId}/vote`}>
                    <button>Copy URL</button>
                  </CopyToClipboard>
                  {JSON.stringify(poll?.active)}
                  <button className="error" onClick={handleVotingStop}>
                    Stop Voting
                  </button>
                </>
              )}

              {!vote && !isOwner && poll?.active !== false && (
                <span>
                  <Link to={`/${pollId}/vote`} className="button warning">
                    Vote
                  </Link>
                </span>
              )}

              {vote && !isOwner && poll?.active !== false && (
                <span>
                  <Link to={`/${pollId}/vote`} className="button">
                    Change Vote
                  </Link>
                </span>
              )}
            </span>
          </h1>

          <div className="status">
            {poll?.active === false && (
              <div className="status-message error">Voting has closed.</div>
            )}

            {aggregatedOptions?.length === 0 && (
              <div className="no-votes-found">
                <h2>There are no votes yet.</h2>
              </div>
            )}

            <div className="results">
              <div className="bar-chart-container">
                {aggregatedOptions.length > 0 && (
                  <VictoryBar
                    animate={{ duration: 2000, easing: "bounce" }}
                    barRatio={1.5}
                    data={
                      aggregatedOptions?.map((option, index) => ({
                        x: index,
                        y: option.total,
                      })) ?? []
                    }
                    height={200}
                    sortKey="total"
                    sortOrder="descending"
                    labels={
                      aggregatedOptions?.map(
                        (option) =>
                          option.text +
                          " " +
                          Math.floor((option.total / totalVotes) * 100) +
                          "%"
                      ) ?? []
                    }
                    style={{
                      labels: { fill: "#2b2d3a" },
                      data: {
                        fill: ({ index }) =>
                          colorScale[(index as number) % colorScale.length] ??
                          colorScale[0],
                      },
                    }}
                    horizontal={true}
                    labelComponent={<VictoryLabel textAnchor="end" dx={-10} />}
                  ></VictoryBar>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function pieChart(aggregatedOptions: any[]) {
  <div className="pie-chart-container">
    <VictoryPie
      animate={{ duration: 2000, easing: "bounce" }}
      cornerRadius={12}
      startAngle={90}
      endAngle={-90}
      data={aggregatedOptions?.map((option: any, index: number) => ({
        x: index,
        y: option.total,
      }))}
      height={300}
      padding={10}
      origin={{ x: 200, y: 200 }}
      labels={aggregatedOptions?.map((option: any) => option.text)}
      labelRadius={42}
      theme={bermudaTheme}
      radius={({ datum }) => 50 + datum.y * 20}
      labelComponent={<VictoryTooltip />}
    />
  </div>;
}
