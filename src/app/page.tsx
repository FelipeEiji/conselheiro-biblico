"use client";
import { useEffect, useReducer, useRef, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ScrollToBottom from "react-scroll-to-bottom";
import SendIcon from "@/components/SendIcon";
import Spinner from "@/components/Spinner";
import { Message } from "@/components/Message";
import VerseCard from "@/components/VerseCard";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase";

interface Message {
  name: "human" | "ai" | "system";
  text: string;
}

interface Verse {
  reference: string;
  text: string;
}

interface AppState {
  messages: Message[] | [];
  assistantThinking: boolean;
  isWriting: boolean;
  controller: AbortController | null;
  verses: Verse[];
}

type AddMessage = {
  type: "addMessage";
  payload: { prompt: string; controller: AbortController };
};
type UpdatePromptAnswer = { type: "updatePromptAnswer"; payload: string };
type UpdateVerses = { type: "updateVerses"; payload: Verse[] };
type ClearMessages = { type: "clearMessages" };
type Abort = { type: "abort" };
type Done = { type: "done" };
type AppActions =
  | AddMessage
  | UpdatePromptAnswer
  | UpdateVerses
  | ClearMessages
  | Abort
  | Done;

function reducer(state: AppState, action: AppActions): AppState {
  switch (action.type) {
    case "addMessage":
      return {
        ...state,
        assistantThinking: true,
        messages: [{ name: "human", text: action.payload.prompt }],
        controller: action.payload.controller,
      };
    case "updatePromptAnswer":
      return {
        ...state,
        messages: [...state.messages, { name: "ai", text: action.payload }],
        assistantThinking: false,
        isWriting: true,
      };
    case "updateVerses":
      return {
        ...state,
        verses: action.payload,
      };
    case "clearMessages":
      return {
        ...state,
        messages: [],
        verses: [],
      };
    case "abort":
      state.controller?.abort();
      return {
        ...state,
        isWriting: false,
        assistantThinking: false,
        controller: null,
      };
    case "done":
      return {
        ...state,
        isWriting: false,
        assistantThinking: false,
        controller: null,
      };
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, {
    messages: [],
    assistantThinking: false,
    isWriting: false,
    controller: null,
    verses: [],
  });

  const promptInput = useRef<HTMLTextAreaElement>(null);

  const handlePrompt = async () => {
    if (promptInput && promptInput.current) {
      const prompt = promptInput.current.value;
      if (prompt !== "") {
        const controller = new AbortController();
        const signal = controller.signal;
        dispatch({ type: "clearMessages" });
        dispatch({ type: "addMessage", payload: { prompt, controller } });
        promptInput.current.value = "";

        const res = await fetch("/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
          signal: signal,
        });
        const data = await res.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        const { advice, verses } = data;

        dispatch({ type: "updatePromptAnswer", payload: advice });
        if (verses && verses.length > 0) {
          dispatch({ type: "updateVerses", payload: verses });
        }

        dispatch({ type: "done" });
      }
    }
  };

  const handlePromptKey = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePrompt();
    }
  };

  const handleAbort = () => {
    dispatch({ type: "abort" });
  };

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    if (promptInput && promptInput.current) {
      promptInput.current.focus();
    }
  }, []);

  return (
    <div className="flex h-full relative flex-1 bg-gray-100 px-3">
      <main className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch max-w-3xl ml-auto mr-auto pb-12 font-default rounded-lg ">
        <div className="flex-1 overflow-hidden">
          <ScrollToBottom
            className="relative h-full pb-14 pt-6 bg-gray-50"
            scrollViewClassName="h-full overflow-y-auto"
          >
            <div className="w-full transition-width flex flex-col items-stretch flex-1">
              <div className="flex-1 ml-3">
                <div className="flex flex-col prose prose-lg px-3">
                  {state.messages.map((message, i) => (
                    <Message
                      key={i}
                      name={message.name}
                      text={message.text}
                      thinking={state.assistantThinking}
                    />
                  ))}
                  {state.verses.map((verse, i) => (
                    <VerseCard
                      key={i}
                      verseReference={verse.reference}
                      verseText={verse.text}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollToBottom>
        </div>
        <div className="absolute bottom-6 w-full px-1">
          {(state.assistantThinking || state.isWriting) && (
            <div className="flex mx-auto justify-center mb-2">
              <button
                type="button"
                className="rounded bg-blue-100 py-1 px-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-200"
                onClick={handleAbort}
              >
                Interromper
              </button>
            </div>
          )}
          <div className="relative flex flex-col w-full p-3 bg-white rounded-md shadow ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
            <label htmlFor="prompt" className="sr-only">
              Prompt
            </label>
            <TextareaAutosize
              ref={promptInput}
              name="prompt"
              id="prompt"
              rows={1}
              maxRows={6}
              onKeyDown={handlePromptKey}
              className="m-0 w-full resize-none border-0 bg-transparent pr-7 focus:ring-0 focus-visible:ring-0 text-gray-900 text-base"
              placeholder="Peça um conselho"
            />
            <div className="absolute right-3 top-[calc(50%_-_10px)]">
              {state.assistantThinking || state.isWriting ? (
                <Spinner cx="animate-spin w-5 h-5 text-gray-400" />
              ) : (
                <SendIcon
                  cx="w-5 h-5 text-gray-400 hover:text-gray-500 hover:cursor-pointer"
                  onClick={handlePrompt}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
