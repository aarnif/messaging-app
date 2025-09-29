import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";
const PORT = Number(process.env.PORT) || 4000;

export default { DATABASE_URL, PORT };
