import { Schema, model, models, type Model } from 'mongoose'
import type {
  Availability,
  CategoryIcon,
  ProductImage,
  ProductSpec,
} from '@/lib/types'

export interface CategoryDoc {
  _id: string
  name: string
  slug: string
  icon: CategoryIcon
  description: string
  sortOrder: number
}

export interface ProductDoc {
  _id: string
  name: string
  slug: string
  categoryId: string
  brand: string
  model: string
  price: number
  description: string
  images: ProductImage[]
  specs: ProductSpec[]
  availability: Availability
  published: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<CategoryDoc>(
  {
    // Fixed string ids ('cat-fans') keep products.categoryId readable and stable.
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    icon: {
      type: String,
      required: true,
      enum: ['refrigerator', 'rice-cooker', 'tv', 'fan', 'blender', 'plug'],
    },
    description: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
)

const imageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: null },
  },
  { _id: false },
)

const specSchema = new Schema<ProductSpec>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
)

const productSchema = new Schema<ProductDoc>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    categoryId: { type: String, required: true, index: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    images: { type: [imageSchema], default: [] },
    specs: { type: [specSchema], default: [] },
    availability: {
      type: String,
      required: true,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
)

// `models.X ??` guards against OverwriteModelError during HMR.
export const CategoryModel =
  (models.Category as Model<CategoryDoc>) ?? model<CategoryDoc>('Category', categorySchema)

export const ProductModel =
  (models.Product as Model<ProductDoc>) ?? model<ProductDoc>('Product', productSchema)
