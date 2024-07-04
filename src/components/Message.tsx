"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiUser, FiBook } from "react-icons/fi"; // Importando os ícones

interface MessageProps {
  name: "human" | "ai" | "system";
  text: string;
  thinking: boolean;
}

function HumanMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <div className="text-gray-600">
        <FiUser className="h-10 w-10 mr-2" />
      </div>
      <div className="bg-gray-200 py-2 px-4 w-full rounded-md min-h-[60px] flex items-center text-gray-800">
        {text}
      </div>
    </div>
  );
}

function AIMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <div className="text-gray-600">
        <FiBook className="h-10 w-10 mr-2" />
      </div>
      <div className="bg-gray-100 px-4 py-2 w-full rounded-md min-h-[60px] flex items-center text-gray-800">
        <ReactMarkdown linkTarget="_blank" remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export function Message({ name, text, thinking }: MessageProps) {
  return (
    <div className="w-full min-h-[60px] text-gray-900 rounded-md text-sm font-mono mb-4">
      {name === "ai" ? <AIMessage text={text} /> : <HumanMessage text={text} />}
    </div>
  );
}
