'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import type {Review, ReviewCollectionItem} from '@/types/content'
import {GoogleRating} from './google-review-card'

type Props = {
  pages: ReviewCollectionItem[]
  reviews?: Review[]
  aggregateRating: number
  activeYear?: string
  activeRating?: string
}

type AppliedFilter = {
  key: string
  label: string
  remove: () => void
}

type ReviewService = {
  slug: string
  name: string
  parentName?: string
}

type ReviewEntry = {
  id: string
  review: Review
  services: ReviewService[]
}

const STAR_RATINGS = [5, 4, 3, 2, 1]

function reviewDateValue(review: Review): string | undefined {
  const value = review.reviewDate || review.location
  return /^20\d{2}-\d{2}-\d{2}$/.test(value || '') ? value : undefined
}

function reviewYear(review: Review): string | undefined {
  return reviewDateValue(review)?.slice(0, 4)
}

function reviewIdentity(review: Review) {
  return review.sourceId || review.sourceUrl || `${review.author || 'anonymous'}::${review.quote}`
}

function reviewRating(review: Review, aggregateRating: number) {
  return Math.max(1, Math.min(5, Math.round(review.rating ?? aggregateRating)))
}

function toggleValue(value: string, current: string[], update: (next: string[]) => void) {
  update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
}

type FacetName = 'rating' | 'years' | 'equipment'

export function ReviewCollection({pages, reviews = [], aggregateRating, activeYear, activeRating}: Props) {
  const [query, setQuery] = useState('')
  const [selectedRatings, setSelectedRatings] = useState<string[]>(
    activeRating && !['all', 'google'].includes(activeRating) ? [activeRating] : [],
  )
  const [selectedYears, setSelectedYears] = useState<string[]>(activeYear ? [activeYear] : [])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [openFacet, setOpenFacet] = useState<FacetName | null>(null)
  const reviewResultsStartRef = useRef<HTMLParagraphElement>(null)
  const scrollAfterFilterChangeRef = useRef(false)

  useEffect(() => {
    if (!scrollAfterFilterChangeRef.current) return
    scrollAfterFilterChangeRef.current = false

    const frame = window.requestAnimationFrame(() => {
      reviewResultsStartRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'})
    })

    return () => window.cancelAnimationFrame(frame)
  }, [selectedEquipment, selectedRatings, selectedYears])

  const stablePages = useMemo(() => {
    const unique = new Map<string, ReviewCollectionItem>()
    for (const page of pages) if (!unique.has(page.serviceSlug)) unique.set(page.serviceSlug, page)
    return [...unique.values()]
  }, [pages])

  const allReviews = useMemo<ReviewEntry[]>(() => {
    const entries = new Map<string, ReviewEntry>()

    const servicesBySlug = new Map<string, ReviewService>(
      stablePages.map((page): [string, ReviewService] => [page.serviceSlug, {slug: page.serviceSlug, name: page.serviceName, parentName: page.parentName}]),
    )

    for (const review of reviews) {
      const id = reviewIdentity(review)
      const services = (review.serviceSlugs || [])
        .map((slug) => servicesBySlug.get(slug))
        .filter((service): service is ReviewService => Boolean(service))
      entries.set(id, {id, review, services})
    }

    // The master review library carries the real service-keyword classifications.
    // Curated four-card service-page excerpts are only a fallback when it is absent.
    if (reviews.length === 0) {
      for (const page of stablePages) {
        const service = {slug: page.serviceSlug, name: page.serviceName, parentName: page.parentName}
        for (const review of page.reviews) {
          const id = reviewIdentity(review)
          const existing = entries.get(id)
          if (existing) {
            if (!existing.services.some((item) => item.slug === service.slug)) existing.services.push(service)
          } else {
            entries.set(id, {id, review, services: [service]})
          }
        }
      }
    }

    return [...entries.values()].sort((a, b) => {
      const lengthDifference = b.review.quote.trim().length - a.review.quote.trim().length
      if (lengthDifference !== 0) return lengthDifference
      return (reviewDateValue(b.review) || '').localeCompare(reviewDateValue(a.review) || '')
    })
  }, [reviews, stablePages])

  const ratingCounts = useMemo(() => {
    const counts = new Map<number, number>()
    for (const rating of STAR_RATINGS) counts.set(rating, 0)
    for (const entry of allReviews) {
      const rating = reviewRating(entry.review, aggregateRating)
      counts.set(rating, (counts.get(rating) || 0) + 1)
    }
    return counts
  }, [aggregateRating, allReviews])

  const years = useMemo(
    () => Array.from(new Set(allReviews.map((entry) => reviewYear(entry.review)).filter(Boolean) as string[])).sort().reverse(),
    [allReviews],
  )

  const yearCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of allReviews) {
      const year = reviewYear(entry.review)
      if (year) counts.set(year, (counts.get(year) || 0) + 1)
    }
    return counts
  }, [allReviews])

  const equipmentCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const page of stablePages) counts.set(page.serviceSlug, 0)
    for (const entry of allReviews) {
      for (const service of entry.services) {
        counts.set(service.slug, (counts.get(service.slug) || 0) + 1)
      }
    }
    return counts
  }, [allReviews, stablePages])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return allReviews.filter((entry) => {
      const {review, services} = entry
      if (selectedEquipment.length > 0 && !services.some((service) => selectedEquipment.includes(service.slug))) return false
      if (selectedRatings.length > 0 && !selectedRatings.includes(reviewRating(review, aggregateRating).toString())) return false
      const year = reviewYear(review)
      if (selectedYears.length > 0 && (!year || !selectedYears.includes(year))) return false
      if (!term) return true
      const searchable = [
        review.quote,
        review.author,
        review.location,
        ...services.flatMap((service) => [service.name, service.parentName]),
      ].filter(Boolean).join(' ').toLowerCase()
      return searchable.includes(term)
    })
  }, [aggregateRating, allReviews, query, selectedEquipment, selectedRatings, selectedYears])

  const appliedFilters = useMemo<AppliedFilter[]>(() => [
    ...selectedRatings.map((rating) => ({
      key: `rating-${rating}`,
      label: `${rating}-star`,
      remove: () => {
        scrollAfterFilterChangeRef.current = true
        setSelectedRatings((current) => current.filter((item) => item !== rating))
      },
    })),
    ...selectedYears.map((year) => ({
      key: `year-${year}`,
      label: year,
      remove: () => {
        scrollAfterFilterChangeRef.current = true
        setSelectedYears((current) => current.filter((item) => item !== year))
      },
    })),
    ...selectedEquipment.map((slug) => {
      const page = stablePages.find((item) => item.serviceSlug === slug)
      return {
        key: `equipment-${slug}`,
        label: page?.serviceName || slug,
        remove: () => {
          scrollAfterFilterChangeRef.current = true
          setSelectedEquipment((current) => current.filter((item) => item !== slug))
        },
      }
    }),
  ], [selectedEquipment, selectedRatings, selectedYears, stablePages])

  function clearFilters() {
    scrollAfterFilterChangeRef.current = true
    setSelectedRatings([])
    setSelectedYears([])
    setSelectedEquipment([])
    setQuery('')
  }

  return (
    <section className="review-directory" aria-labelledby="review-directory-title">
      <div className="collection-wrap review-directory-grid">
        <aside className="review-filter" aria-label="Review filters">
          <div className="review-filter-head">
            <p className="review-filter-kicker">Filter reviews</p>
          </div>

          <div className="review-facet-list">
            <section className={`review-facet${openFacet === 'rating' ? ' is-open' : ''}`}>
              <button className="review-facet-heading" type="button" aria-expanded={openFacet === 'rating'} aria-controls="rating-filter-options" onClick={() => setOpenFacet((current) => current === 'rating' ? null : 'rating')}>
                <span><strong>Rating</strong></span>
              </button>
              {openFacet === 'rating' && <div className="review-facet-options review-rating-options" id="rating-filter-options">
                {STAR_RATINGS.map((rating) => {
                  const value = rating.toString()
                  const count = ratingCounts.get(rating) || 0
                  const percentage = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0
                  return (
                    <label className="review-rating-filter" key={rating}>
                      <input
                        type="checkbox"
                        aria-label={`${rating}-star reviews, ${percentage.toFixed(1)} percent of the review library`}
                        checked={selectedRatings.includes(value)}
                        onChange={() => {
                          scrollAfterFilterChangeRef.current = true
                          toggleValue(value, selectedRatings, setSelectedRatings)
                        }}
                      />
                      <span className="review-rating-filter-label">{rating}<span aria-hidden="true">★</span></span>
                      <span className="review-rating-bar" aria-hidden="true"><span style={{width: `${Math.max(count > 0 ? 1 : 0, percentage)}%`}} /></span>
                      <b aria-label={`${count} reviews`}>{count}</b>
                    </label>
                  )
                })}
              </div>}
            </section>

            <section className={`review-facet${openFacet === 'years' ? ' is-open' : ''}`}>
              <button className="review-facet-heading" type="button" aria-expanded={openFacet === 'years'} aria-controls="year-filter-options" onClick={() => setOpenFacet((current) => current === 'years' ? null : 'years')}>
                <span><strong>Years</strong></span>
              </button>
              {openFacet === 'years' && <div className="review-facet-options" id="year-filter-options">
                {years.map((year) => {
                  return (
                    <label key={year}>
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(year)}
                        onChange={() => {
                          scrollAfterFilterChangeRef.current = true
                          toggleValue(year, selectedYears, setSelectedYears)
                        }}
                      />
                      <span>{year}</span>
                      <b aria-label={`${yearCounts.get(year) || 0} reviews`}>{yearCounts.get(year) || 0}</b>
                    </label>
                  )
                })}
              </div>}
            </section>

            <section className={`review-facet${openFacet === 'equipment' ? ' is-open' : ''}`}>
              <button className="review-facet-heading" type="button" aria-expanded={openFacet === 'equipment'} aria-controls="equipment-filter-options" onClick={() => setOpenFacet((current) => current === 'equipment' ? null : 'equipment')}>
                <span><strong>Equipment</strong></span>
              </button>
              {openFacet === 'equipment' && <div className="review-facet-options" id="equipment-filter-options">
                {stablePages.map((page) => {
                  return (
                    <label key={page.serviceSlug}>
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(page.serviceSlug)}
                        onChange={() => {
                          scrollAfterFilterChangeRef.current = true
                          toggleValue(page.serviceSlug, selectedEquipment, setSelectedEquipment)
                        }}
                      />
                      <span>{page.serviceName}</span>
                      <b aria-label={`${equipmentCounts.get(page.serviceSlug) || 0} reviews`}>{equipmentCounts.get(page.serviceSlug) || 0}</b>
                    </label>
                  )
                })}
              </div>}
            </section>
          </div>
        </aside>

        <div className="review-results">
          <div className="review-search-row">
            <label><span>Search reviews</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reviews, services, or customers" /></label>
            <p aria-live="polite"><strong>{filtered.length}</strong> review{filtered.length === 1 ? '' : 's'}</p>
          </div>

          <p className="collection-kicker review-feed-kicker" id="review-directory-title" ref={reviewResultsStartRef}>Customer feedback</p>

          {appliedFilters.length > 0 && (
            <div className="review-applied" aria-label="Applied filters">
              <span>Applied filters</span>
              <div>
                {appliedFilters.map((filter) => (
                  <button type="button" onClick={filter.remove} key={filter.key}>
                    {filter.label}<span aria-hidden="true">×</span>
                  </button>
                ))}
                <button className="review-clear-all" type="button" onClick={clearFilters}>Clear all</button>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="collection-empty">
              <h3>No matching reviews yet</h3>
              <p>There are no imported reviews for this combination. Try another filter or clear your selection.</p>
              <button type="button" onClick={clearFilters}>Clear all filters</button>
            </div>
          )}

          <div className="review-feed-grid">
            {filtered.map(({id, review}) => {
              const rating = reviewRating(review, aggregateRating)
              const context = review.reviewDate || review.location
              const reviewDate = reviewDateValue(review)
              return (
                <article className="rev-card review-feed-card" key={id}>
                  <blockquote>{review.quote}</blockquote>
                  <div className="rev-rating"><GoogleRating rating={rating} compact /></div>
                  <footer className="rev-meta">
                    <span><strong>{review.author || 'Google reviewer'}</strong>{context && <> · <time dateTime={reviewDate}>{context}</time></>}</span>
                    {review.sourceUrl && <a className="rev-src" href={review.sourceUrl} target="_blank" rel="noreferrer">View on Google →</a>}
                  </footer>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
