import { createLogger, format, transports } from "winston";

interface EmojiMap {
  [key: string]: string;
}

// Create simple logger with emoji format
export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ level, message, timestamp }) => {
      const emojis: EmojiMap = {
        error: "❌",
        warn: "⚠️",
        info: "ℹ️",
      };

      return `${timestamp} ${
        emojis[level]
      } [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new transports.Console()],
});
