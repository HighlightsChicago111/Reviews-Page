const SITE = 'https://www.highlightschicago.com'
export const REVIEWS_URL = `${SITE}/reviews`

type Crumb = {name: string; url: string}

/**
 * WebPage and BreadcrumbList for a reviews page. On purpose there is no Review or AggregateRating
 * markup here: Google ignores self-serving review markup on a business's own site.
 */
export function PageJsonLd({url, name, description, crumbs}: {url: string; name: string; description?: string; crumbs: Crumb[]}) {
  const trail = [{name: 'Home', url: `${SITE}/`}, ...crumbs]
  const graph = [
    {
      '@type': 'WebPage', '@id': `${url}#webpage`, url, name, ...(description ? {description} : {}),
      about: {'@id': `${SITE}/#business`}, isPartOf: {'@id': `${SITE}/#website`},
    },
    {'@type': 'BreadcrumbList', itemListElement: trail.map((crumb, i) => ({'@type': 'ListItem', position: i + 1, name: crumb.name, item: crumb.url}))},
  ]
  const json = JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: json}} />
}
