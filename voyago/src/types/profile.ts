import type { NotificationItem } from "@/types/notification";
import type { JoinedTripSummary } from "@/types/trip";

export type AuditLogItem = {
  _id: string;
  summary: string;
  createdAt: string;
};

export type ProfileStats = {
  joinedTrips: number;
  friends: number;
  notifications: number;
};

export type ClientProfile = {
  id: string;
  name: string;
  email: string;
  bio: string;
  city: string;
  travelStyle: string;
  avatarColor: string;
  profileCompletion: number;
  stats: ProfileStats;
  joinedTrips: JoinedTripSummary[];
  recentNotifications: NotificationItem[];
  auditLogs: AuditLogItem[];
};
