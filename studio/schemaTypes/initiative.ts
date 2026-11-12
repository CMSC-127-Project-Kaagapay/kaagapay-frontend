import {defineField, defineType} from 'sanity'
import {sharedContentFields} from './sharedFields'

export const initiative = defineType({
  name: 'initiative',
  type: 'document',
  fields: [
    ...sharedContentFields,
    defineField({
      name: 'status',
      type: 'string',
      initialValue: 'Upcoming',
      options: {
        list: [
          {title: 'Upcoming', value: 'Upcoming'},
          {title: 'Ongoing', value: 'Ongoing'},
          {title: 'Completed', value: 'Completed'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eventDate',
      title: 'Start Date & Time',
      type: 'datetime',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date & Time',
      type: 'datetime',
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const eventDate = (context.document as {eventDate?: string} | undefined)?.eventDate
          if (eventDate && endDate && new Date(endDate) < new Date(eventDate)) {
            return 'End date must be after start date'
          }
          return true
        }),
    }),
    defineField({
      name: 'location',
      title: 'Location / Venue',
      type: 'string',
      description: 'e.g., UP Mindanao Atrium, CHSS Audio Visual Room, or Online via Zoom',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      location: 'location',
      media: 'coverImage',
    },
    prepare({title, status, location, media}) {
      return {
        title,
        subtitle: `Initiative • ${status || 'Upcoming'}${location ? ` • ${location}` : ''}`,
        media,
      }
    },
  },
})

