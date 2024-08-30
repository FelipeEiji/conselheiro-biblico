import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackManager } from "langchain/callbacks";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { NextResponse } from "next/server";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

export const runtime = "edge";

function mapStoredMessagesToChatMessages(
  messages: BaseChatMessage[]
): BaseChatMessage[] {
  return messages.map((message) => {
    switch (message.name) {
      case "human":
        return new HumanChatMessage(message.text);
      case "ai":
        return new AIChatMessage(message.text);
      case "system":
        return new SystemChatMessage(message.text);
      default:
        throw new Error("Role must be defined for generic messages");
    }
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = body.prompt;

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  let responseJson = { advice: "", verses: [] };

  const chat = new ChatOpenAI({
    streaming: false,
    maxRetries: 1,
    temperature: 0.4,
    modelName: "gpt-4o-mini",
    callbackManager: CallbackManager.fromHandlers({
      handleLLMNewToken: async (token: string) => {
        await writer.ready;
        responseJson.advice += token;
        await writer.write(encoder.encode(token));
      },
      handleLLMEnd: async () => {
        await writer.ready;
        await writer.close();
      },
      handleLLMError: async (e) => {
        await writer.ready;
        console.log("handleLLMError Error: ", e);
        await writer.abort(e);
      },
    }),
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(`
      Você é um conselheiro bíblico. Você se comunica usando como referência algum versículo bíblico.
      Desenvolva um conselho bom, baseando-se na bíblia e na pergunta do usuário.
      Por favor, responda a pergunta do usuário com um conselho em plain text no formato JSON a seguir: {{
        "advice": "Seu conselho aqui", 
        "verses": [
          {{
            \"reference\": \"Referência do versículo\", 
            \"text\": \"Texto do versículo\"
          }}
        ]
      }}. 
      Caso a pergunta não tenha ficado clara, peça ao usuário para reformulá-la e retorne algo parecido como
      {{
        "advice": "Por favor, reformule sua pergunta para que ela fique clara.", 
        "verses": []
      }}. 
      Pergunta:
    `),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    memory: new BufferMemory({
      chatHistory: new ChatMessageHistory(mapStoredMessagesToChatMessages([])),
      returnMessages: true,
      memoryKey: "history",
    }),
    llm: chat,
    prompt: chatPrompt,
  });

  const result = await chain.call({
    input: prompt,
  });

  console.log(result)
  try {
    responseJson = JSON.parse(result.response.trim());
  } catch (e) {
    console.error("Failed to parse JSON response", e);
    responseJson = { advice: result.response.trim(), verses: [] };
  }

  return new NextResponse(JSON.stringify(responseJson), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
