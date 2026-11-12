import {defineField, defineType} from 'sanity'
import {sharedContentFields} from './sharedFields'

export const announcement = defineType({
  name: 'announcement',
  type: 'document',
  fields: [
    ...sharedContentFields,
    defineField({
      name: 'badge',
      title: 'Urgency / Badge',
      type: 'string',
      initialValue: 'Info',
      options: {
        list: [
          {title: 'Info', value: 'Info'},
          {title: 'Important', value: 'Important'},
          {title: 'Urgent', value: 'Urgent'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pinned',
      title: 'Pin to Top of Updates',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Call to Action Label',
      type: 'string',
      description: 'Optional button label (e.g., "Read Official Memo").',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Call to Action URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'badge',
      media: 'coverImage',
      pinned: 'pinned',
    },
    prepare({title, subtitle, media, pinned}) {
      return {
        title: pinned ? `📌 ${title}` : title,
        subtitle: `Announcement • ${subtitle || 'Info'}`,
        media,
      }
    },
  },
})

