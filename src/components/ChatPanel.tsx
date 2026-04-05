import { useState, useRef, useEffect } from "react";
import { Button, Input, Typography, Spin } from "antd";
import { SendOutlined, CompassOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import useWebSocket from "../hooks/useWebSocket";
import useAppStore from "../store/useAppStore";
import MessageBubble from "./MessageBubble";

const { Title, Text } = Typography;
const { TextArea } = Input;

const SUGGESTIONS = [
  "Plan a route from Koramangala to Whitefield",
  "Plan a route from Koramangala to Whitefield via a fuel station",
  "If I leave MG Road at 9 AM when will I reach Hebbal?",
];

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const clearMessages = useAppStore((state) => state.clearMessages);
  const setSendMessage = useAppStore((state) => state.setSendMessage);
  const { sendMessage } = useWebSocket();

  // Register sendMessage in store once on mount
  useEffect(() => {
    setSendMessage(sendMessage);
  }, [sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading =
    messages.length > 0 && messages[messages.length - 1]?.type === "user";

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    addMessage({ type: "user", text: input });
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/clear-session`);
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
    clearMessages();
    useAppStore.getState().setMapData(null);
    useAppStore.getState().setStops([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CompassOutlined className="text-violet-400 text-xl" />
            <Title level={5} style={{ color: "white", margin: 0 }}>
              Smart Route Planner
            </Title>
          </div>
          <Text style={{ color: "#8892a4", fontSize: "12px" }}>
            AI-powered route planning
          </Text>
        </div>

        {/* Clear button */}
        <Button
          icon={<DeleteOutlined />}
          onClick={handleClear}
          size="small"
          style={{
            background: "transparent",
            borderColor: "#374151",
            color: "#8892a4",
            borderRadius: "8px",
          }}
        >
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-3">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <CompassOutlined
              style={{
                fontSize: "48px",
                color: "#6c63ff",
                marginBottom: "16px",
              }}
            />
            <Title level={5} style={{ color: "white", margin: "0 0 8px" }}>
              Plan your route with AI
            </Title>
            <Text style={{ color: "#6b7280", fontSize: "13px" }}>
              Ask me about routes, stops, or ETAs
            </Text>

            {/* Suggestions */}
            <div className="mt-6 flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-xs text-gray-400 bg-gray-800
                  hover:bg-gray-700 border border-gray-700 rounded-xl px-4
                  py-3 transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages list */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex justify-start mb-3 px-1">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <Spin size="small" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-700 flex gap-3 items-end">
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about routes, stops, ETA..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{
            background: "#1f2937",
            borderColor: "#374151",
            color: "white",
            borderRadius: "12px",
            fontSize: "14px",
            flex: 1,
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            background: isLoading || !input.trim() ? "#374151" : "#7c3aed",
            border: "none",
            borderRadius: "12px",
            height: "42px",
            width: "42px",
          }}
        />
      </div>

    </div>
  );
}