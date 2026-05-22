import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePollingResource } from "@/architecture";
import {
  Calendar,
  Clock3,
  Copy,
  Heart,
  Loader,
  MapPin,
  MessageCircle,
  PhoneCall,
  PhoneOff,
  Send,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

type TripMember = {
  name: string;
  email: string;
  joinedAt?: string;
  avatarColor?: string;
  isFriend?: boolean;
};

type TripChatMessage = {
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: string;
};

type TripDashboardRecord = {
  _id: string;
  name?: string;
  destination: string;
  tripDay: string;
  hour?: string;
  description?: string;
  numberOfPeople?: number;
  status: "Done" | "In Progress" | "Cancelled";
  visibility: "Public" | "Private";
  userEmail?: string;
  members: TripMember[];
  chatMessages: TripChatMessage[];
  joinedCount?: number;
  isFavorite?: boolean;
  inviteCode?: string;
  inviteLink?: string;
  dashboardTheme?: "sunset" | "forest" | "ocean" | "midnight";
  dashboardContent?: {
    heroTitle?: string;
    heroDescription?: string;
    highlights?: string[];
    hostNotes?: string;
  };
};

type FriendListItem = {
  _id: string;
  status: "pending" | "accepted";
  friend: {
    email: string;
    name: string;
  };
};

type MeetingParticipant = {
  email: string;
  name: string;
  joinedAt?: string;
  lastSeenAt?: string;
};

type MeetingSignal = {
  signalId: string;
  from: string;
  to: string;
  type: "offer" | "answer" | "candidate";
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
};

type MeetingRoomState = {
  active: boolean;
  hostEmail?: string;
  participants: MeetingParticipant[];
  signals: MeetingSignal[];
};

type RemoteStreamEntry = {
  email: string;
  stream: MediaStream;
};

const themeStyles: Record<string, string> = {
  sunset: "bg-[linear-gradient(135deg,#7C2D12,#F97316,#FDE68A)] text-white",
  forest: "bg-[linear-gradient(135deg,#14532D,#22C55E,#D9F99D)] text-white",
  ocean: "bg-[linear-gradient(135deg,#0F172A,#0EA5E9,#67E8F9)] text-white",
  midnight: "bg-[linear-gradient(135deg,#111827,#312E81,#6366F1)] text-white",
};

function VideoTile({ stream, label, muted = false }: { stream: MediaStream | null; label: string; muted?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#7C5E3C]/10 bg-[#0F172A] shadow-sm">
      <video ref={videoRef} autoPlay playsInline muted={muted} className="aspect-video w-full object-cover" />
      <div className="border-t border-white/10 bg-black/40 px-4 py-2 text-sm text-white">{label}</div>
    </div>
  );
}

export default function TripDashboardPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [trip, setTrip] = useState<TripDashboardRecord | null>(null);
  const [message, setMessage] = useState("");
  const [friendFeedback, setFriendFeedback] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [sending, setSending] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingCms, setSavingCms] = useState(false);
  const [meetingBusy, setMeetingBusy] = useState(false);
  const [error, setError] = useState("");
  const [meetingMessage, setMeetingMessage] = useState("");
  const [meetingState, setMeetingState] = useState<MeetingRoomState>({
    active: false,
    hostEmail: "",
    participants: [],
    signals: [],
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamEntry[]>([]);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const processedSignalsRef = useRef<Set<string>>(new Set());
  const [cmsForm, setCmsForm] = useState({
    dashboardTheme: "forest",
    heroTitle: "",
    heroDescription: "",
    highlights: "",
    hostNotes: "",
  });

  const loadTrip = useCallback(async () => {
    if (!id || typeof id !== "string") return;

    try {
      setLoading(true);
      const res = await fetch(`/api/trips/dashboard?id=${id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load trip dashboard");
      }
      setTrip(data);
      setCmsForm({
        dashboardTheme: data.dashboardTheme || "forest",
        heroTitle: data.dashboardContent?.heroTitle || data.name || data.destination || "",
        heroDescription: data.dashboardContent?.heroDescription || data.description || "",
        highlights: Array.isArray(data.dashboardContent?.highlights) ? data.dashboardContent.highlights.join(", ") : "",
        hostNotes: data.dashboardContent?.hostNotes || "",
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load trip dashboard");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      void loadTrip();
    }
  }, [loadTrip, router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/friends")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch friends");
        }
        return data;
      })
      .then((data) => setFriends(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, [status]);

  const currentEmail = session?.user?.email || "";
  const isHost = useMemo(() => Boolean(trip && currentEmail && trip.userEmail === currentEmail), [currentEmail, trip]);
  const themeClass = trip?.dashboardTheme ? themeStyles[trip.dashboardTheme] : themeStyles.forest;
  const invitableFriends = useMemo(() => {
    if (!trip) return [];
    const memberEmails = new Set(trip.members.map((member) => member.email));
    return friends.filter((item) => item.status === "accepted" && !memberEmails.has(item.friend.email));
  }, [friends, trip]);

  const closeAllPeerConnections = useCallback(() => {
    peerConnectionsRef.current.forEach((peerConnection) => peerConnection.close());
    peerConnectionsRef.current.clear();
    setRemoteStreams([]);
  }, []);

  const stopLocalStream = useCallback(() => {
    setLocalStream((currentStream) => {
      currentStream?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      closeAllPeerConnections();
      stopLocalStream();
    };
  }, [closeAllPeerConnections, stopLocalStream]);

  const ensureLocalStream = useCallback(async () => {
    if (localStream) return localStream;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    return stream;
  }, [localStream]);

  const fetchMeetingState = useCallback(async () => {
    if (!trip) return;

    try {
      const res = await fetch(`/api/trips/meeting?tripId=${trip._id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load meeting state");
      }
      setMeetingState({
        active: Boolean(data.active),
        hostEmail: data.hostEmail || trip.userEmail,
        participants: Array.isArray(data.participants) ? data.participants : [],
        signals: Array.isArray(data.signals) ? data.signals : [],
      });
    } catch (err) {
      console.error(err);
      setMeetingMessage(err instanceof Error ? err.message : "Failed to refresh meeting");
    }
  }, [trip]);

  usePollingResource(fetchMeetingState, { enabled: Boolean(trip), intervalMs: 2000 });

  useEffect(() => {
    if (!meetingState.active) {
      closeAllPeerConnections();
      if (!meetingBusy) {
        stopLocalStream();
      }
    }
  }, [closeAllPeerConnections, meetingBusy, meetingState.active, stopLocalStream]);

  const sendMeetingAction = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      if (!trip) return null;

      const res = await fetch("/api/trips/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id, action, ...extra }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Failed to ${action} meeting`);
      }
      return data;
    },
    [trip]
  );

  const updateRemoteStream = useCallback((email: string, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const existing = prev.find((item) => item.email === email);
      if (existing) {
        return prev.map((item) => (item.email === email ? { ...item, stream } : item));
      }
      return [...prev, { email, stream }];
    });
  }, []);

  const removeRemoteStream = useCallback((email: string) => {
    setRemoteStreams((prev) => prev.filter((item) => item.email !== email));
  }, []);

  const sendSignal = useCallback(
    async (targetEmail: string, signalType: "offer" | "answer" | "candidate", payload: RTCSessionDescriptionInit | RTCIceCandidateInit) => {
      await sendMeetingAction("signal", { targetEmail, signalType, payload });
    },
    [sendMeetingAction]
  );

  const createPeerConnection = useCallback(
    async (peerEmail: string, initiateOffer: boolean) => {
      const existing = peerConnectionsRef.current.get(peerEmail);
      if (existing) return existing;

      const stream = await ensureLocalStream();
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          void sendSignal(peerEmail, "candidate", event.candidate.toJSON());
        }
      };

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          updateRemoteStream(peerEmail, remoteStream);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === "closed" || peerConnection.connectionState === "failed" || peerConnection.connectionState === "disconnected") {
          removeRemoteStream(peerEmail);
        }
      };

      peerConnectionsRef.current.set(peerEmail, peerConnection);

      if (initiateOffer) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await sendSignal(peerEmail, "offer", offer);
      }

      return peerConnection;
    },
    [ensureLocalStream, removeRemoteStream, sendSignal, updateRemoteStream]
  );

  useEffect(() => {
    if (!meetingState.active || !isHost || !localStream) return;

    meetingState.participants
      .filter((participant) => participant.email !== currentEmail)
      .forEach((participant) => {
        if (!peerConnectionsRef.current.has(participant.email)) {
          void createPeerConnection(participant.email, true);
        }
      });
  }, [createPeerConnection, currentEmail, isHost, localStream, meetingState.active, meetingState.participants]);

  useEffect(() => {
    meetingState.signals.forEach((signal) => {
      if (processedSignalsRef.current.has(signal.signalId) || signal.from === currentEmail) {
        return;
      }

      processedSignalsRef.current.add(signal.signalId);

      const processSignal = async () => {
        if (signal.type === "offer") {
          const peerConnection = await createPeerConnection(signal.from, false);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          await sendSignal(signal.from, "answer", answer);
          return;
        }

        const peerConnection = peerConnectionsRef.current.get(signal.from) || (await createPeerConnection(signal.from, false));

        if (signal.type === "answer") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
          return;
        }

        if (signal.type === "candidate") {
          await peerConnection.addIceCandidate(new RTCIceCandidate(signal.payload as RTCIceCandidateInit));
        }
      };

      void processSignal().catch((signalError) => {
        console.error("Signal processing error:", signalError);
      });
    });
  }, [createPeerConnection, currentEmail, meetingState.signals, sendSignal]);

  async function startMeeting() {
    setMeetingBusy(true);
    setMeetingMessage("");
    try {
      await ensureLocalStream();
      await sendMeetingAction("start");
      await fetchMeetingState();
      setMeetingMessage("Meeting started. Your group can join now.");
    } catch (err) {
      setMeetingMessage(err instanceof Error ? err.message : "Failed to start meeting");
    } finally {
      setMeetingBusy(false);
    }
  }

  async function joinMeeting() {
    setMeetingBusy(true);
    setMeetingMessage("");
    try {
      await ensureLocalStream();
      await sendMeetingAction("join");
      await fetchMeetingState();
      setMeetingMessage("You joined the live meeting.");
    } catch (err) {
      setMeetingMessage(err instanceof Error ? err.message : "Failed to join meeting");
    } finally {
      setMeetingBusy(false);
    }
  }

  async function leaveMeeting() {
    setMeetingBusy(true);
    setMeetingMessage("");
    try {
      await sendMeetingAction("leave");
      closeAllPeerConnections();
      stopLocalStream();
      await fetchMeetingState();
      setMeetingMessage("You left the meeting.");
    } catch (err) {
      setMeetingMessage(err instanceof Error ? err.message : "Failed to leave meeting");
    } finally {
      setMeetingBusy(false);
    }
  }

  async function endMeeting() {
    setMeetingBusy(true);
    setMeetingMessage("");
    try {
      await sendMeetingAction("end");
      closeAllPeerConnections();
      stopLocalStream();
      await fetchMeetingState();
      setMeetingMessage("Meeting ended.");
    } catch (err) {
      setMeetingMessage(err instanceof Error ? err.message : "Failed to end meeting");
    } finally {
      setMeetingBusy(false);
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!trip || !message.trim()) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/trips/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id, message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send message");
      }
      setTrip((prev) => (prev ? { ...prev, chatMessages: data.chatMessages || prev.chatMessages } : prev));
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function toggleFavorite() {
    if (!trip) return;

    setSavingFavorite(true);
    setError("");
    try {
      const res = await fetch(trip.isFavorite ? `/api/favorites?tripId=${trip._id}` : "/api/favorites", {
        method: trip.isFavorite ? "DELETE" : "POST",
        headers: trip.isFavorite ? undefined : { "Content-Type": "application/json" },
        body: trip.isFavorite ? undefined : JSON.stringify({ tripId: trip._id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update favorite");
      }
      setTrip((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update favorite");
    } finally {
      setSavingFavorite(false);
    }
  }

  async function addFriend(friendEmail: string) {
    if (!trip) return;

    setFriendFeedback("");
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail, tripId: trip._id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to send friend request");
      }
      setFriendFeedback(data?.message || "Friend request sent.");
      await loadTrip();
    } catch (err) {
      setFriendFeedback(err instanceof Error ? err.message : "Failed to send friend request");
    }
  }

  async function copyInviteLink() {
    if (!trip) return;

    try {
      const res = await fetch("/api/trips/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to generate invite");
      }
      const absoluteLink = `${window.location.origin}${data.inviteLink}`;
      await navigator.clipboard.writeText(absoluteLink);
      setInviteFeedback("Invite link copied.");
      await loadTrip();
    } catch (err) {
      setInviteFeedback(err instanceof Error ? err.message : "Failed to copy invite");
    }
  }

  async function inviteFriend(friendEmail: string) {
    if (!trip) return;

    try {
      const res = await fetch("/api/trips/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip._id, friendEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to invite friend");
      }
      setInviteFeedback(`Invite sent to ${friendEmail}.`);
    } catch (err) {
      setInviteFeedback(err instanceof Error ? err.message : "Failed to invite friend");
    }
  }

  async function saveCms() {
    if (!trip) return;

    setSavingCms(true);
    setError("");
    try {
      const res = await fetch("/api/trips/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip._id,
          dashboardTheme: cmsForm.dashboardTheme,
          dashboardContent: {
            heroTitle: cmsForm.heroTitle,
            heroDescription: cmsForm.heroDescription,
            highlights: cmsForm.highlights
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            hostNotes: cmsForm.hostNotes,
          },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update dashboard");
      }
      await loadTrip();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update dashboard");
    } finally {
      setSavingCms(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
        <Loader className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white px-4">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-red-600">{error || "Trip dashboard not found"}</p>
          <Link href="/trips" className="mt-4 inline-flex rounded-full bg-[#14532D] px-5 py-2 text-sm text-white">
            Back to trips
          </Link>
        </div>
      </div>
    );
  }

  const hostRemoteStreams = isHost ? remoteStreams : remoteStreams.filter((item) => item.email === meetingState.hostEmail);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_28%),linear-gradient(180deg,#FAF3E0_0%,#FFFDF7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className={`rounded-[2rem] p-8 shadow-xl ${themeClass}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">Trip dashboard</p>
              <h1 className="text-4xl font-bold">{trip.dashboardContent?.heroTitle || trip.name || trip.destination}</h1>
              <p className="mt-3 max-w-2xl text-white/80">{trip.dashboardContent?.heroDescription || trip.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(trip.dashboardContent?.highlights || []).map((highlight) => (
                  <span key={highlight} className="rounded-full bg-white/15 px-3 py-1 text-sm text-white/90 backdrop-blur-sm">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/trips" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm">
                Back to trips
              </Link>
              <button
                onClick={toggleFavorite}
                disabled={savingFavorite}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${trip.isFavorite ? "bg-white text-[#14532D]" : "bg-[#14532D] text-white"}`}
              >
                <Heart className={`h-4 w-4 ${trip.isFavorite ? "fill-current" : ""}`} />
                {savingFavorite ? "Saving..." : trip.isFavorite ? "Saved to favorites" : "Save trip"}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-[#7C5E3C]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-semibold text-[#14532D]">Trip information</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-[#7C5E3C]">
                  <MapPin className="h-4 w-4 text-[#22C55E]" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-[#7C5E3C]">
                  <Calendar className="h-4 w-4 text-[#22C55E]" />
                  <span>{new Date(trip.tripDay).toLocaleDateString("en-GB")}</span>
                </div>
                <div className="flex items-center gap-2 text-[#7C5E3C]">
                  <Clock3 className="h-4 w-4 text-[#22C55E]" />
                  <span>{trip.hour}</span>
                </div>
                <div className="flex items-center gap-2 text-[#7C5E3C]">
                  <Users className="h-4 w-4 text-[#22C55E]" />
                  <span>
                    {trip.joinedCount ?? trip.members.length} / {trip.numberOfPeople ?? 0} members
                  </span>
                </div>
              </div>
              {trip.dashboardContent?.hostNotes && <p className="mt-4 rounded-2xl bg-[#FAF3E0]/45 p-4 text-sm leading-6 text-[#7C5E3C]">{trip.dashboardContent.hostNotes}</p>}
            </section>

            <section className="rounded-[2rem] border border-[#7C5E3C]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-xl font-semibold text-[#14532D]">Live Trip Meeting</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${meetingState.active ? "bg-[#22C55E]/10 text-[#14532D]" : "bg-[#FAF3E0] text-[#7C5E3C]"}`}>
                  {meetingState.active ? "Meeting live" : "Meeting offline"}
                </span>
              </div>

              <p className="text-sm text-[#7C5E3C]">
                The host can start a live trip room here. Members can join, talk, and see each other without leaving the dashboard.
              </p>
              {meetingMessage && <p className="mt-3 text-sm text-[#22C55E]">{meetingMessage}</p>}

              <div className="mt-5 flex flex-wrap gap-3">
                {isHost ? (
                  <>
                    {!meetingState.active ? (
                      <button onClick={startMeeting} disabled={meetingBusy} className="inline-flex items-center gap-2 rounded-full bg-[#22C55E] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
                        {meetingBusy ? <Loader className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
                        Start meeting
                      </button>
                    ) : (
                      <button onClick={endMeeting} disabled={meetingBusy} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
                        <PhoneOff className="h-4 w-4" />
                        End meeting
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {meetingState.active ? (
                      <button onClick={localStream ? leaveMeeting : joinMeeting} disabled={meetingBusy} className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
                        {meetingBusy ? <Loader className="h-4 w-4 animate-spin" /> : localStream ? <PhoneOff className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                        {localStream ? "Leave meeting" : "Join meeting"}
                      </button>
                    ) : (
                      <span className="rounded-full bg-[#FAF3E0] px-4 py-3 text-sm text-[#7C5E3C]">Waiting for the host to start</span>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <VideoTile stream={localStream} label="You" muted />
                {hostRemoteStreams.map((entry) => (
                  <VideoTile key={entry.email} stream={entry.stream} label={entry.email === meetingState.hostEmail ? "Host" : entry.email} />
                ))}
                {!localStream && <div className="flex aspect-video items-center justify-center rounded-[1.5rem] border border-dashed border-[#7C5E3C]/20 bg-[#FAF3E0]/35 text-sm text-[#7C5E3C]">Your camera preview appears here when you join.</div>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#7C5E3C]">
                <span className="rounded-full bg-[#FAF3E0] px-3 py-1">{meetingState.participants.length} participants in room</span>
                <span className="rounded-full bg-[#FAF3E0] px-3 py-1">Host-led WebRTC session</span>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#7C5E3C]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#22C55E]" />
                <h2 className="text-xl font-semibold text-[#14532D]">Group chat</h2>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl bg-[#FAF3E0]/50 p-4">
                {trip.chatMessages.length === 0 ? (
                  <p className="text-sm text-[#7C5E3C]">No messages yet. Start the conversation with your group.</p>
                ) : (
                  trip.chatMessages.map((chatMessage, index) => (
                    <div key={`${chatMessage.senderEmail}-${chatMessage.createdAt}-${index}`} className="rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#14532D]">{chatMessage.senderName}</p>
                        <p className="text-xs text-[#7C5E3C]">{new Date(chatMessage.createdAt).toLocaleString("en-GB")}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#7C5E3C]">{chatMessage.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage} className="mt-4 flex gap-3 rounded-[1.75rem] border border-[#7C5E3C]/10 bg-[#FAF3E0]/45 p-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message for the group..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
                />
                <button type="submit" disabled={sending || message.trim().length === 0} className="inline-flex items-center gap-2 rounded-full bg-[#22C55E] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
                  {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </form>
            </section>

            {isHost && (
              <section className="rounded-[2rem] border border-[#7C5E3C]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-xl font-semibold text-[#14532D]">Dashboard CMS</h2>
                </div>
                <p className="mb-5 text-sm text-[#7C5E3C]">Change the trip theme, hero copy, highlights, and notes that your members see.</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Theme</span>
                    <select value={cmsForm.dashboardTheme} onChange={(e) => setCmsForm((prev) => ({ ...prev, dashboardTheme: e.target.value }))} className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3">
                      <option value="forest">Forest</option>
                      <option value="sunset">Sunset</option>
                      <option value="ocean">Ocean</option>
                      <option value="midnight">Midnight</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Hero Title</span>
                    <input value={cmsForm.heroTitle} onChange={(e) => setCmsForm((prev) => ({ ...prev, heroTitle: e.target.value }))} className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Hero Description</span>
                    <textarea value={cmsForm.heroDescription} onChange={(e) => setCmsForm((prev) => ({ ...prev, heroDescription: e.target.value }))} rows={3} className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Highlights</span>
                    <input value={cmsForm.highlights} onChange={(e) => setCmsForm((prev) => ({ ...prev, highlights: e.target.value }))} placeholder="Adventure, sunset dinner, city walk" className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Host Notes</span>
                    <textarea value={cmsForm.hostNotes} onChange={(e) => setCmsForm((prev) => ({ ...prev, hostNotes: e.target.value }))} rows={4} className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                  </label>
                </div>

                <button onClick={saveCms} disabled={savingCms} className="mt-5 rounded-full bg-[#14532D] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  {savingCms ? "Saving..." : "Save dashboard content"}
                </button>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-[#7C5E3C]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-semibold text-[#14532D]">Members</h2>
              {friendFeedback && <p className="mb-3 text-sm text-[#22C55E]">{friendFeedback}</p>}
              <div className="space-y-3">
                {trip.members.map((member) => (
                  <div key={member.email} className="rounded-2xl border border-[#7C5E3C]/10 bg-[#FAF3E0]/40 p-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: member.avatarColor || "#22C55E" }}>
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-[#14532D]">{member.name}</p>
                        <p className="text-sm text-[#7C5E3C]">{member.email}</p>
                      </div>
                    </div>
                    {member.joinedAt && <p className="mt-2 text-xs text-[#7C5E3C]/80">Joined {new Date(member.joinedAt).toLocaleDateString("en-GB")}</p>}
                    {member.email !== currentEmail && (
                      <div className="mt-3 flex gap-2">
                        {member.isFriend ? (
                          <Link href={`/dashboard/client/messages?friend=${encodeURIComponent(member.email)}`} className="rounded-full bg-[#14532D] px-4 py-2 text-xs text-white">
                            Message
                          </Link>
                        ) : (
                          <button onClick={() => addFriend(member.email)} className="rounded-full bg-[#22C55E] px-4 py-2 text-xs text-white">
                            Add friend
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {isHost && (
              <section className="rounded-[2rem] border border-[#7C5E3C]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Copy className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-xl font-semibold text-[#14532D]">Invitations</h2>
                </div>
                <p className="text-sm text-[#7C5E3C]">Create a private invite link or send invitations directly to friends.</p>
                {inviteFeedback && <p className="mt-3 text-sm text-[#22C55E]">{inviteFeedback}</p>}
                <button onClick={copyInviteLink} className="mt-4 rounded-full bg-[#22C55E] px-5 py-3 text-sm font-medium text-white">
                  Copy invitation link
                </button>
                <div className="mt-5 space-y-2">
                  {invitableFriends.map((friend) => (
                    <button key={friend._id} onClick={() => inviteFriend(friend.friend.email)} className="flex w-full items-center justify-between rounded-2xl bg-[#FAF3E0]/50 px-4 py-3 text-left text-sm text-[#14532D]">
                      <span>{friend.friend.name}</span>
                      <span className="text-[#22C55E]">Send invite</span>
                    </button>
                  ))}
                  {invitableFriends.length === 0 && <p className="text-sm text-[#7C5E3C]">Accepted friends who are not in this group will appear here.</p>}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
