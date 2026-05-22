import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import { createAuditLog } from "../../../src/lib/audit";
import { createNotification } from "../../../src/lib/notifications";
import DirectMessage from "../../../src/models/DirectMessage";
import Friendship from "../../../src/models/Friendship";

type ConversationReaction = {
  emoji: string;
  users: string[];
};

type ConversationMessage = {
  messageId: string;
  senderEmail: string;
  senderName: string;
  text: string;
  deliveredTo: string[];
  seenBy: string[];
  reactions: ConversationReaction[];
  createdAt: Date;
};

function getConversationKey(a: string, b: string) {
  return [a.toLowerCase(), b.toLowerCase()].sort().join("__");
}

async function assertFriendship(currentEmail: string, friendEmail: string) {
  return Friendship.findOne({
    status: "accepted",
    $or: [
      { requesterEmail: currentEmail, recipientEmail: friendEmail },
      { requesterEmail: friendEmail, recipientEmail: currentEmail },
    ],
  });
}

export default async function directMessages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    if (req.method === "GET") {
      const friendEmail = typeof req.query.friendEmail === "string" ? req.query.friendEmail : "";
      if (!friendEmail) {
        return res.status(400).json({ message: "Friend email is required" });
      }

      const friendship = await assertFriendship(token.email, friendEmail);
      if (!friendship) {
        return res.status(403).json({ message: "You can only message accepted friends" });
      }

      const conversationKey = getConversationKey(token.email, friendEmail);
      const conversation = await DirectMessage.findOne({ conversationKey });

      if (!conversation) {
        return res.status(200).json({
          conversationKey,
          participants: [token.email, friendEmail],
          messages: [],
        });
      }

      let changed = false;
      const messages = conversation.messages as unknown as ConversationMessage[];
      messages.forEach((message) => {
        if (message.senderEmail !== token.email && !message.deliveredTo.includes(token.email!)) {
          message.deliveredTo.push(token.email!);
          changed = true;
        }
      });

      if (changed) {
        await conversation.save();
      }

      return res.status(200).json(conversation);
    }

    if (req.method === "POST") {
      const { friendEmail, text } = req.body;
      if (!friendEmail || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ message: "Friend email and message are required" });
      }

      const friendship = await assertFriendship(token.email, friendEmail);
      if (!friendship) {
        return res.status(403).json({ message: "You can only message accepted friends" });
      }

      const conversationKey = getConversationKey(token.email, friendEmail);
      const conversation = await DirectMessage.findOneAndUpdate(
        { conversationKey },
        {
          $setOnInsert: {
            conversationKey,
            participants: [token.email, friendEmail],
          },
          $push: {
            messages: {
              senderEmail: token.email,
              senderName: token.name || token.email.split("@")[0],
              text: text.trim(),
              deliveredTo: [token.email],
              seenBy: [token.email],
              reactions: [],
            },
          },
        },
        { upsert: true, new: true }
      );

      await createNotification({
        userEmail: friendEmail,
        title: "New direct message",
        body: `${token.name || token.email} sent you a message.`,
        type: "direct_message",
        data: { friendEmail: token.email, senderEmail: token.email },
      });

      await createAuditLog({
        actorEmail: token.email,
        action: "direct_message.sent",
        entityType: "conversation",
        entityId: conversationKey,
        summary: `Sent a direct message to ${friendEmail}`,
      });

      return res.status(200).json(conversation);
    }

    if (req.method === "PATCH") {
      const { friendEmail, action, messageId, emoji } = req.body;
      if (!friendEmail) {
        return res.status(400).json({ message: "Friend email is required" });
      }

      const friendship = await assertFriendship(token.email, friendEmail);
      if (!friendship) {
        return res.status(403).json({ message: "You can only message accepted friends" });
      }

      const conversationKey = getConversationKey(token.email, friendEmail);
      const conversation = await DirectMessage.findOne({ conversationKey });
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (action === "seen") {
        const messages = conversation.messages as unknown as ConversationMessage[];
        messages.forEach((message) => {
          if (message.senderEmail !== token.email && !message.seenBy.includes(token.email!)) {
            message.seenBy.push(token.email!);
          }
        });

        await conversation.save();
        return res.status(200).json(conversation);
      }

      if (action === "react") {
        if (!messageId || typeof emoji !== "string" || !emoji.trim()) {
          return res.status(400).json({ message: "Message id and emoji are required" });
        }

        const messages = conversation.messages as unknown as ConversationMessage[];
        const targetMessage = messages.find((message) => message.messageId === messageId);
        if (!targetMessage) {
          return res.status(404).json({ message: "Message not found" });
        }

        const existingReaction = targetMessage.reactions.find((reaction) => reaction.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(token.email)) {
            existingReaction.users = existingReaction.users.filter((email: string) => email !== token.email);
          } else {
            existingReaction.users.push(token.email);
          }
          targetMessage.reactions = targetMessage.reactions.filter((reaction) => reaction.users.length > 0);
        } else {
          targetMessage.reactions.push({ emoji, users: [token.email] });
        }

        await conversation.save();
        return res.status(200).json(conversation);
      }

      return res.status(400).json({ message: "Unsupported action" });
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error handling direct messages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
