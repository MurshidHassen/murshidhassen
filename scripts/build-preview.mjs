import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "_site");
const isServe = process.argv.includes("--serve");
const baseurl = isServe ? "" : "/murshidhassen";

const site = {
  title: "Murshid Hassen",
  description: "Software Engineer · Sri Lanka",
  email: "murshidhassen@gmail.com",
  blog_url: "https://daemonxz.wordpress.com/",
  location: "Sri Lanka",
  lang: "en-US",
  baseurl: baseurl,
  github_username: "MurshidMac",
  social: [
    { name: "GitHub", url: "https://github.com/MurshidMac" },
    { name: "Blog", url: "https://daemonxz.wordpress.com/" },
    { name: "Email", url: "mailto:murshidhassen@gmail.com" },
  ],
};

function relativeUrl(urlPath) {
  const normalized = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
  if (normalized === "/") return `${baseurl}/` || "/";

  const hasFileExtension = /\.[a-z0-9]+$/i.test(normalized);
  const withSlash = hasFileExtension
    ? normalized
    : normalized.endsWith("/")
      ? normalized
      : `${normalized}/`;

  return `${baseurl}${withSlash}`.replace(/\/+/g, "/") || withSlash;
}

function parseFrontMatter(source) {
  if (!source.startsWith("---")) {
    return { data: {}, content: source };
  }

  const end = source.indexOf("---", 3);
  const raw = source.slice(3, end).trim();
  const content = source.slice(end + 3).trim();
  const data = {};

  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (match) data[match[1]] = match[2];
  }

  return { data, content };
}

function renderLiquid(template, page = {}) {
  let html = template;

  html = html.replace(/\{\%\s*seo\s*\%\}/g, "");

  html = html.replace(
    /\{\%\s*if\s+page\.title\s*\%\}([\s\S]*?)\{\%\s*endif\s*\%\}/g,
    (_, inner) => (page.title ? inner : "")
  );

  html = html.replace(
    /\{\%\s*for\s+link\s+in\s+site\.social\s*\%\}([\s\S]*?)\{\%\s*endfor\s*\%\}/g,
    (_, inner) => site.social.map((link) => renderLiquid(inner, page).replace(/\{\{\s*link\.name\s*\}\}/g, link.name).replace(/\{\{\s*link\.url\s*\}\}/g, link.url)).join("")
  );

  html = html.replace(/\{\{\s*content\s*\}\}/g, page.content || "");
  html = html.replace(/\{\{\s*page\.title\s*\}\}/g, page.title || "");
  html = html.replace(/\{\{\s*page\.description\s*\|\s*default:\s*site\.description\s*\}\}/g, page.description || site.description);
  html = html.replace(
    /\{\{\s*site\.([a-z0-9_]+)\s*\|\s*default:\s*'([^']*)'\s*\}\}/g,
    (_, key, fallback) => site[key] ?? fallback
  );
  html = html.replace(/\{\{\s*site\.([a-z0-9_]+)\s*\}\}/g, (_, key) => site[key] ?? "");
  html = html.replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, (_, urlPath) => relativeUrl(urlPath));
  html = html.replace(/\{\{\s*"([^"]+)"\s*\|\s*relative_url\s*\}\}/g, (_, urlPath) => relativeUrl(urlPath));

  return html;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else copyFile(from, to);
  }
}

function buildCss() {
  const scssPath = path.join(root, "assets/css/style.scss");
  const cssOut = path.join(outDir, "assets/css/style.css");
  const source = fs.readFileSync(scssPath, "utf8").replace(/^---[\s\S]*?---\s*/, "");
  ensureDir(path.dirname(cssOut));
  fs.writeFileSync(cssOut, source);
}

function buildPage(markdownPath, outputPath) {
  const raw = fs.readFileSync(markdownPath, "utf8");
  const { data, content } = parseFrontMatter(raw);
  const layout = fs.readFileSync(path.join(root, "_layouts/default.html"), "utf8");
  const page = {
    title: data.title,
    description: data.description,
    content: renderLiquid(content, { title: data.title, description: data.description }),
  };
  const html = renderLiquid(layout, page);
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, html);
}

function build() {
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  buildCss();
  buildPage(path.join(root, "index.md"), path.join(outDir, "index.html"));
  buildPage(path.join(root, "resume/index.md"), path.join(outDir, "resume/index.html"));
  buildPage(path.join(root, "license/index.md"), path.join(outDir, "license/index.html"));

  copyDir(path.join(root, "assets/js"), path.join(outDir, "assets/js"));
  if (fs.existsSync(path.join(root, "assets/img"))) {
    copyDir(path.join(root, "assets/img"), path.join(outDir, "assets/img"));
  }
  copyDir(path.join(root, "download"), path.join(outDir, "download"));

  console.log(`Built site to ${outDir}`);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  return types[ext] || "application/octet-stream";
}

function serve() {
  const port = 4000;

  const server = http.createServer((req, res) => {
    let requestPath = decodeURIComponent(req.url.split("?")[0]);
    if (requestPath.length > 1 && requestPath.endsWith("/")) {
      requestPath = requestPath.replace(/\/+$/, "");
    }
    if (requestPath.endsWith("/") || !path.extname(requestPath)) {
      requestPath = path.join(requestPath, "index.html");
    }

    const filePath = path.join(outDir, requestPath);
    if (!filePath.startsWith(outDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(data);
    });
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Site was rebuilt — refresh http://127.0.0.1:${port}/`);
      return;
    }
    throw err;
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
  });
}

build();

if (isServe) {
  console.log(`Serving at http://localhost:4000/`);
  serve();
}
