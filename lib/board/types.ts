// Shared types for the GitHub-authenticated message board ("guestbook").

export type BoardMessage = {
  id: string;
  /** GitHub numeric user id — the unique-user key. */
  userId: number;
  login: string;
  name: string | null;
  avatar: string;
  text: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp of the last edit, if the author edited the message. */
  editedAt?: string;
};

export type BoardStats = {
  /** Total number of messages. */
  total: number;
  /** Distinct GitHub users who have posted — the "unique user count". */
  uniqueUsers: number;
};

export type NewMessage = Pick<
  BoardMessage,
  "userId" | "login" | "name" | "avatar" | "text"
>;

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_MESSAGES = 200;

/** How many messages a single board page (initial load / infinite-scroll fetch) returns. */
export const BOARD_PAGE_SIZE = 20;

/**
 * Minimum gap between two new posts by the same signed-in user. Edits and
 * deletes of existing messages are exempt — only fresh posts are throttled.
 */
export const POST_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
