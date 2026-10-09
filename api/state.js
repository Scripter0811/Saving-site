export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Site setup is incomplete: add the Supabase environment variables in Vercel." });

  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/trip_savings?id=eq.1&select=you_saved,friend_saved`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json"
  };

  if (req.method === "GET") {
    try {
      const r = await fetch(endpoint, { headers, cache: "no-store" });
      const rows = await r.json();
      if (!r.ok) return res.status(502).json({ error: "Could not read the savings database." });
      if (!rows.length) return res.status(500).json({ error: "The trip_savings table needs its initial row. Follow the setup instructions." });
      return res.status(200).json(rows[0]);
    } catch {
      return res.status(502).json({ error: "Could not connect to the savings database." });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { person, amount, pin } = req.body || {};
  if (!process.env.SAVINGS_PIN || pin !== process.env.SAVINGS_PIN) {
    return res.status(401).json({ error: "That trip PIN wasn't correct." });
  }
  if (!["you", "friend"].includes(person) || !Number.isInteger(amount) || amount < 0 ||
      amount > (person === "you" ? 1750 : 800)) {
    return res.status(400).json({ error: "Check the amount and try again. Enter a whole-dollar amount within your target." });
  }

  try {
    const read = await fetch(endpoint, { headers, cache: "no-store" });
    const rows = await read.json();
    if (!read.ok || !rows.length) return res.status(502).json({ error: "Could not read the current savings." });
    const updated = { ...rows[0], [person === "you" ? "you_saved" : "friend_saved"]: amount };
    const write = await fetch(endpoint, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(updated)
    });
    const result = await write.json();
    if (!write.ok || !result.length) return res.status(502).json({ error: "Could not save the update." });
    return res.status(200).json({ you_saved: result[0].you_saved, friend_saved: result[0].friend_saved });
  } catch {
    return res.status(502).json({ error: "Could not connect to the savings database." });
  }
