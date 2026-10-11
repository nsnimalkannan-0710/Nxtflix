import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs";

const rootBackendDir = path.resolve(__dirname, "../../");
let keyFilePath = null;

if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH && fs.existsSync(path.resolve(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_PATH))) {
  keyFilePath = path.resolve(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
} else if (fs.existsSync(path.join(rootBackendDir, "service-account.json"))) {
  keyFilePath = path.join(rootBackendDir, "service-account.json");
} else {
  try {
    const files = fs.readdirSync(rootBackendDir);
    const found = files.find(
      (f) => f.endsWith(".json") && f !== "package.json" && f !== "package-lock.json"
    );
    if (found) {
      keyFilePath = path.join(rootBackendDir, found);
    }
  } catch (err) {
    // Ignore read directory error
  }
}

let drive = null;

try {
  let auth = null;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  } else if (keyFilePath && fs.existsSync(keyFilePath)) {
    auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    console.log(`Loaded Google Service Account key from: ${path.basename(keyFilePath)}`);
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
