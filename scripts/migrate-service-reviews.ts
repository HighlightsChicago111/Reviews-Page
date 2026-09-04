import {createClient} from 'next-sanity'

const projectId = process.env.NEXT_SANITY_PROJECT_ID || '5w5623jq'
const dataset = process.env.NEXT_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) throw new Error('SANITY_API_WRITE_TOKEN is required')

const client = createClient({projectId, dataset, apiVersion: '2026-03-01', token, useCdn: false})

type LegacyPage = {
  serviceSlug: string
  areaSlug: string
  serviceName: string
  parentName?: string
  monthlySearchVolume?: number
  cardImage?: string
  cardImageAlt?: string
  reviews: unknown[]
}

const pages = await client.fetch<LegacyPage[]>(`*[
  _type == "servicePage" && defined(service->slug.current) && count(reviews) > 0
] {
  "serviceSlug": service->slug.current,
  "areaSlug": area->slug.current,
  "serviceName": service->name,
  "parentName": service->parentName,
  "monthlySearchVolume": service->monthlySearchVolume,
  "cardImage": coalesce(gallery[0].externalUrl, workingPhotos[0].externalUrl),
  "cardImageAlt": coalesce(gallery[0].alt, workingPhotos[0].alt),
  reviews
}`)

let transaction = client.transaction()
for (const page of pages) {
  transaction = transaction.createIfNotExists({
    _id: `reviewCollection-${page.serviceSlug}`,
    _type: 'reviewCollection',
    serviceName: page.serviceName,
    slug: {_type: 'slug', current: page.serviceSlug},
    parentName: page.parentName,
    areaSlug: page.areaSlug || 'chicago',
    monthlySearchVolume: page.monthlySearchVolume,
    externalCardImage: page.cardImage,
    cardImageAlt: page.cardImageAlt,
    reviews: page.reviews,
  })
}

const result = await transaction.commit()
console.log(`Created or retained ${pages.length} review collections in transaction ${result.transactionId}`)

