import type {Metadata} from 'next'
import Image from 'next/image'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {ReviewCollection} from '@/components/review-collection'
import {VideoReviewShowcase} from '@/components/video-review-showcase'
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
  const videoReviews = ['R198', 'R196', 'R289']
    .map((sourceId) => reviews.find((review) => review.sourceId === sourceId))
    .filter((review): review is Review => Boolean(review))
  return (
    <div className="collection-page review-page">
      <CollectionHeader />
      <main>
        <section className="review-hero">
          <div className="review-hero-breadcrumb-wrap">
            <nav className="review-breadcrumb" aria-label="Breadcrumb"><a href="https://www.highlightschicago.com/">Home</a><span>/</span><strong>Reviews</strong></nav>
          </div>
          <div className="collection-wrap">
            <div className="review-hero-grid">
              <div className="review-hero-visual">
                <Image
                  className="review-hero-cutout"
                  src="/reviews/images/highlights-team-van-hero-v3.png"
                  alt="A HighlightsChicago electrician speaking with a customer beside a service van"
                  width={1678}
                  height={937}
                  priority
                  sizes="(max-width: 850px) 100vw, 58vw"
                />
              </div>
              <div className="review-hero-copy">
                <h1>See why Chicago<br />chooses us</h1>
                <p>Read real Google reviews from homeowners who trusted HighlightsChicago for safe, careful electrical work—from everyday repairs to lighting, panels, EV chargers, and more.</p>
                <div className="review-hero-actions"><a href="#review-directory-title">Read customer reviews</a>{typed.settings?.google?.reviewsUrl && <a href={typed.settings.google.reviewsUrl} target="_blank" rel="noreferrer">See all Google reviews</a>}</div>
              </div>
            </div>
          </div>
        </section>
        <VideoReviewShowcase reviews={videoReviews} />
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
