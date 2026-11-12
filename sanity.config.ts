import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './studio/schemaTypes'

const projectId = import.meta.env?.VITE_SANITY_PROJECT_ID || '6une4fpk'
const dataset = import.meta.env?.VITE_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Project Kaagapay Studio',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
