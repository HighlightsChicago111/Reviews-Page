'use client'

import {useEffect, useState} from 'react'
import type {Review} from '@/types/content'

type Props = {reviews: Review[]}

const footage = [
  {
    poster: '/reviews/images/services/light-fixture-installation-and-replacement.jpg',
    src: 'https://videos.pexels.com/video-files/5391403/5391403-uhd_2560_1440_30fps.mp4',
  },
  {
    poster: '/reviews/images/services/electrical-outlet-installation.jpg',
    src: 'https://videos.pexels.com/video-files/18780266/18780266-uhd_2560_1440_30fps.mp4',
  },
  {
    poster: '/reviews/images/services/electrical-troubleshooting.jpg',
    src: 'https://videos.pexels.com/video-files/8487126/8487126-uhd_2560_1440_30fps.mp4',
  },
]

function excerpt(value: string, limit = 150) {
  if (value.length <= limit) return value
  return `${value.slice(0, limit).trimEnd()}…`
}

export function VideoReviewShowcase({reviews}: Props) {
  const [active, setActive] = useState<number | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const stories = footage.map((item, index) => ({...item, review: reviews[index]})).filter((item) => item.review)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (active === null) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [active])

  if (!stories.length) return null
  const selected = active === null ? null : stories[active]

  return (
    <section className="review-video-showcase" aria-labelledby="video-review-heading">
      <div className="collection-wrap review-video-heading">
        <h2 id="video-review-heading">See the work behind their words</h2>
      </div>

      <div className="review-video-viewport">
        <div className={`review-video-track${reduceMotion ? ' is-static' : ''}`}>
          {[0, 1].map((group) => (
            <div className="review-video-group" key={group} aria-hidden={group === 1}>
              {stories.map((story, index) => (
                <button
                  className="review-video-card"
                  key={`${group}-${story.review.sourceId || index}`}
                  onClick={() => setActive(index)}
                  tabIndex={group === 1 ? -1 : 0}
                  type="button"
                  aria-label={`Open ${story.review.author || 'customer'} review story`}
                >
                  <video
                    autoPlay={!reduceMotion}
                    loop
                    muted
                    playsInline
                    poster={story.poster}
                    preload="metadata"
                    aria-hidden="true"
                  >
                    <source src={story.src} type="video/mp4" />
                  </video>
                  <span className="review-video-shade" />
                  <span className="review-video-play" aria-hidden="true">▶</span>
                  <span className="review-video-copy">
                    <span className="review-video-stars" aria-label={`${story.review.rating || 5} out of 5 stars`}>★★★★★</span>
                    <q>{excerpt(story.review.quote)}</q>
                    <strong>{story.review.author || 'Google reviewer'}</strong>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="review-video-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setActive(null)}>
          <div className="review-video-modal" role="dialog" aria-modal="true" aria-labelledby="review-video-modal-title">
            <button className="review-video-close" onClick={() => setActive(null)} type="button" aria-label="Close video review">×</button>
            <div className="review-video-modal-media">
              <video controls playsInline poster={selected.poster} preload="metadata">
                <source src={selected.src} type="video/mp4" />
              </video>
            </div>
            <div className="review-video-modal-copy">
              <p className="collection-hero-kicker">Verified Google feedback</p>
              <h3 id="review-video-modal-title">{selected.review.author || 'Google reviewer'}</h3>
              <span className="review-video-stars" aria-label={`${selected.review.rating || 5} out of 5 stars`}>★★★★★</span>
              <blockquote>{selected.review.quote}</blockquote>
              <div className="review-video-modal-links">
                {selected.review.sourceUrl && <a href={selected.review.sourceUrl} target="_blank" rel="noreferrer">View original Google review</a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
