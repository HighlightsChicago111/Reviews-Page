import type {Metadata} from 'next'
import Image from 'next/image'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {GoogleRating} from '@/components/google-review-card'
import {ReviewCollection} from '@/components/review-collection'
import {sanityFetch} from '@/sanity/lib/live'
import {REVIEW_COLLECTION_QUERY} from '@/sanity/lib/queries'
import type {ReviewCollectionData} from '@/types/content'

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
  const reviewCardCount = new Set(
    pages.flatMap((page) => page.reviews.map((review) => review.sourceId || review.sourceUrl || `${review.author || 'anonymous'}::${review.quote}`)),
  ).size
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
            <aside className="review-score-card" aria-label="Highlights Chicago Google review score">
              <span>Google customer rating</span>
              <strong>{aggregateRating.toFixed(1)}</strong>
              <GoogleRating rating={aggregateRating} />
              <p><b>{typed.settings?.google?.reviewCount || 494}</b> public Google reviews</p>
              <p><b>{reviewCardCount}</b> searchable review cards in this library</p>
            </aside>
          </div>
        </section>
        <ReviewCollection pages={pages} aggregateRating={aggregateRating} activeYear={single(params.year)} activeRating={single(params.rating)} />
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
