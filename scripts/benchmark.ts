/**
 * AEO/SEO Benchmark Script
 *
 * Validates that all AEO (Answer Engine Optimization) and SEO artifacts
 * are properly configured and accessible.
 *
 * Usage: npm run benchmark
 * Options: --no-lighthouse  Skip Lighthouse audit
 *          --base-url URL   Override base URL (default: http://localhost:4173)
 */

const BASE_URL = process.argv.includes("--base-url")
  ? process.argv[process.argv.indexOf("--base-url") + 1]
  : "http://localhost:4173";

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

function check(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const icon = passed ? "\x1b[32m PASS \x1b[0m" : "\x1b[31m FAIL \x1b[0m";
  console.log(`${icon} ${name}`);
  if (!passed) {
    console.log(`       ${details}`);
  }
}

async function fetchText(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

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
    check(
      "/brand-facts page returns 200",
      false,
      "Could not fetch /brand-facts"
    );
    return;
  }
  check("/brand-facts page returns 200", true, "");

  const hasJsonLd = body.includes("application/ld+json");
  check(
    "/brand-facts has JSON-LD",
    hasJsonLd,
    "No application/ld+json script found"
  );

  const hasFaqSchema = body.includes("FAQPage");
  check(
    "/brand-facts has FAQPage schema",
    hasFaqSchema,
    "No FAQPage schema found"
  );

  const hasProfileSchema = body.includes("ProfilePage");
  check(
    "/brand-facts has ProfilePage schema",
    hasProfileSchema,
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

  // Check meta tags
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

  // Check JSON-LD
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
        check(
          `Home page JSON-LD block ${i + 1} is valid`,
          false,
          `Invalid JSON: ${e}`
        );
      }
    }
  }
}

async function main() {
  console.log(`\n  AEO/SEO Benchmark — ${BASE_URL}\n`);
  console.log("─".repeat(50));

  await checkRobotsTxt();
  await checkSitemapXml();
  await checkBrandFactsJson();
  await checkBrandFactsPage();
  await checkHomePage();

  console.log("─".repeat(50));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(
    `\n  Results: ${passed}/${total} passed` +
      (failed > 0 ? `, \x1b[31m${failed} failed\x1b[0m` : " \x1b[32mall green\x1b[0m") +
      "\n"
  );

  process.exit(failed > 0 ? 1 : 0);
}

main();
