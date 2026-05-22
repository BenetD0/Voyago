import Notification from "@/models/Notification";

type NotificationPayload = {
  userEmail: string;
  title: string;
  body: string;
  type?: "trip_join" | "trip_invite" | "friend_request" | "friend_accept" | "direct_message" | "system";
  data?: {
    tripId?: string;
    inviteCode?: string;
    friendEmail?: string;
    senderEmail?: string;
  };
};

export async function createNotification(payload: NotificationPayload) {
  try {
    await Notification.create({
      userEmail: payload.userEmail,
      title: payload.title,
      body: payload.body,
      type: payload.type || "system",
      data: payload.data || {},
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
