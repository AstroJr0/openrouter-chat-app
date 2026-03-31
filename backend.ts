import { createOpenRouter } from "@openrouter/sdk";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Handle Chat API
    if (req.method === "POST" && new URL(req.url).pathname === "/api/chat") {
      try {
        const { prompt, apiKey, model } = await req.json();

        if (!apiKey) {
          return new Response(JSON.stringify({ error: "API Key required" }), { status: 400 });
        }

        // Initialize OpenRouter with the key sent from frontend
        const openrouter = createOpenRouter({
          apiKey: apiKey,
        });

        const completion = await openrouter.chat.completions.create({
          model: model || "google/gemini-2.0-flash-001", // Fallback model
          messages: [{ role: "user", content: prompt }],
        });

        const responseText = completion.choices[0].message.content;

        return new Response(JSON.stringify({ message: responseText }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error: any) {
        console.error("Backend Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
    
