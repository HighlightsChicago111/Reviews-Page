import {defineField, defineType} from 'sanity'

export const reviewCollection = defineType({
  name: 'reviewCollection',
  title: 'Review Collection',
  type: 'document',
  groups: [
    {name: 'content', title: 'Collection', default: true},
    {name: 'media', title: 'Card image'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'serviceName', title: 'Service-level heading', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Review URL slug', type: 'slug', group: 'content', options: {source: 'serviceName', maxLength: 96}, validation: (rule) => rule.required()}),
    defineField({name: 'parentName', title: 'Parent service category', type: 'string', group: 'content'}),
    defineField({name: 'areaSlug', title: 'Service area slug', type: 'string', group: 'content', initialValue: 'chicago', validation: (rule) => rule.required()}),
    defineField({name: 'monthlySearchVolume', title: 'Sort priority / search volume', type: 'number', group: 'content'}),
    defineField({name: 'reviews', title: 'Reviews', type: 'array', group: 'content', of: [{type: 'review'}], validation: (rule) => rule.min(1)}),
    defineField({name: 'cardImage', title: 'Card image', type: 'image', group: 'media', options: {hotspot: true}}),
    defineField({name: 'externalCardImage', title: 'External card image URL', type: 'url', group: 'media'}),
    defineField({name: 'cardImageAlt', title: 'Card image alt text', type: 'string', group: 'media'}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo'}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo'}),
  ],
  orderings: [{title: 'Service name', name: 'serviceNameAsc', by: [{field: 'serviceName', direction: 'asc'}]}],
  preview: {
    select: {title: 'serviceName', subtitle: 'parentName', media: 'cardImage'},
    prepare: ({title, subtitle, media}) => ({title, subtitle: subtitle || 'Electrical services', media}),
  },
})
