import { getAuthUrl, setTokens } from './src/services/your-oauth-file.js';

// STEP 1: Generate URL
const url = getAuthUrl();
console.log("Open this URL in browser:\n", url);

// STEP 2: After login, paste code here manually
const code = "PASTE_CODE_HERE"; // <-- replace later

if (code !== "PASTE_CODE_HERE") {
  setTokens(code).then(() => {
    console.log("✅ Token saved successfully!");
  });
}