import { nanoid } from "nanoid";
import { Meteor } from "meteor/meteor";
import React, { useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";

import { useHistory, useParams } from "react-router-dom";
import { TopicOption } from "../../types";
import * as pollMethods from "/imports/api/polls/methods";
import usePoll from "../hooks/poll";

import userService from "../services/user";
import { _ } from "meteor/underscore";
import { PollConfig } from "/imports/api/polls/polls";
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const Edit = () => {
  const [topic, setTopic] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [topicConfig, setTopicConfig] = useState({} as PollConfig);
  const [newOptionText, setNewOptionText] = useState("");
  const [topicOptions, setTopicOptions] = useState([] as TopicOption[]);
  const history = useHistory();
  const { pollId } = useParams<{ pollId: string }>();
  const userId = userService.getUserId();

  const { poll, isLoading } = usePoll(pollId);

  const newOptionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (poll) {
      setTopic(poll.topic);
      setTopicOptions(poll.options as TopicOption[]);
      setTopicConfig(poll.config as PollConfig);
    }
  }, [poll]);

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
  }, [pollId]);

  const savePollDetails = () => {
    if (topicOptions.length <= 1) {
      console.log("option list is too short to save", topicOptions);
    }
    Meteor.call("polls.update", {
      pollId,
      creatorId: userId,
      topic,
      options: topicOptions.map((option) => option.text),
      config: topicConfig,
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

  function dragEnd(result: any) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      topicOptions,
      result.source.index,
      result.destination.index
    );

    setTopicOptions(items);
  }

  function updateConfigKey<T extends keyof PollConfig>(
    key: T,
    value: PollConfig[T]
  ) {
    setTopicConfig({
      ...topicConfig,
      [key]: value,
    });
  }

  function handleBlur(optionIndex: number) {
    const filteredOptions = topicOptions.filter((option) => option.text !== "");
    setTopicOptions(filteredOptions);
  }

  function handleDelete(optionIndex: number) {
    const newOptions = [...topicOptions];
    newOptions.splice(optionIndex, 1);
    setTopicOptions(newOptions);
  }

  return (
    <>
      {isLoading && (
        <div>
          <h2>Loading...</h2>
        </div>
      )}
      {!isOwner && !isLoading && (
        <div>
          <div className="forbidden-icon">😈</div>
          <h2 className="forbidden-title">You aren't supposed to be here.</h2>
        </div>
      )}
      {isOwner && !isLoading && (
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

          <details className="poll-options">
            <summary>Options</summary>
            <div>
              <ul>
                <li>
                  <label className="checkbox option">
                    <input
                      type="checkbox"
                      checked={topicConfig?.multiSelect ?? false}
                      onChange={(event) =>
                        updateConfigKey(
                          "multiSelect",
                          event.currentTarget.checked
                        )
                      }
                    />
                    <span className="label-text">
                      Multi-select - allow users to select more than one option
                    </span>
                  </label>
                </li>
              </ul>
            </div>
          </details>

          <DragDropContext onDragEnd={dragEnd}>
            <Droppable droppableId="droppable">
              {(
                provided: DroppableProvided,
                droppableSnapshot: DroppableStateSnapshot
              ) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={droppableSnapshot.isDraggingOver ? "dragging" : ""}
                >
                  {topicOptions.map((option, index) => {
                    return (
                      <Draggable
                        key={index}
                        draggableId={option.text}
                        index={index}
                      >
                        {(
                          provided: DraggableProvided,
                          draggableSnapshot: DraggableStateSnapshot
                        ) => (
                          <li
                            className="option draggable"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <input
                              type="text"
                              value={option.text}
                              onChange={(event) => {
                                handleOptionChange(event, option, index);
                              }}
                              onBlur={() => {
                                handleBlur(index);
                              }}
                            />
                            <div className="drag-handle">⠿</div>
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => {
                                handleDelete(index);
                              }}
                            >
                              ❌
                            </button>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  <li className="option">
                    <input
                      type="text"
                      className="muted"
                      ref={newOptionInputRef}
                      placeholder="Add another option..."
                      value={newOptionText}
                      onInput={(event) => {
                        // check for enter and auto add new option field
                        setNewOptionText(event.currentTarget.value);
                      }}
                      onBlur={() => {
                        if (newOptionText && newOptionText !== "") {
                          addNewOption();

                          setTimeout(() => {
                            newOptionInputRef?.current?.focus();
                          }, 10);
                        }
                      }}
                    />
                  </li>
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          <button disabled={topicOptions.length <= 1}>Save</button>
        </form>
      )}
    </>
  );
};
