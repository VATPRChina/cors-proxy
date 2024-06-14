import { createServer } from "node:http";

const server = createServer((req, res) => {
  try {
    const reqUrl = new URL(`http://localhost/${req.url ?? ""}`);
    const targetStr = reqUrl.searchParams.get("target") ?? "";
    const target = new URL(targetStr);

    if (target.protocol !== "https:") {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid URL: protocol must be https");
      return;
    }

    if (
      req.method === undefined ||
      !["GET", "HEAD", "OPTIONS"].includes(req.method)
    ) {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      return;
    }

    if (!target.hostname.endsWith("vatsim.net")) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden target " + target.hostname);
      return;
    }

    if (
      !req.headers.origin ||
      !new URL(req.headers.origin).hostname.endsWith("vatprc.net")
    ) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(
        "Origin header is required, and must be from vatprc.net: " +
          req.headers.origin,
      );
      return;
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (
        typeof value === "string" &&
        [
          "accept",
          "accept-encoding",
          "accept-language",
          "cache-control",
          "pragma",
          "referer",
          "user-agent",
        ].includes(key.toLowerCase())
      ) {
        headers.set(key, value);
      }
    }

    fetch(targetStr, { headers, method: req.method, redirect: "manual" })
      .then((targetRes) => {
        const resHeaders = [...targetRes.headers.entries()].filter(([key]) =>
          [
            "content-type",
            "content-length",
            "last-modified",
            "etag",
            "cache-control",
            "expires",
            "pragma",
            "vary",
            "access-control-allow-origin",
            "access-control-expose-headers",
            "access-control-allow-credentials",
            "access-control-allow-methods",
            "access-control-allow-headers",
            "access-control-max-age",
            "access-control-request-method",
            "access-control-request-headers",
          ].includes(key.toLowerCase()),
        );
        if (
          resHeaders.find(
            ([key]) => key.toLowerCase() === "access-control-allow-origin",
          ) === undefined
        ) {
          resHeaders.push(["Access-Control-Allow-Origin", req.headers.origin!]);
        }
        res.writeHead(targetRes.status, Object.fromEntries(resHeaders));
        return targetRes.arrayBuffer();
      })
      .then((body) => res.end(Buffer.from(body)))
      .catch((e) => {
        console.error(e, reqUrl);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      });
  } catch (e) {
    console.error(e, req.url);
    if (e instanceof TypeError && "code" in e && e.code === "ERR_INVALID_URL") {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid URL");
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});

const main = () => {
  server.listen(3000);

  console.log("vatprc cors-proxy listening on 3000");
};

main();
