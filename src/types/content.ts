export type Review = {
  _key?: string
  quote: string
  author?: string
  location?: string
  reviewDate?: string
  rating?: number
  sourceUrl?: string
  sourceId?: string
}

export type ReviewCollectionItem = {
  _id: string
  serviceSlug: string
  areaSlug: string
  serviceName: string
  parentName?: string
  monthlySearchVolume?: number
  cardImage?: string
  cardImageAlt?: string
  reviews: Review[]
}

export type ReviewSettings = {
  companyName?: string
  siteUrl?: string
  phoneDisplay?: string
  phoneE164?: string
  google?: {rating?: number; reviewCount?: number; reviewsUrl?: string}
  reviewsDisclaimer?: string
} | null

export type ReviewCollectionData = {pages: ReviewCollectionItem[]; settings: ReviewSettings}
export type ReviewServiceData = {page: ReviewCollectionItem | null; settings: ReviewSettings}

