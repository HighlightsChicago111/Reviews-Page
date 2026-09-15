'use client'

import {useEffect, useRef, useState} from 'react'
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
  const [mobileRail, setMobileRail] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const manualScrollPauseUntil = useRef(0)
  const stories = footage.map((item, index) => ({...item, review: reviews[index]})).filter((item) => item.review)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 620px)')
    const update = () => setMobileRail(media.matches)
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

  useEffect(() => {
    if (reduceMotion) return

    const viewport = viewportRef.current
    if (!viewport || !mobileRail) return

    const timer = window.setInterval(() => {
      if (Date.now() < manualScrollPauseUntil.current) return

      const cards = Array.from(viewport.querySelectorAll<HTMLElement>('.review-video-group:first-child .review-video-card'))
      if (!cards.length) return

      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2
      const currentIndex = cards.reduce((closest, card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const closestCenter = cards[closest].offsetLeft + cards[closest].offsetWidth / 2
        return Math.abs(cardCenter - viewportCenter) < Math.abs(closestCenter - viewportCenter) ? index : closest
      }, 0)
      const next = cards[(currentIndex + 1) % cards.length]
      const nextLeft = next.offsetLeft - (viewport.clientWidth - next.offsetWidth) / 2
      viewport.scrollTo({left: Math.max(0, nextLeft), behavior: 'smooth'})
    }, 4200)

    return () => window.clearInterval(timer)
  }, [mobileRail, reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const videos = viewportRef.current?.querySelectorAll<HTMLVideoElement>('video')
    videos?.forEach((video) => {
      video.muted = true
      void video.play().catch(() => undefined)
    })
  }, [reduceMotion])

  if (!stories.length) return null
  const selected = active === null ? null : stories[active]
  const pauseMobileAutoScroll = () => {
    manualScrollPauseUntil.current = Date.now() + 8000
  }

  return (
    <section className="review-video-showcase" aria-labelledby="video-review-heading">
      <div className="collection-wrap review-video-heading">
        <h2 id="video-review-heading">See the work behind their words</h2>
      </div>

      <div
        className="review-video-viewport"
        onPointerDown={pauseMobileAutoScroll}
        onTouchStart={pauseMobileAutoScroll}
        onWheel={pauseMobileAutoScroll}
        ref={viewportRef}
      >
        <div className={`review-video-track${reduceMotion ? ' is-static' : ''}`}>
          {[0, 1].map((group) => (
            <div className="review-video-group" key={group} aria-hidden={group === 1}>
              {stories.map((story, index) => (
                <button
                  className="review-video-card"
                  key={`${group}-${story.review.sourceId || story.src}`}
                  onClick={() => setActive(index)}
                  tabIndex={group === 1 ? -1 : 0}
                  type="button"
                  aria-label={`Open ${story.review.author || 'customer'} video`}
                >
                  <video
                    autoPlay={!reduceMotion}
                    loop
                    muted
                    playsInline
                    poster={story.poster}
                    preload="auto"
                    aria-hidden="true"
                  >
                    <source src={story.src} type="video/mp4" />
                  </video>
                  <span className="review-video-shade" aria-hidden="true" />
                  <span className="review-video-copy">
                    <span className="review-video-stars" aria-label={`${story.review.rating || 5} out of 5 stars`}>
                      {'★'.repeat(Math.round(story.review.rating || 5))}
                    </span>
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
          <div className="review-video-modal" role="dialog" aria-modal="true" aria-label="Service video preview">
            <button className="review-video-close" onClick={() => setActive(null)} type="button" aria-label="Close video">×</button>
            <div className="review-video-modal-media">
              <video autoPlay controls playsInline poster={selected.poster} preload="auto">
                <source src={selected.src} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
