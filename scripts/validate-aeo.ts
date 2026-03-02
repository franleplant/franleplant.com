/**
 * AEO/SEO Validation Script with LLM Testing
 *
 * Validates AEO infrastructure and tests whether AI models can extract
 * and recall brand information.
 *
 * Usage:
 *   npm run validate                                        # full run against localhost:4173
 *   npm run validate -- --skip-llm                          # infra only, no API key needed
 *   npm run validate -- --base-url https://franleplant.com  # against production
 */

import OpenAI from "openai";
import { brand } from "../src/data/brand.js";

// ── CLI Flags ──────────────────────────────────────────────

const args = process.argv.slice(2);

const BASE_URL = args.includes("--base-url")
  ? args[args.indexOf("--base-url") + 1]
  : "http://localhost:4173";

const SKIP_LLM = args.includes("--skip-llm");

// ── Models ─────────────────────────────────────────────────

const MODELS = [
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "google/gemini-2.0-flash-001", label: "Gemini Flash" },
];

// ── Result tracking ────────────────────────────────────────

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
  kind: "infra" | "extraction" | "baseline";
}

const results: CheckResult[] = [];

function check(
  name: string,
  passed: boolean,
  details: string,
  kind: CheckResult["kind"] = "infra"
) {
  results.push({ name, passed, details, kind });
  if (kind === "baseline") {
    const label = passed
      ? "\x1b[32m PASS \x1b[0m"
      : "\x1b[33m BASE \x1b[0m";
    console.log(`  ${label} ${name}`);
  } else {
    const label = passed
      ? "\x1b[32m PASS \x1b[0m"
      : "\x1b[31m FAIL \x1b[0m";
    console.log(`  ${label} ${name}`);
  }
  if (!passed && details) {
    console.log(`         ${details}`);
  }
}

// ── Helpers ────────────────────────────────────────────────

async function fetchText(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function fuzzyMatch(actual: string, expected: string): boolean {
  const a = normalize(actual);
  const e = normalize(expected);
  return a === e || a.includes(e) || e.includes(a);
}

function matchCount(actual: string[], expected: readonly string[]): number {
  return expected.filter((e) =>
    actual.some((a) => fuzzyMatch(a, e))
  ).length;
}

// ── Phase 1: Infrastructure Checks ────────────────────────

async function checkRobotsTxt() {
  const body = await fetchText("/robots.txt");
  if (!body) {
    check("robots.txt exists", false, "Could not fetch /robots.txt");
    return;
  }
  check("robots.txt exists", true, "");

  const aiCrawlers = ["GPTBot", "ClaudeBot", "PerplexityBot", "anthropic-ai"];
  const missing = aiCrawlers.filter((c) => !body.includes(c));
  check(
    "robots.txt has AI crawler rules",
    missing.length === 0,
    missing.length > 0 ? `Missing crawlers: ${missing.join(", ")}` : ""
  );

  check(
    "robots.txt links to sitemap",
    body.toLowerCase().includes("sitemap"),
    "No sitemap reference found"
  );
}

async function checkSitemapXml() {
  const body = await fetchText("/sitemap.xml");
  if (!body) {
    check("sitemap.xml exists", false, "Could not fetch /sitemap.xml");
    return;
  }
  check("sitemap.xml exists", true, "");

  const expectedUrls = [
    "https://franleplant.com",
    "https://franleplant.com/brand-facts",
  ];
  const missing = expectedUrls.filter((u) => !body.includes(u));
  check(
    "sitemap.xml lists expected URLs",
    missing.length === 0,
    missing.length > 0 ? `Missing URLs: ${missing.join(", ")}` : ""
  );
}

async function checkBrandFactsJson() {
  const body = await fetchText("/.well-known/brand-facts.json");
  if (!body) {
    check(
      ".well-known/brand-facts.json exists",
      false,
      "Could not fetch /.well-known/brand-facts.json"
    );
    return;
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(body);
    check(".well-known/brand-facts.json is valid JSON", true, "");
  } catch {
    check(
      ".well-known/brand-facts.json is valid JSON",
      false,
      "Invalid JSON response"
    );
    return;
  }

  const requiredFields = [
    "name",
    "url",
    "jobTitle",
    "description",
    "expertise",
    "technologies",
    "social",
  ];
  const missing = requiredFields.filter((f) => !(f in data));
  check(
    ".well-known/brand-facts.json has required fields",
    missing.length === 0,
    missing.length > 0 ? `Missing fields: ${missing.join(", ")}` : ""
  );
}

async function checkBrandFactsPage() {
  const body = await fetchText("/brand-facts");
  if (!body) {
    check("/brand-facts page returns 200", false, "Could not fetch /brand-facts");
    return;
  }
  check("/brand-facts page returns 200", true, "");

  check(
    "/brand-facts has JSON-LD",
    body.includes("application/ld+json"),
    "No application/ld+json script found"
  );

  check(
    "/brand-facts has FAQPage schema",
    body.includes("FAQPage"),
    "No FAQPage schema found"
  );

  check(
    "/brand-facts has ProfilePage schema",
    body.includes("ProfilePage"),
    "No ProfilePage schema found"
  );
}

async function checkHomePage() {
  const body = await fetchText("/");
  if (!body) {
    check("Home page returns 200", false, "Could not fetch /");
    return;
  }
  check("Home page returns 200", true, "");

  const metaChecks: [string, string][] = [
    ["description", 'name="description"'],
    ["og:title", 'property="og:title"'],
    ["og:description", 'property="og:description"'],
    ["og:image", 'property="og:image"'],
    ["twitter:card", 'name="twitter:card"'],
  ];

  for (const [name, pattern] of metaChecks) {
    check(
      `Home page has ${name} meta tag`,
      body.includes(pattern),
      `Missing ${pattern} in HTML`
    );
  }

  const jsonLdMatches = body.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  );
  check(
    "Home page has JSON-LD blocks",
    jsonLdMatches !== null && jsonLdMatches.length >= 2,
    `Found ${jsonLdMatches?.length ?? 0} JSON-LD blocks, expected >= 2`
  );

  if (jsonLdMatches) {
    for (let i = 0; i < jsonLdMatches.length; i++) {
      const content = jsonLdMatches[i]
        .replace(/<script type="application\/ld\+json">/, "")
        .replace(/<\/script>/, "");
      try {
        JSON.parse(content);
        check(`Home page JSON-LD block ${i + 1} is valid`, true, "");
      } catch (e) {
        check(`Home page JSON-LD block ${i + 1} is valid`, false, `Invalid JSON: ${e}`);
      }
    }
  }
}

// ── Phase 2: Content Extraction Test ──────────────────────

interface ExtractedFacts {
  name?: string;
  handle?: string;
  role?: string;
  location?: string;
  expertise?: string[];
  technologies?: string[];
  social?: string[];
}

async function runContentExtraction(
  client: OpenAI,
  modelId: string,
  modelLabel: string,
  siteContent: string
) {
  const prompt = `You are given HTML content and JSON data from a personal website. Extract the following brand facts as JSON (no markdown fences, just raw JSON):

{
  "name": "full name of the person",
  "handle": "their online handle/username",
  "role": "their job title or role",
  "location": "where they are based",
  "expertise": ["list", "of", "expertise", "areas"],
  "technologies": ["list", "of", "technologies"],
  "social": ["list", "of", "social", "media", "URLs"]
}

Here is the site content:

${siteContent}`;

  const response = await client.chat.completions.create({
    model: modelId,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content ?? "";

  // Try to parse JSON from the response — strip markdown fences if present
  const jsonStr = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
  let facts: ExtractedFacts;
  try {
    facts = JSON.parse(jsonStr);
  } catch {
    check(
      `[${modelLabel}] Valid JSON response`,
      false,
      `Could not parse: ${raw.slice(0, 120)}...`,
      "extraction"
    );
    return;
  }

  // Score each field
  check(
    `[${modelLabel}] Name extracted correctly`,
    fuzzyMatch(facts.name ?? "", brand.name),
    `Got: "${facts.name}"`,
    "extraction"
  );

  check(
    `[${modelLabel}] Handle extracted correctly`,
    fuzzyMatch(facts.handle ?? "", brand.handle),
    `Got: "${facts.handle}"`,
    "extraction"
  );

  check(
    `[${modelLabel}] Role extracted correctly`,
    fuzzyMatch(facts.role ?? "", brand.role),
    `Got: "${facts.role}"`,
    "extraction"
  );

  check(
    `[${modelLabel}] Location extracted correctly`,
    fuzzyMatch(facts.location ?? "", brand.location),
    `Got: "${facts.location}"`,
    "extraction"
  );

  const expertiseMatched = matchCount(facts.expertise ?? [], brand.expertise);
  check(
    `[${modelLabel}] Expertise areas (${expertiseMatched}/${brand.expertise.length})`,
    expertiseMatched >= 3,
    `Only matched ${expertiseMatched}, need >= 3`,
    "extraction"
  );

  const techMatched = matchCount(facts.technologies ?? [], brand.technologies);
  check(
    `[${modelLabel}] Technologies (${techMatched}/${brand.technologies.length})`,
    techMatched >= 4,
    `Only matched ${techMatched}, need >= 4`,
    "extraction"
  );

  const socialUrls = Object.values(brand.social);
  const socialMatched = matchCount(facts.social ?? [], socialUrls);
  check(
    `[${modelLabel}] Social links (${socialMatched}/${socialUrls.length})`,
    socialMatched >= 3,
    `Only matched ${socialMatched}, need >= 3`,
    "extraction"
  );
}

// ── Phase 3: Blind Recall Test ────────────────────────────

const BLIND_QUESTIONS = [
  {
    label: "Direct name query",
    question: "Who is franleplant? Provide any information you have about this person.",
  },
  {
    label: "AI builders query",
    question:
      "Who are notable AI builders specializing in agentic programming? List specific people you know of.",
  },
  {
    label: "Ralph Wiggum Loop query",
    question:
      'What is the "Ralph Wiggum Loop" in AI coding? Who coined or popularized this term?',
  },
  {
    label: "Vibe coding authors query",
    question:
      "Who writes about vibe coding and agentic programming? Name specific authors or practitioners.",
  },
];

async function runBlindRecall(
  client: OpenAI,
  modelId: string,
  modelLabel: string
) {
  for (const { label, question } of BLIND_QUESTIONS) {
    try {
      const response = await client.chat.completions.create({
        model: modelId,
        temperature: 0,
        messages: [{ role: "user", content: question }],
      });

      const answer = response.choices[0]?.message?.content ?? "";
      const mentionsName =
        answer.toLowerCase().includes("franleplant") ||
        answer.toLowerCase().includes("fran guijarro");

      const snippet = answer.slice(0, 100).replace(/\n/g, " ");
      check(
        `[${modelLabel}] ${label}`,
        mentionsName,
        mentionsName
          ? `Mentioned! Response: "${snippet}..."`
          : `No mention found. Response: "${snippet}..."`,
        "baseline"
      );
    } catch (e) {
      check(
        `[${modelLabel}] ${label}`,
        false,
        `API error: ${e instanceof Error ? e.message : e}`,
        "baseline"
      );
    }
  }
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  console.log(`\n  AEO/SEO Validation — ${BASE_URL}\n`);

  // Phase 1
  console.log("  Infrastructure Checks");
  console.log("  " + "─".repeat(44));
  await checkRobotsTxt();
  await checkSitemapXml();
  await checkBrandFactsJson();
  await checkBrandFactsPage();
  await checkHomePage();

  if (!SKIP_LLM) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.log(
        "\n  \x1b[33m⚠ OPENROUTER_API_KEY not set. Skipping LLM tests.\x1b[0m"
      );
      console.log("  Set it to run content extraction and blind recall tests.\n");
    } else {
      const client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      });

      // Fetch site content for extraction
      const [homeHtml, brandFactsHtml, brandFactsJson] = await Promise.all([
        fetchText("/"),
        fetchText("/brand-facts"),
        fetchText("/.well-known/brand-facts.json"),
      ]);

      const siteContent = [
        homeHtml ? `--- HOME PAGE HTML ---\n${homeHtml}` : "",
        brandFactsHtml ? `--- BRAND FACTS PAGE HTML ---\n${brandFactsHtml}` : "",
        brandFactsJson
          ? `--- BRAND FACTS JSON ---\n${brandFactsJson}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      // Phase 2: Content Extraction (parallel across models)
      const extractionResults = await Promise.allSettled(
        MODELS.map(async (model) => {
          console.log(`\n  Content Extraction: ${model.label}`);
          console.log("  " + "─".repeat(44));
          await runContentExtraction(client, model.id, model.label, siteContent);
        })
      );

      for (const result of extractionResults) {
        if (result.status === "rejected") {
          console.log(
            `  \x1b[31m FAIL \x1b[0m Model error: ${result.reason}`
          );
        }
      }

      // Phase 3: Blind Recall (parallel across models)
      console.log(`\n  Blind Recall (Baseline)`);
      console.log("  " + "─".repeat(44));

      const recallResults = await Promise.allSettled(
        MODELS.map((model) => runBlindRecall(client, model.id, model.label))
      );

      for (const result of recallResults) {
        if (result.status === "rejected") {
          console.log(
            `  \x1b[31m FAIL \x1b[0m Model error: ${result.reason}`
          );
        }
      }
    }
  }

  // Summary
  console.log(`\n  Summary`);
  console.log("  " + "═".repeat(44));

  const infraAndExtraction = results.filter(
    (r) => r.kind === "infra" || r.kind === "extraction"
  );
  const infraPassed = infraAndExtraction.filter((r) => r.passed).length;
  const infraTotal = infraAndExtraction.length;
  const infraFailed = infraTotal - infraPassed;

  const baseline = results.filter((r) => r.kind === "baseline");
  const baseRecognized = baseline.filter((r) => r.passed).length;
  const baseTotal = baseline.length;

  console.log(
    `  Infrastructure + Extraction: ${infraPassed}/${infraTotal} passed` +
      (infraFailed > 0
        ? ` \x1b[31m(${infraFailed} failed)\x1b[0m`
        : " \x1b[32m(all green)\x1b[0m")
  );

  if (baseTotal > 0) {
    console.log(
      `  Blind Recall Baseline:       ${baseRecognized}/${baseTotal} recognized` +
        (baseRecognized === 0
          ? " \x1b[33m(expected at launch)\x1b[0m"
          : "")
    );
  }

  console.log();

  // Exit code: only infra + extraction failures count
  process.exit(infraFailed > 0 ? 1 : 0);
}

main();
