import fetch from "node-fetch";

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

async function proxyToAI(path, body) {
  const response = await fetch(`${AI_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.detail || "AI service error");
    err.status = response.status;
    throw err;
  }
  return data;
}

export const smartReply = async (req, res) => {
  try {
    const data = await proxyToAI("/ai/smart-reply", req.body);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const summarize = async (req, res) => {
  try {
    const data = await proxyToAI("/ai/summarize", req.body);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const translate = async (req, res) => {
  try {
    const data = await proxyToAI("/ai/translate", req.body);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const sentiment = async (req, res) => {
  try {
    const data = await proxyToAI("/ai/sentiment", req.body);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const chat = async (req, res) => {
  try {
    const data = await proxyToAI("/ai/chat", req.body);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const healthCheck = async (req, res) => {
  try {
    const response = await fetch(`${AI_URL}/ai/health`);
    const data = await response.json();
    res.json(data);
  } catch {
    res
      .status(503)
      .json({ status: "unavailable", message: "AI service is not reachable" });
  }
};
