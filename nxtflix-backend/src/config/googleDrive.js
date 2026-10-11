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

import fs from "fs";

let drive = null;

try {
  let auth = null;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  } else if (fs.existsSync(keyFilePath)) {
    auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  }

  if (auth) {
    drive = google.drive({ version: "v3", auth });
  } else {
    console.warn("Google Service Account keyFile not found. Streaming will be disabled until configured.");
  }
} catch (error) {
  console.warn("Google Service Account configuration error:", error.message);
}

export default drive;
