import {defineField, defineType} from 'sanity'
import {sharedContentFields} from './sharedFields'

export const volunteerOpportunity = defineType({
  name: 'volunteerOpportunity',
  title: 'Volunteer Opportunity',
  type: 'document',
  fields: [
    ...sharedContentFields,
    defineField({
      name: 'status',
      type: 'string',
      initialValue: 'Open',
      options: {
        list: [
          {title: 'Open', value: 'Open'},
          {title: 'Closed', value: 'Closed'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'deadline',
      title: 'Application Deadline',
      type: 'date',
    }),
    defineField({
      name: 'commitment',
      title: 'Role & Time Commitment',
      type: 'string',
      description: 'e.g., 4 hrs/week • Peer Accompaniment & Psychosocial First Aid',
    }),
    defineField({
      name: 'applyUrl',
      title: 'Application Link',
      type: 'string',
      initialValue: '/volunteer/apply',
      description: 'Defaults to /volunteer/apply if left as is, or provide an external URL.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      commitment: 'commitment',
      media: 'coverImage',
    },
    prepare({title, status, commitment, media}) {
      return {
        title,
        subtitle: `Volunteer Opportunity • ${status || 'Open'}${commitment ? ` • ${commitment}` : ''}`,
        media,
      }
    },
  },
})

