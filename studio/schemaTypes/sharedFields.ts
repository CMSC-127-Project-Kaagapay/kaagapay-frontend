import {defineArrayMember, defineField} from 'sanity'

export const sharedContentFields = [
  defineField({
    name: 'title',
    type: 'string',
    validation: (rule) => rule.required().min(3).max(140),
  }),
  defineField({
    name: 'slug',
    type: 'slug',
    options: {
      source: 'title',
      maxLength: 96,
    },
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'summary',
    type: 'text',
    rows: 3,
    description: 'Short excerpt displayed on cards in the Updates hub.',
    validation: (rule) => rule.required().max(280),
  }),
  defineField({
    name: 'publishedAt',
    type: 'datetime',
    initialValue: () => new Date().toISOString(),
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'coverImage',
    type: 'image',
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative Text',
        type: 'string',
        description: 'Important for accessibility and screen readers.',
      }),
    ],
  }),
  defineField({
    name: 'body',
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
      }),
      defineArrayMember({
        type: 'image',
        options: {hotspot: true},
        fields: [
          defineField({
            name: 'alt',
            title: 'Alternative Text',
            type: 'string',
          }),
          defineField({
            name: 'caption',
            type: 'string',
          }),
        ],
      }),
    ],
  }),
]

