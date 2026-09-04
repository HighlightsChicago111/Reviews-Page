'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './src/sanity/schemaTypes'

const projectId = process.env.NEXT_SANITY_PROJECT_ID || '5w5623jq'
const dataset = process.env.NEXT_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'reviews',
  title: 'Highlights Chicago Reviews',
  projectId,
  dataset,
  basePath: '/reviews/studio',
  plugins: [structureTool(), visionTool()],
  schema: {types: schemaTypes},
})

