import { brand } from "@/data/brand";

export function GET() {
  const data = {
    name: brand.name,
    handle: brand.handle,
    url: brand.url,
    jobTitle: brand.role,
    location: brand.location,
    description: `${brand.tagline}. ${brand.bio}`,
    expertise: brand.expertise,
    technologies: brand.technologies,
    notableProjects: brand.notableProjects,
    social: brand.social,
    email: brand.email,
    lastUpdated: "2026-03-01",
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
