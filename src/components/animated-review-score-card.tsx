import type {CSSProperties} from 'react'
import type {Review} from '@/types/content'
import {GoogleMark} from '@/components/google-review-card'

type Props = {
  aggregateRating: number
  reviews: Review[]
  reviewCount?: number
  ratingCounts: Record<number, number>
}

const RATINGS = [5, 4, 3, 2, 1]
const AVATAR_COLORS = ['#8e43d0', '#ec407a', '#2878b8']

export function AnimatedReviewScoreCard({aggregateRating, reviews, reviewCount, ratingCounts}: Props) {
  const highlights = reviews.slice(0, 3)
  const libraryTotal = Object.values(ratingCounts).reduce((total, count) => total + count, 0)

  return (
    <aside
      className="review-score-card review-summary-card"
      aria-label={`Google review summary. Overall rating ${aggregateRating.toFixed(1)} out of 5 from ${reviewCount || libraryTotal} reviews. Featured reviewers: ${highlights.map((review) => review.author).filter(Boolean).join(', ')}.`}
    >
      <header className="review-summary-heading">
        <span><GoogleMark large /><b>Review summary</b></span>
        <i>?</i>
      </header>

      <div className="review-summary-overview">
        <div className="review-summary-bars">
          {RATINGS.map((rating) => {
            const percentage = libraryTotal > 0 ? ((ratingCounts[rating] || 0) / libraryTotal) * 100 : 0
            return (
              <div key={rating}>
                <span>{rating}</span>
                <i><b style={{'--bar-width': `${Math.max(ratingCounts[rating] ? 1 : 0, percentage)}%`} as CSSProperties} /></i>
              </div>
            )
          })}
        </div>

        <div className="review-summary-score">
          <strong>{aggregateRating.toFixed(1)}</strong>
          <span aria-label={`${aggregateRating.toFixed(1)} out of 5 stars`}>★★★★★</span>
          <b>{reviewCount || libraryTotal} reviews</b>
        </div>
      </div>

      <div className="review-summary-list">
        {highlights.map((review, index) => (
          <article key={review.sourceId || `${review.author}-${index}`}>
            <span style={{backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length]}}>{(review.author || 'G').slice(0, 1).toUpperCase()}</span>
            <p>“{review.quote}”</p>
          </article>
        ))}
      </div>

      <div className="review-summary-more">More reviews <span>↓</span></div>
    </aside>
  )
}
