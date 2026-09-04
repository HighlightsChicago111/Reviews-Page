import type {MetadataRoute} from 'next'
import {metadataClient} from '@/sanity/lib/client'
import {REVIEW_SERVICE_SLUGS_QUERY} from '@/sanity/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await metadataClient.fetch(REVIEW_SERVICE_SLUGS_QUERY) as string[]
  const now = new Date()
  return [
    {url: 'https://www.highlightschicago.com/reviews', lastModified: now, changeFrequency: 'weekly', priority: 0.9},
    ...slugs.map((slug) => ({url: `https://www.highlightschicago.com/reviews/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7})),
  ]
}

