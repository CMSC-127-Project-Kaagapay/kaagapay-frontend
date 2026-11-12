import {defineField, defineType} from 'sanity'
import {sharedContentFields} from './sharedFields'

export const resource = defineType({
  name: 'resource',
  type: 'document',
  fields: [
    ...sharedContentFields,
    defineField({
      name: 'resourceType',
      title: 'Resource Category',
      type: 'string',
      initialValue: 'Guide',
      options: {
        list: [
          {title: 'Guide', value: 'Guide'},
          {title: 'Policy / Handbook', value: 'Policy / Handbook'},
          {title: 'Hotline / Directory', value: 'Hotline / Directory'},
          {title: 'Downloadable PDF', value: 'Downloadable PDF'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fileAsset',
      title: 'Downloadable Document / PDF',
      type: 'file',
      description: 'Optional PDF or document file for users to download.',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External Resource URL',
      type: 'url',
      description: 'Optional link to an external handbook, policy, or directory.',
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
      resourceType: 'resourceType',
      media: 'coverImage',
    },
    prepare({title, resourceType, media}) {
      return {
        title,
        subtitle: `Resource • ${resourceType || 'Guide'}`,
        media,
      }
    },
  },
})

