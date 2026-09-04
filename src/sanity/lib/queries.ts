import {defineQuery} from 'next-sanity'

const REVIEW_FIELDS = `_key, quote, author, location, reviewDate, rating, sourceUrl, sourceId`

const DEDICATED_COLLECTION_FIELDS = `
  _id,
  "serviceSlug": slug.current,
  "areaSlug": coalesce(areaSlug, "chicago"),
  serviceName,
  parentName,
  monthlySearchVolume,
  "cardImage": coalesce(cardImage.asset->url, externalCardImage),
  cardImageAlt,
  reviews[]{${REVIEW_FIELDS}}
`

const LEGACY_SERVICE_FIELDS = `
  _id,
  "serviceSlug": service->slug.current,
  "areaSlug": area->slug.current,
  "serviceName": service->name,
  "parentName": service->parentName,
  "monthlySearchVolume": service->monthlySearchVolume,
  "cardImage": coalesce(gallery[0].image.asset->url, gallery[0].externalUrl, workingPhotos[0].image.asset->url, workingPhotos[0].externalUrl),
  "cardImageAlt": coalesce(gallery[0].alt, workingPhotos[0].alt),
  reviews[]{${REVIEW_FIELDS}}
`

const SETTINGS_FIELDS = `companyName, siteUrl, phoneDisplay, phoneE164, google, reviewsDisclaimer`

export const REVIEW_COLLECTION_QUERY = defineQuery(`{
  "pages": select(
    count(*[_type == "reviewCollection" && defined(slug.current) && count(reviews) > 0]) > 0 =>
      *[_type == "reviewCollection" && defined(slug.current) && count(reviews) > 0] | order(monthlySearchVolume desc, serviceName asc) {${DEDICATED_COLLECTION_FIELDS}},
    *[_type == "servicePage" && defined(service->slug.current) && defined(area->slug.current) && count(reviews) > 0] | order(service->monthlySearchVolume desc) {${LEGACY_SERVICE_FIELDS}}
  ),
  "settings": *[_id == "siteSettings"][0] {${SETTINGS_FIELDS}}
}`)

export const REVIEW_SERVICE_QUERY = defineQuery(`{
  "page": coalesce(
    *[_type == "reviewCollection" && slug.current == $serviceSlug && count(reviews) > 0][0] {${DEDICATED_COLLECTION_FIELDS}},
    *[_type == "servicePage" && service->slug.current == $serviceSlug && count(reviews) > 0][0] {${LEGACY_SERVICE_FIELDS}}
  ),
  "settings": *[_id == "siteSettings"][0] {${SETTINGS_FIELDS}}
}`)

export const REVIEW_SERVICE_SLUGS_QUERY = defineQuery(`array::unique([
  ...*[_type == "reviewCollection" && defined(slug.current) && count(reviews) > 0].slug.current,
  ...*[_type == "servicePage" && defined(service->slug.current) && count(reviews) > 0].service->slug.current
])`)

