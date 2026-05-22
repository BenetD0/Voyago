export type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  createdAt?: string;
  data?: {
    tripId?: string;
    friendEmail?: string;
    inviteCode?: string;
    senderEmail?: string;
  };
};
