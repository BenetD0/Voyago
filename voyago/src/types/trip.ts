export type JoinedTripSummary = {
  _id: string;
  name: string;
  destination: string;
  visibility: "Public" | "Private";
  tripDay?: string;
};

export type TripMember = {
  name: string;
  email: string;
  joinedAt?: string;
  avatarColor?: string;
  isFriend?: boolean;
};

export type TripChatMessage = {
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: string;
};
