import {defineField, defineType} from 'sanity'

export const review = defineType({
  name: 'review',
  title: 'Google Review',
  type: 'object',
  fields: [
    defineField({name: 'quote', title: 'Review text', type: 'text', rows: 6, validation: (rule) => rule.required()}),
    defineField({name: 'author', title: 'Reviewer name', type: 'string'}),
    defineField({name: 'reviewDate', title: 'Review date', type: 'date'}),
    defineField({name: 'location', title: 'Location or legacy date', type: 'string'}),
    defineField({name: 'rating', title: 'Star rating', type: 'number', validation: (rule) => rule.min(1).max(5)}),
    defineField({name: 'sourceUrl', title: 'Original Google review URL', type: 'url'}),
    defineField({name: 'sourceId', title: 'Source ID', type: 'string'}),
  ],
  preview: {
    select: {title: 'author', subtitle: 'quote', rating: 'rating'},
    prepare: ({title, subtitle, rating}) => ({title: title || 'Google reviewer', subtitle: `${rating || 5}★ · ${subtitle || ''}`}),
  },
})
