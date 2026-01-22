/**
 * Netlify Function: /api/redesign
 * Receives JSON: { image_base64, room, style, countertop, cabinets, backsplash, hardware, notes, variations }
 * Calls OpenAI Images Edit API to generate redesign concepts.
 *
 * Setup (Netlify):
 * - Environment variable: OPENAI_API_KEY
 *
 * Security:
 * - Never expose your API key in browser code.
 * - Keep variations small (1–3) to control cost.
 */
export async function handler(event) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 501,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "OPENAI_API_KEY is not set" })
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const {
    image_base64,
    room = "kitchen",
    style = "Modern Minimal",
    countertop = "",
    cabinets = "",
    backsplash = "",
    hardware = "",
    notes = "",
    variations = 1
  } = payload;

  if (!image_base64) {
    return { statusCode: 400, body: "Missing image_base64" };
  }

  const n = Math.max(1, Math.min(parseInt(variations, 10) || 1, 3));

  // Prompt tuned for "keep layout, change finishes"
  const prompt = [
    `Redesign this ${room} photo in a ${style} style.`,
    `Keep the same layout and camera angle. Do not change walls/doors/windows placement.`,
    `Focus on finishes and surfaces: countertop, backsplash, cabinet color, hardware, lighting mood.`,
    countertop ? `Countertop: ${countertop}.` : "",
    cabinets ? `Cabinets: ${cabinets}.` : "",
    backsplash ? `Backsplash: ${backsplash}.` : "",
    hardware ? `Hardware: ${hardware}.` : "",
    notes ? `Extra notes: ${notes}` : "",
    `Photorealistic, high-end, clean, natural lighting.`
  ].filter(Boolean).join(" ");

  // Build multipart for https://api.openai.com/v1/images/edits
  const boundary = "----netlifyBoundary" + Math.random().toString(16).slice(2);
  const CRLF = "\r\n";
  const enc = new TextEncoder();

  const parts = [];
  const addField = (name, value) => {
    parts.push(enc.encode(`--${boundary}${CRLF}`));
    parts.push(enc.encode(`Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}`));
    parts.push(enc.encode(String(value)));
    parts.push(enc.encode(CRLF));
  };

  const addFile = (name, bytes, filename, contentType="image/png") => {
    parts.push(enc.encode(`--${boundary}${CRLF}`));
    parts.push(enc.encode(`Content-Disposition: form-data; name="${name}"; filename="${filename}"${CRLF}`));
    parts.push(enc.encode(`Content-Type: ${contentType}${CRLF}${CRLF}`));
    parts.push(bytes);
    parts.push(enc.encode(CRLF));
  };

  // Decode base64 (strip data URL if present)
  const b64 = String(image_base64).replace(/^data:image\/\w+;base64,/, "");
  const bytes = Buffer.from(b64, "base64");

  addField("model", "gpt-image-1");
  addField("prompt", prompt);
  addField("n", n);
  addField("size", "1536x1024");
  addFile("image", bytes, "room.png", "image/png");
  parts.push(enc.encode(`--${boundary}--${CRLF}`));

  const resp = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`
    },
    body: Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p)))
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return {
      statusCode: resp.status,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(json)
    };
  }

  const images = (json.data || []).map(d => d.b64_json).filter(Boolean);
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ images })
  };
}
