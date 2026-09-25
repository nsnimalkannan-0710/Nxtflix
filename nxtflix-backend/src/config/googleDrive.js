import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH
  ? path.resolve(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_PATH)
  : path.join(__dirname, "../../service-account.json");

let drive = null;

try {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  drive = google.drive({ version: "v3", auth });
} catch (error) {
  console.warn("Google Service Account file not found or invalid. Google Drive streaming fallback enabled.");
}

export default drive;
