import type {CSSProperties} from 'react'
import type {Metadata} from 'next'
import Image from 'next/image'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {GoogleMark} from '@/components/google-review-card'
import {ReviewCollection} from '@/components/review-collection'
import fullGoogleReviews from '@/data/full-google-reviews.json'
import {sanityFetch} from '@/sanity/lib/live'
import {REVIEW_COLLECTION_QUERY} from '@/sanity/lib/queries'
import type {Review, ReviewCollectionData} from '@/types/content'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Chicago Electrician Reviews | Highlights Chicago',
  description: 'Read Highlights Chicago customer reviews directly, filter them by Google rating, year, or electrical service, and open every original review on Google.',
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
  const ratingStyle = {
    '--score-pct': `${Math.max(0, Math.min(100, aggregateRating * 20))}%`,
    '--pct': `${Math.max(0, Math.min(100, aggregateRating * 20))}%`,
  } as CSSProperties
  return (
    <div className="collection-page review-page">
      <CollectionHeader />
      <main>
        <section className="review-hero">
          <Image className="review-hero-image" src="/reviews/images/reviews/highlight-chicago-main.webp" alt="" fill priority sizes="100vw" aria-hidden="true" />
          <div className="collection-wrap review-hero-grid">
            <div>
              <nav className="review-breadcrumb" aria-label="Breadcrumb"><a href="https://www.highlightschicago.com/">Home</a><span>/</span><strong>Reviews</strong></nav>
              <p className="collection-hero-kicker">Verified customer feedback</p>
              <h1>Chicago electrical reviews, all in one place</h1>
              <p>Read the customer review cards directly on this page. Filter them instantly by rating, year, or electrical service, then verify any excerpt at its original Google source.</p>
              <div className="review-hero-actions"><a href="#review-directory-title">Read all review cards</a>{typed.settings?.google?.reviewsUrl && <a href={typed.settings.google.reviewsUrl} target="_blank" rel="noreferrer">See all reviews on Google</a>}</div>
            </div>
            <aside className="review-score-card" aria-label={`Google rating ${aggregateRating.toFixed(1)} out of 5`} style={ratingStyle}>
              <div className="review-score-gauge">
                <div className="review-score-gauge-inner">
                  <GoogleMark large />
                  <div className="review-score-value"><strong>{aggregateRating.toFixed(1)}</strong><span>/5</span></div>
                </div>
              </div>
              <div className="review-score-stars" aria-label={`${aggregateRating.toFixed(1)} out of 5 stars`}>
                <span aria-hidden="true">★★★★★</span>
              </div>
            </aside>
          </div>
        </section>
        <ReviewCollection pages={pages} reviews={fullGoogleReviews as Review[]} aggregateRating={aggregateRating} activeYear={single(params.year)} activeRating={single(params.rating)} />
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
