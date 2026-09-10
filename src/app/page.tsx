import type {Metadata} from 'next'
import Image from 'next/image'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {AnimatedReviewScoreCard} from '@/components/animated-review-score-card'
import {ReviewCollection} from '@/components/review-collection'
import fullGoogleReviews from '@/data/full-google-reviews.json'
import {sanityFetch} from '@/sanity/lib/live'
import {REVIEW_COLLECTION_QUERY} from '@/sanity/lib/queries'
import type {Review, ReviewCollectionData} from '@/types/content'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Customer Reviews | Highlights Chicago Electricians',
  description: 'Before you hire Highlights Chicago, hear from the homeowners who already did. Explore verified Google reviews about our electrical work, communication, cleanliness, and care.',
  alternates: {canonical: 'https://www.highlightschicago.com/reviews'},
}

type Props = {searchParams: Promise<Record<string, string | string[] | undefined>>}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ReviewsPage({searchParams}: Props) {
  const [{data}, params] = await Promise.all([
    sanityFetch({query: REVIEW_COLLECTION_QUERY, stega: false}),
    searchParams,
  ])
  const typed = data as ReviewCollectionData
  const pages = typed.pages || []
  const aggregateRating = typed.settings?.google?.rating || 4.9
  const reviews = fullGoogleReviews as Review[]
  const heroReviewIds = new Set(['R002', 'R003', 'R019'])
  const heroReviews = reviews.filter((review) => heroReviewIds.has(review.sourceId || ''))
  const ratingCounts = reviews.reduce<Record<number, number>>((counts, review) => {
    const rating = Math.max(1, Math.min(5, Math.round(review.rating || aggregateRating)))
    counts[rating] = (counts[rating] || 0) + 1
    return counts
  }, {})
  return (
    <div className="collection-page review-page">
      <CollectionHeader />
      <main>
        <section className="review-hero">
          <Image className="review-hero-image" src="/reviews/images/reviews/highlight-chicago-main.webp" alt="" fill priority sizes="100vw" aria-hidden="true" />
          <div className="collection-wrap review-hero-grid">
            <div>
              <nav className="review-breadcrumb" aria-label="Breadcrumb"><a href="https://www.highlightschicago.com/">Home</a><span>/</span><strong>Reviews</strong></nav>
              <p className="collection-hero-kicker">Real Chicago homes. Real customer stories.</p>
              <h1>Before you hire us, hear from the people who already did</h1>
              <p>Explore verified Google reviews from Chicago homeowners who trusted Highlights with repairs, lighting, panels, EV chargers, and more. Filter every real customer story by rating, year, or service.</p>
              <div className="review-hero-actions"><a href="#review-directory-title">Read customer reviews</a>{typed.settings?.google?.reviewsUrl && <a href={typed.settings.google.reviewsUrl} target="_blank" rel="noreferrer">See all reviews on Google</a>}</div>
            </div>
            {heroReviews.length > 0 && <AnimatedReviewScoreCard aggregateRating={aggregateRating} reviews={heroReviews} reviewCount={typed.settings?.google?.reviewCount || 494} ratingCounts={ratingCounts} />}
          </div>
        </section>
        <ReviewCollection pages={pages} reviews={reviews} aggregateRating={aggregateRating} activeYear={single(params.year)} activeRating={single(params.rating)} />
        <section className="review-proof-band">
          <div className="collection-wrap">
            <div><span>Source transparency</span><strong>Every excerpt links to Google</strong></div>
            <div><span>Useful context</span><strong>Browse by service and year</strong></div>
            <div><span>Local experience</span><strong>Serving Chicagoland for 12+ years</strong></div>
          </div>
        </section>
      </main>
      <CollectionFooter />
    </div>
  )
}
