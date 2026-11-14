import type {MetadataRoute} from 'next'
import {metadataClient} from '@/sanity/lib/client'
import {REVIEW_SERVICE_SLUGS_QUERY} from '@/sanity/lib/queries'

// Rebuilt at most hourly, as in the services and service area apps. Without this the sitemap was
// frozen at deploy time and kept listing review pages after their reviews were removed in Sanity.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await metadataClient.fetch(REVIEW_SERVICE_SLUGS_QUERY) as string[]
  const now = new Date()
  return [
    {url: 'https://www.highlightschicago.com/reviews', lastModified: now, changeFrequency: 'weekly', priority: 0.9},
    ...slugs.map((slug) => ({url: `https://www.highlightschicago.com/reviews/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7})),
  ]
}

