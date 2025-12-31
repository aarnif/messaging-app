import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const PORT = Number(process.env.PORT) || 4000;

const isDevelopment =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const SERVER_URL = isDevelopment
  ? `http://localhost:${PORT}`
  : process.env.SERVER_URL;

const WS_URL = isDevelopment ? `ws://localhost:${PORT}` : process.env.WS_URL;

export default { DATABASE_URL, JWT_SECRET, PORT, SERVER_URL, WS_URL };
