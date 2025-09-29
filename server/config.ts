import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const PORT = Number(process.env.PORT) || 4000;

export default { DATABASE_URL, JWT_SECRET, PORT };
