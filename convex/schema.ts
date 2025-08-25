import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  exercises: defineTable({
    name: v.string(),
  }),
})
