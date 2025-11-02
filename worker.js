export default {
  async fetch(request, env) {
    // Only accept POST
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    // Auth header
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${env.EDGE_TOKEN}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    let data;
    try {
      data = await request.json();
    } catch (err) {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const { action, command, phrase } = data;

    if (!action || !command) {
      return new Response("Missing action or command", { status: 400 });
    }

    // Boot logic
    if (action === "initiate_shortcut") {
      // Example: dispatch based on command
      switch (command) {
        case "voice_log":
          // Forward to event endpoint
          await fetch(`${env.WORKER_BASE_URL}/event`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${env.EDGE_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ action: "voice_log", phrase: phrase, source: "siri" })
          });
          return new Response(JSON.stringify({ status: "ok", message: "Voice log triggered" }), { status: 200, headers: { "Content-Type": "application/json" } });

        // Add more cases as you need
        default:
          return new Response(`Unknown command: ${command}`, { status: 400 });
      }
    }

    return new Response("Unhandled action", { status: 400 });
  }
};
