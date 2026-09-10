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
  const keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
  const activeKey = quote.slice(Math.max(0, typedLength - 1), typedLength).toUpperCase()

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
    let typingTimer: number | undefined
    const starsStart = window.setTimeout(() => {
      let nextStar = 0
      starTimer = window.setInterval(() => {
        nextStar += 1
        setVisibleStars(Math.min(nextStar, starRating))
        if (nextStar >= starRating) window.clearInterval(starTimer)
      }, 145)
    }, 280)

    const typingStart = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        setTypedLength((current) => {
          if (current >= quote.length) {
            if (typingTimer) window.clearInterval(typingTimer)
            return current
          }
          return current + 1
        })
      }, 22)
    }, 1120)

    return () => {
      if (typingTimer) window.clearInterval(typingTimer)
      window.clearTimeout(starsStart)
      window.clearTimeout(typingStart)
      if (starTimer) window.clearInterval(starTimer)
    }
  }, [quote, starRating])

  return (
    <aside
      className="review-score-card review-motion-card"
      aria-label={`Google review from ${review.author || 'a Highlights Chicago customer'}. ${quote} Rated ${starRating} out of 5 stars. Overall rating ${aggregateRating.toFixed(1)} out of 5.`}
    >
      <div className="review-phone-shell" aria-hidden="true">
        <div className="review-phone-status"><b>9:41</b><span>● Wi-Fi ▰</span></div>
        <div className="review-motion-heading">
          <span className="review-motion-google"><GoogleMark large /></span>
          <span><b>Share your experience</b><small>Highlights Chicago</small></span>
          <i>•••</i>
        </div>

        <div className="review-phone-reviewer">
          <span>{(review.author || 'C').slice(0, 1)}</span>
          <div><strong>{review.author || 'Chicago homeowner'}</strong><small>Posting publicly on Google</small></div>
        </div>

        <div className="review-motion-stars">
          {Array.from({length: 5}, (_, index) => <span className={index < visibleStars ? 'is-visible' : ''} key={index}>★</span>)}
        </div>

        <div className="review-motion-copy">
          <p>{quote.slice(0, typedLength)}<span className="review-motion-cursor" /></p>
        </div>

        <div className="review-phone-keyboard">
          {keyboardRows.map((row) => (
            <div key={row}>{[...row].map((key) => <span className={activeKey === key ? 'is-active' : ''} key={key}>{key}</span>)}</div>
          ))}
          <div className="review-phone-keyboard-bottom"><span>123</span><span className="review-phone-space">space</span><span>return</span></div>
        </div>

        <div className="review-phone-actions">
          <span>Cancel</span><b className={typedLength === quote.length ? 'is-ready' : ''}>Post</b>
        </div>
      </div>

      <div className="review-motion-proof">
        <span><GoogleMark /><b>{aggregateRating.toFixed(1)}</b>/5 Google rating</span>
        <span>{reviewCount ? `${reviewCount} public reviews` : 'Verified on Google'}</span>
      </div>
    </aside>
  )
}
