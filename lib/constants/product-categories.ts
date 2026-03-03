export const PRODUCT_CATEGORIES = [
  "Snapback",
  "Fitted",
  "Trucker",
  "Dad Hat",
  "Flat Brim",
  "5 Panels",
  "Bucket Hat",
  "Military",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
