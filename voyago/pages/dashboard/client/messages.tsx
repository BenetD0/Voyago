import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/layout/Sidebar";
import { usePollingResource } from "@/architecture";
import { Check, CheckCheck, Loader, Send, SmilePlus } from "lucide-react";

type FriendItem = {
  _id: string;
  status: "pending" | "accepted";
  incoming: boolean;
  friend: {
    email: string;
    name: string;
    avatarColor: string;
  };
};

type Conversation = {
  conversationKey: string;
  participants: string[];
  messages: {
    messageId: string;
    senderEmail: string;
    senderName: string;
    text: string;
    deliveredTo: string[];
    seenBy: string[];
    reactions: {
      emoji: string;
      users: string[];
    }[];
    createdAt: string;
  }[];
};

const quickReactions = ["❤️", "🔥", "😂", "👏"];

export default function MessagesPage() {
  const router = useRouter();
  const friendFromQuery = typeof router.query.friend === "string" ? router.query.friend : "";
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [selectedFriend, setSelectedFriend] = useState(friendFromQuery);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/friends")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch friends");
        }
        return data;
      })
      .then((data) => setFriends(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch friends");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (friendFromQuery) {
      setSelectedFriend(friendFromQuery);
    }
  }, [friendFromQuery]);

  const loadConversation = useCallback(async () => {
    if (!selectedFriend) return;

    try {
      const res = await fetch(`/api/messages?friendEmail=${encodeURIComponent(selectedFriend)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch conversation");
      }
      setConversation(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to fetch conversation");
    }
  }, [selectedFriend]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  usePollingResource(loadConversation, { enabled: Boolean(selectedFriend), intervalMs: 3000 });

  useEffect(() => {
    if (!selectedFriend) return;

    const timeoutId = window.setTimeout(() => {
      fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail: selectedFriend, action: "seen" }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok) {
            throw new Error(data?.message || "Failed to mark conversation as seen");
          }
          setConversation(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [selectedFriend, conversation?.messages?.length]);

  const acceptedFriends = useMemo(() => friends.filter((item) => item.status === "accepted"), [friends]);
  const incomingRequests = useMemo(() => friends.filter((item) => item.status === "pending" && item.incoming), [friends]);

  async function acceptRequest(friendshipId: string) {
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to accept friend request");
      }
      setFriends((prev) => prev.map((item) => (item._id === friendshipId ? { ...item, status: "accepted", incoming: false } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept friend request");
    }
  }

  async function sendMessage() {
    if (!selectedFriend || !text.trim()) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail: selectedFriend, text }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send message");
      }
      setConversation(data);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function toggleReaction(messageId: string, emoji: string) {
    if (!selectedFriend) return;

    try {
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail: selectedFriend, action: "react", messageId, emoji }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to react to message");
      }
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to react to message");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_28%),linear-gradient(180deg,#FAF3E0_0%,#FFFDF7_100%)]">
      <div className="flex min-h-screen">
        <Sidebar role="user" />
        <main className="flex flex-1 gap-6 p-8">
          <aside className="w-full max-w-sm rounded-[2rem] border border-[#7C5E3C]/10 bg-white/85 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-[#14532D]">Private Messages</h1>
            <p className="mt-1 text-sm text-[#7C5E3C]">Professional chat with delivery, seen states, and quick reactions.</p>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            {incomingRequests.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7C5E3C]">Friend Requests</p>
                <div className="space-y-3">
                  {incomingRequests.map((item) => (
                    <div key={item._id} className="rounded-3xl border border-[#7C5E3C]/10 bg-[#FAF3E0]/50 p-4">
                      <p className="font-medium text-[#14532D]">{item.friend.name}</p>
                      <p className="text-sm text-[#7C5E3C]">{item.friend.email}</p>
                      <button onClick={() => acceptRequest(item._id)} className="mt-3 rounded-full bg-[#22C55E] px-4 py-2 text-sm text-white">
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              {loading ? (
                <Loader className="h-5 w-5 animate-spin text-[#22C55E]" />
              ) : acceptedFriends.length === 0 ? (
                <p className="text-sm text-[#7C5E3C]">No accepted friends yet. Add friends from a trip dashboard first.</p>
              ) : (
                acceptedFriends.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedFriend(item.friend.email)}
                    className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${
                      selectedFriend === item.friend.email ? "bg-[#14532D] text-white shadow-lg" : "bg-[#FAF3E0]/40 text-[#14532D] hover:bg-[#FAF3E0]/70"
                    }`}
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: item.friend.avatarColor }}>
                      {item.friend.name.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <span className="block font-medium">{item.friend.name}</span>
                      <span className={`block text-xs ${selectedFriend === item.friend.email ? "text-white/80" : "text-[#7C5E3C]"}`}>{item.friend.email}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="flex-1 rounded-[2rem] border border-[#7C5E3C]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
            {!selectedFriend ? (
              <div className="flex h-full items-center justify-center text-center text-[#7C5E3C]">Select a friend to start chatting.</div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#7C5E3C]/10 pb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#14532D]">{acceptedFriends.find((item) => item.friend.email === selectedFriend)?.friend.name || selectedFriend}</h2>
                    <p className="text-sm text-[#7C5E3C]">{selectedFriend}</p>
                  </div>
                  <div className="rounded-full bg-[#FAF3E0] px-3 py-1 text-xs font-medium text-[#14532D]">Encrypted vibe</div>
                </div>

                <div className="mt-4 flex h-[540px] flex-col justify-between">
                  <div className="space-y-4 overflow-y-auto pr-2">
                    {conversation?.messages?.length ? (
                      conversation.messages.map((message) => {
                        const isMine = message.senderEmail !== selectedFriend;
                        const delivered = message.deliveredTo.includes(selectedFriend);
                        const seen = message.seenBy.includes(selectedFriend);

                        return (
                          <div key={message.messageId} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[78%] rounded-[1.5rem] px-4 py-3 text-sm shadow-sm ${isMine ? "bg-[#14532D] text-white" : "bg-[#FAF3E0] text-[#14532D]"}`}>
                              <p>{message.text}</p>

                              {message.reactions.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {message.reactions.map((reaction) => (
                                    <span key={`${message.messageId}-${reaction.emoji}`} className={`rounded-full px-2 py-1 text-xs ${isMine ? "bg-white/10 text-white" : "bg-white text-[#14532D]"}`}>
                                      {reaction.emoji} {reaction.users.length}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex flex-wrap gap-2">
                                  {quickReactions.map((emoji) => (
                                    <button
                                      key={`${message.messageId}-${emoji}`}
                                      onClick={() => toggleReaction(message.messageId, emoji)}
                                      className={`rounded-full px-2 py-1 text-xs transition ${isMine ? "bg-white/10 hover:bg-white/20" : "bg-white hover:bg-[#22C55E]/10"}`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>

                                <div className="text-right">
                                  <p className={`text-[11px] ${isMine ? "text-white/80" : "text-[#7C5E3C]"}`}>{new Date(message.createdAt).toLocaleString("en-GB")}</p>
                                  {isMine && (
                                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/80">
                                      {seen ? <CheckCheck className="h-3.5 w-3.5 text-[#86EFAC]" /> : delivered ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                                      {seen ? "Seen" : delivered ? "Delivered" : "Sent"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-[#7C5E3C]">No messages yet.</p>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3 rounded-[1.75rem] border border-[#7C5E3C]/10 bg-[#FAF3E0]/45 p-3">
                    <div className="flex items-center pl-2 text-[#7C5E3C]">
                      <SmilePlus className="h-5 w-5" />
                    </div>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Write a direct message..."
                      className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
                    />
                    <button onClick={sendMessage} disabled={sending || !text.trim()} className="inline-flex items-center gap-2 rounded-full bg-[#22C55E] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
                      {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
