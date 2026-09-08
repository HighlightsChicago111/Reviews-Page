'use client'

import Link from 'next/link'
import {useMemo, useState} from 'react'
import type {Review, ReviewCollectionItem} from '@/types/content'
import {GoogleRating} from './google-review-card'

export type ReviewAxis = 'rating' | 'years' | 'equipment'

type Props = {
  pages: ReviewCollectionItem[]
  aggregateRating: number
  activeAxis: ReviewAxis
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

export function ReviewCollection({pages, aggregateRating, activeAxis, activeYear, activeRating}: Props) {
  const [query, setQuery] = useState('')
  const [selectedRatings, setSelectedRatings] = useState<string[]>(
    activeRating && !['all', 'google'].includes(activeRating) ? [activeRating] : [],
  )
  const [selectedYears, setSelectedYears] = useState<string[]>(activeYear ? [activeYear] : [])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [openFacets, setOpenFacets] = useState<Record<ReviewAxis, boolean>>({
    rating: activeAxis === 'rating',
    years: activeAxis === 'years',
    equipment: activeAxis === 'equipment',
  })

  const stablePages = useMemo(() => {
    const unique = new Map<string, ReviewCollectionItem>()
    for (const page of pages) if (!unique.has(page.serviceSlug)) unique.set(page.serviceSlug, page)
    return [...unique.values()]
  }, [pages])

  const allReviews = useMemo<ReviewEntry[]>(() => {
    const entries = new Map<string, ReviewEntry>()

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

    return [...entries.values()].sort((a, b) => (reviewDateValue(b.review) || '').localeCompare(reviewDateValue(a.review) || ''))
  }, [stablePages])

  const years = useMemo(
    () => Array.from(new Set(allReviews.map((entry) => reviewYear(entry.review)).filter(Boolean) as string[])).sort().reverse(),
    [allReviews],
  )

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
      remove: () => setSelectedRatings((current) => current.filter((item) => item !== rating)),
    })),
    ...selectedYears.map((year) => ({
      key: `year-${year}`,
      label: year,
      remove: () => setSelectedYears((current) => current.filter((item) => item !== year)),
    })),
    ...selectedEquipment.map((slug) => {
      const page = stablePages.find((item) => item.serviceSlug === slug)
      return {
        key: `equipment-${slug}`,
        label: page?.serviceName || slug,
        remove: () => setSelectedEquipment((current) => current.filter((item) => item !== slug)),
      }
    }),
  ], [selectedEquipment, selectedRatings, selectedYears, stablePages])

  const hasFilters = appliedFilters.length > 0 || query.trim().length > 0
  const heading = hasFilters ? 'Reviews matching your filters' : 'All customer reviews'

  function clearFilters() {
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
            <div><p className="review-filter-kicker">Filter reviews</p><span>{appliedFilters.length} applied</span></div>
            {hasFilters && <button type="button" onClick={clearFilters}>Clear all</button>}
          </div>

          <div className="review-facet-list">
            <details className="review-facet" open={openFacets.rating} onToggle={(event) => { const isOpen = event.currentTarget.open; setOpenFacets((current) => ({...current, rating: isOpen})) }}>
              <summary>
                <span><strong>Rating</strong><small>Google score</small></span>
                <span className="review-facet-summary-count">{selectedRatings.length || STAR_RATINGS.length}</span>
              </summary>
              <div className="review-facet-options review-facet-options-scroll">
                {STAR_RATINGS.map((rating) => {
                  const value = rating.toString()
                  const count = allReviews.filter((entry) => reviewRating(entry.review, aggregateRating) === rating).length
                  return (
                    <label key={rating}>
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(value)}
                        onChange={() => toggleValue(value, selectedRatings, setSelectedRatings)}
                      />
                      <span>{rating}-star reviews</span>
                      <b>{count}</b>
                    </label>
                  )
                })}
              </div>
            </details>

            <details className="review-facet" open={openFacets.years} onToggle={(event) => { const isOpen = event.currentTarget.open; setOpenFacets((current) => ({...current, years: isOpen})) }}>
              <summary>
                <span><strong>Years</strong><small>Review date</small></span>
                <span className="review-facet-summary-count">{selectedYears.length || years.length}</span>
              </summary>
              <div className="review-facet-options review-facet-options-scroll">
                {years.map((year) => {
                  const count = allReviews.filter((entry) => reviewYear(entry.review) === year).length
                  return (
                    <label key={year}>
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(year)}
                        onChange={() => toggleValue(year, selectedYears, setSelectedYears)}
                      />
                      <span>{year} reviews</span>
                      <b>{count}</b>
                    </label>
                  )
                })}
              </div>
            </details>

            <details className="review-facet" open={openFacets.equipment} onToggle={(event) => { const isOpen = event.currentTarget.open; setOpenFacets((current) => ({...current, equipment: isOpen})) }}>
              <summary>
                <span><strong>Equipment</strong><small>Electrical service</small></span>
                <span className="review-facet-summary-count">{selectedEquipment.length || stablePages.length}</span>
              </summary>
              <div className="review-facet-options review-facet-options-scroll">
                {stablePages.map((page) => {
                  const count = allReviews.filter((entry) => entry.services.some((service) => service.slug === page.serviceSlug)).length
                  return (
                    <label key={page.serviceSlug}>
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(page.serviceSlug)}
                        onChange={() => toggleValue(page.serviceSlug, selectedEquipment, setSelectedEquipment)}
                      />
                      <span>{page.serviceName}</span>
                      <b>{count}</b>
                    </label>
                  )
                })}
              </div>
            </details>
          </div>
          <p className="review-filter-note">Choose any rating, year, or service. The review cards update instantly on this page.</p>
        </aside>

        <div className="review-results">
          <div className="review-results-heading">
            <div><p className="collection-kicker">Customer feedback</p><h2 id="review-directory-title">{heading}</h2></div>
            <p>Read every review card available in this library here. Use a service label to open its dedicated review page or follow the source link to Google.</p>
          </div>

          <div className="review-search-row">
            <label><span>Search reviews</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reviews, services, or customers" /></label>
            <p aria-live="polite"><strong>{filtered.length}</strong> review{filtered.length === 1 ? '' : 's'}</p>
          </div>

          {appliedFilters.length > 0 && (
            <div className="review-applied" aria-label="Applied filters">
              <span>Applied filters</span>
              <div>
                {appliedFilters.map((filter) => (
                  <button type="button" onClick={filter.remove} key={filter.key}>
                    {filter.label}<span aria-hidden="true">×</span>
                  </button>
                ))}
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
            {filtered.map(({id, review, services}) => {
              const rating = reviewRating(review, aggregateRating)
              const context = review.reviewDate || review.location
              const reviewDate = reviewDateValue(review)
              return (
                <article className="rev-card review-feed-card" key={id}>
                  <div className="review-feed-services">
                    {services.slice(0, 2).map((service) => (
                      <Link href={`/${service.slug}`} key={service.slug}>{service.name}</Link>
                    ))}
                    {services.length > 2 && <span>+{services.length - 2} more</span>}
                  </div>
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
