// components/layout/chatbot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Tôi là GoPark AI Assistant. Tôi có thể giúp gì cho bạn về dịch vụ đỗ xe? 🚗",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme ?? theme;

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    // slight delay to ensure scroll container updated
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Setup SpeechRecognition when component mounts (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "vi-VN";

    rec.onresult = (event: any) => {
      let interim = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interim += transcript;
      }
      // show interim + final in input
      setInputText((prev) => {
        // if there's a final transcript, replace or append
        if (finalTranscript) return (prev ? prev + " " : "") + finalTranscript.trim();
        return (prev ? prev : "") + interim;
      });
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      recognitionRef.current = null;
    };
  }, []);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Thêm tin nhắn người dùng
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Call backend Gemini proxy
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
    try {
      const resp = await fetch(`${backendBase}/gemini/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.text, maxOutputTokens: 512, temperature: 0.2 }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Backend error: ${resp.status} ${t}`);
      }

      const data = await resp.json();
      const botText = data?.text ?? data?.message ?? JSON.stringify(data);

      const botResponse: Message = {
        id: Date.now(),
        text: typeof botText === "string" ? botText : JSON.stringify(botText),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error("Chatbot error", err);
      const botResponse: Message = {
        id: Date.now(),
        text: "Xin lỗi, hiện tại không thể kết nối tới dịch vụ trợ lý. Vui lòng thử lại sau.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Hàm trả lời liên quan đến đỗ xe
  const getBotResponse = (message: string) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes("xin chào") || lowerMsg.includes("hello") || lowerMsg.includes("chào")) {
      return "Chào bạn! Rất vui được hỗ trợ bạn. Bạn cần tìm bãi đỗ xe hay cần thông tin gì về GoPark? 🚗";
    }
    
    if (lowerMsg.includes("giá") || lowerMsg.includes("bao nhiêu")) {
      return "Giá đỗ xe tại GoPark: 15.000đ/giờ cho xe máy, 25.000đ/giờ cho ô tô. Đặt trước qua app được giảm 10% nhé! 🎉";
    }
    
    if (lowerMsg.includes("bãi") || lowerMsg.includes("chỗ")) {
      return "GoPark có hơn 50 bãi đỗ xe trên toàn thành phố. Bạn có thể xem bản đồ trong app để tìm bãi gần nhất! 📍";
    }
    
    if (lowerMsg.includes("đặt") || lowerMsg.includes("book")) {
      return "Để đặt chỗ, bạn vào mục 'Đặt chỗ' trên app, chọn bãi xe, thời gian và xác nhận thanh toán. Rất nhanh chóng! ✅";
    }
    
    if (lowerMsg.includes("cảm ơn")) {
      return "Không có gì! Cảm ơn bạn đã sử dụng GoPark. Nếu cần hỗ trợ thêm, hãy gọi hotline 1900.xxxx nhé! 💚";
    }
    
    return "Cảm ơn bạn đã quan tâm! GoPark hỗ trợ đặt chỗ đỗ xe, tra cứu bãi xe trống, và thanh toán trực tuyến. Bạn cần tìm hiểu thêm về dịch vụ nào ạ? 🚗💚";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // stop listening when sending via keyboard
      if (isListening) {
        try {
          recognitionRef.current?.stop();
        } catch (e) {}
        setIsListening(false);
      }
      handleSendMessage();
    }
  };

  // Voice control
  const startListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.start();
      setIsListening(true);
    } catch (e) {
      // some browsers throw if start called twice
      console.error("SpeechRecognition start error", e);
    }
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch (e) {
      console.error("SpeechRecognition stop error", e);
    }
    setIsListening(false);
  };

  // Format thời gian
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Nút chatbot hình tròn */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-green-500 hover:bg-green-600 text-white",
            isOpen && "rotate-90"
          )}
        >
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </Button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50 w-[380px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200",
            currentTheme === "dark"
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-gray-200"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "bg-gradient-to-r text-white px-4 py-3 flex justify-between items-center",
              currentTheme === "dark"
                ? "from-green-600 to-green-700"
                : "from-green-500 to-green-600"
            )}
          >
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <span className="font-semibold">GoPark AI Assistant</span>
                <p className="text-[10px] text-green-100">Online • Hỗ trợ 24/7</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-green-600 h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Messages area */}
          <ScrollArea
            className={cn(
              // ensure the scroll area can shrink inside the flex column
              "flex-1 min-h-0",
              currentTheme === "dark" ? "bg-slate-800" : "bg-gray-50"
            )}
          >
            {/* inner content gets padding so ScrollArea viewport can handle overflow */}
            <div className="px-4 py-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === "bot" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                        <Bot size={14} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2",
                      message.sender === "user"
                        ? "bg-green-500 text-white rounded-br-none"
                        : currentTheme === "dark"
                        ? "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-sm"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm"
                    )}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        message.sender === "user"
                          ? "text-green-100"
                          : currentTheme === "dark"
                          ? "text-slate-400"
                          : "text-gray-400"
                      )}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-500 text-white text-xs">
                        Me
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <Bot size={14} />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-2xl rounded-bl-none px-4 py-2 shadow-sm",
                      currentTheme === "dark"
                        ? "bg-slate-800 border border-slate-700"
                        : "bg-white border border-gray-200"
                    )}
                  >
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div
            className={cn(
              "border-t p-3",
              currentTheme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white"
            )}
          >
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className={cn(
                  "flex-1 focus:border-green-400 focus:ring-green-400",
                  currentTheme === "dark"
                    ? "bg-slate-800 text-slate-100 placeholder:text-slate-400 border-slate-700"
                    : "bg-white text-gray-900 border-gray-200"
                )}
              />
              <div className="flex gap-2 items-center">
                {/* Microphone button */}
                <Button
                  onClick={() => {
                    if (isListening) stopListening();
                    else startListening();
                  }}
                  variant={isListening ? "ghost" : undefined}
                  size="icon"
                  className={cn(isListening ? "bg-red-500 text-white" : "bg-gray-100")}
                  aria-pressed={isListening}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  size="icon"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
            <p className={cn("text-[10px] text-center mt-2", currentTheme === "dark" ? "text-slate-400" : "text-gray-400")}>
              Nhấn Enter để gửi • GoPark AI luôn sẵn sàng hỗ trợ 💚
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;