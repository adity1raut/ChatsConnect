import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { buildChatMarkdown } from "./chatMarkdown.js";
import { downloadTextFile, slugify } from "../../lib/download";

const PAGE_SIZE = 100;
const MAX_PAGES = 50; // 5,000 messages is plenty for an export

/** Every stored message of a chat, oldest first (the API pages newest-first). */
async function fetchAllRawMessages(chat) {
  const url =
    chat.type === "group"
      ? `${API_URL}/messages/group/${chat.groupId}`
      : `${API_URL}/messages/dm/${chat.id}`;
  const pages = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = await axios.get(url, { params: { page, limit: PAGE_SIZE } });
    const batch = data.messages || [];
    pages.unshift(batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return pages.flat();
}


/** Fetch the whole chat, decode each message and download it as a .md file. */
export async function exportChatAsMarkdown(chat, decode) {
  const raw = await fetchAllRawMessages(chat);
  const messages = await Promise.all(raw.map(decode));
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(`chat-${slugify(chat.name)}-${date}.md`, buildChatMarkdown(chat, messages));
  return messages.length;
}
