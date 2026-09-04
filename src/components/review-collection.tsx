'use client'

/* eslint-disable @next/next/no-img-element -- Sanity review collection images remain crawlable. */

import Link from 'next/link'
import {useMemo, useState} from 'react'
import type {Review, ReviewCollectionItem} from '@/types/content'
import {serviceCardImageForSlug} from '@/lib/collection-items'
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

function reviewYear(review: Review): string | undefined {
  const value = review.reviewDate || review.location
  return /^20\d{2}-\d{2}-\d{2}$/.test(value || '') ? value?.slice(0, 4) : undefined
}

function pluralReviews(count: number) {
  return `${count} review${count === 1 ? '' : 's'}`
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

  const allReviews = useMemo(() => stablePages.flatMap((page) => page.reviews), [stablePages])
  const years = useMemo(
    () => Array.from(new Set(allReviews.map(reviewYear).filter(Boolean) as string[])).sort().reverse(),
    [allReviews],
  )
  const starRatings = useMemo(
    () => Array.from(new Set(allReviews.map((review) => Math.round(review.rating || aggregateRating)))).sort((a, b) => b - a),
    [aggregateRating, allReviews],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return stablePages
      .map((page) => {
        if (selectedEquipment.length > 0 && !selectedEquipment.includes(page.serviceSlug)) {
          return {...page, matchingReviews: []}
        }
        const matchingReviews = page.reviews.filter((review) => {
          const rating = Math.round(review.rating || aggregateRating).toString()
          if (selectedRatings.length > 0 && !selectedRatings.includes(rating)) return false
          const year = reviewYear(review)
          if (selectedYears.length > 0 && (!year || !selectedYears.includes(year))) return false
          return true
        })
        return {...page, matchingReviews}
      })
      .filter((page) => {
        const matchesTerm = !term || `${page.serviceName} ${page.parentName || ''}`.toLowerCase().includes(term)
        return matchesTerm && page.matchingReviews.length > 0
      })
  }, [aggregateRating, query, selectedEquipment, selectedRatings, selectedYears, stablePages])

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
  const heading = hasFilters ? 'Filtered review collections' : 'Google review collections'

  function clearFilters() {
    setSelectedRatings([])
    setSelectedYears([])
    setSelectedEquipment([])
    setQuery('')
  }

  return (
    <section className="review-directory" aria-labelledby="review-directory-title">
      <div className="collection-wrap review-directory-grid">
        <aside className="review-filter" aria-label="Review collection filters">
          <div className="review-filter-head">
            <div><p className="review-filter-kicker">Filter reviews</p><span>{appliedFilters.length} applied</span></div>
            {hasFilters && <button type="button" onClick={clearFilters}>Clear all</button>}
          </div>

          <div className="review-facet-list">
            <details className="review-facet" open={openFacets.rating} onToggle={(event) => { const isOpen = event.currentTarget.open; setOpenFacets((current) => ({...current, rating: isOpen})) }}>
              <summary>
                <span><strong>Rating</strong><small>Google score</small></span>
                <span className="review-facet-summary-count">{selectedRatings.length || starRatings.length}</span>
              </summary>
              <div className="review-facet-options">
                {starRatings.map((rating) => {
                  const value = rating.toString()
                  const count = allReviews.filter((review) => Math.round(review.rating || aggregateRating) === rating).length
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
              <div className="review-facet-options">
                {years.map((year) => {
                  const count = allReviews.filter((review) => reviewYear(review) === year).length
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
                {stablePages.map((page) => (
                  <label key={page.serviceSlug}>
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(page.serviceSlug)}
                      onChange={() => toggleValue(page.serviceSlug, selectedEquipment, setSelectedEquipment)}
                    />
                    <span>{page.serviceName}</span>
                    <b>{page.reviews.length}</b>
                  </label>
                ))}
              </div>
            </details>
          </div>
          <p className="review-filter-note">Select one or more options. Review collections update here without leaving the page; open a card for its dedicated service review URL.</p>
        </aside>

        <div className="review-results">
          <div className="review-results-heading">
            <div><p className="collection-kicker">Customer proof by service</p><h2 id="review-directory-title">{heading}</h2></div>
            <p>Choose a service collection to read every matching review excerpt and follow it back to the original Google review.</p>
          </div>

          <div className="review-search-row">
            <label><span>Find a service</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search electrical services" /></label>
            <p aria-live="polite"><strong>{filtered.length}</strong> service collections</p>
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
              <h3>No matching review collections</h3>
              <p>Try a different combination or clear the applied filters.</p>
              <button type="button" onClick={clearFilters}>Clear all filters</button>
            </div>
          )}

          <div className="review-collection-grid">
            {filtered.map((page) => {
              const cardImage = serviceCardImageForSlug(page.serviceSlug) || page.cardImage
              return (
                <Link className="review-collection-card" href={`/${page.serviceSlug}`} key={page._id}>
                  <span className={`review-collection-media${cardImage ? '' : ' review-collection-media-empty'}`}>
                    {cardImage
                      ? <img src={cardImage} alt={page.cardImageAlt || `${page.serviceName} work by Highlights Chicago`} loading="lazy" decoding="async" />
                      : <span aria-hidden="true">HC</span>}
                    <span className="review-card-count">{pluralReviews(page.matchingReviews.length)}</span>
                  </span>
                  <span className="review-collection-body">
                    <span className="review-collection-parent">{page.parentName || 'Electrical services'}</span>
                    <strong>{page.serviceName}</strong>
                    <GoogleRating rating={page.matchingReviews[0]?.rating || aggregateRating} compact />
                    <span className="review-collection-quote">“{page.matchingReviews[0]?.quote}”</span>
                    <span className="review-collection-link">Read this collection <span aria-hidden="true">→</span></span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
