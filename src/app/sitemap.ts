import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://franleplant.com",
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://franleplant.com/brand-facts",
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
