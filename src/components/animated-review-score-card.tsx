'use client'

import {useEffect, useState} from 'react'
import type {Review} from '@/types/content'
import {GoogleMark} from '@/components/google-review-card'

type Props = {
  aggregateRating: number
  review: Review
  reviewCount?: number
}

export function AnimatedReviewScoreCard({aggregateRating, review, reviewCount}: Props) {
  const quote = review.quote.trim()
  const starRating = Math.max(1, Math.min(5, Math.round(review.rating || aggregateRating)))
  const [typedLength, setTypedLength] = useState(0)
  const [visibleStars, setVisibleStars] = useState(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      const reducedMotionTimer = window.setTimeout(() => {
        setTypedLength(quote.length)
        setVisibleStars(starRating)
      }, 0)
      return () => window.clearTimeout(reducedMotionTimer)
    }

    let starTimer: number | undefined
    const typingTimer = window.setInterval(() => {
      setTypedLength((current) => {
        if (current >= quote.length) {
          window.clearInterval(typingTimer)
          return current
        }
        return current + 1
      })
    }, 24)

    const starsStart = window.setTimeout(() => {
      let nextStar = 0
      starTimer = window.setInterval(() => {
        nextStar += 1
        setVisibleStars(Math.min(nextStar, starRating))
        if (nextStar >= starRating) window.clearInterval(starTimer)
      }, 170)
    }, quote.length * 24 + 180)

    return () => {
      window.clearInterval(typingTimer)
      window.clearTimeout(starsStart)
      if (starTimer) window.clearInterval(starTimer)
    }
  }, [quote, starRating])

  return (
    <aside
      className="review-score-card review-motion-card"
      aria-label={`Google review from ${review.author || 'a Highlights Chicago customer'}. ${quote} Rated ${starRating} out of 5 stars. Overall rating ${aggregateRating.toFixed(1)} out of 5.`}
    >
      <div className="review-motion-heading">
        <span className="review-motion-google"><GoogleMark large /></span>
        <span><b>Google review</b><small>Verified customer feedback</small></span>
        <i aria-hidden="true" />
      </div>

      <div className="review-motion-copy" aria-hidden="true">
        <span className="review-motion-quote-mark">“</span>
        <p>{quote.slice(0, typedLength)}<span className="review-motion-cursor" /></p>
      </div>

      <div className={`review-motion-footer${visibleStars === starRating ? ' is-complete' : ''}`} aria-hidden="true">
        <div>
          <strong>{review.author || 'Chicago homeowner'}</strong>
          <span>Local Guide · Google</span>
        </div>
        <div className="review-motion-stars">
          {Array.from({length: 5}, (_, index) => (
            <span className={index < visibleStars ? 'is-visible' : ''} key={index}>★</span>
          ))}
        </div>
      </div>

      <div className="review-motion-proof">
        <span><b>{aggregateRating.toFixed(1)}</b>/5 average</span>
        <span>{reviewCount ? `${reviewCount} reviews` : 'Verified on Google'}</span>
      </div>
    </aside>
  )
}
