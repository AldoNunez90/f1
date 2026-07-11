import mongoose, { Schema } from 'mongoose';

export interface IFiaDocument {
  url: string;
  title: string;
  source?: string;
  summary: string;
  spanishSummary?: string;
  fullText?: string;
  textExcerpt?: string;
  pageCount?: number;
  publishedAt?: Date;
  lastFetched: Date;
  checksum: string;
  etag?: string;
  lastModified?: string;
  metadata?: Record<string, unknown>;
  removed: boolean;
}

const FiaDocumentSchema = new Schema<IFiaDocument>({
  url: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: false,
  },
  summary: {
    type: String,
    required: true,
  },
  spanishSummary: {
    type: String,
    required: false,
  },
  fullText: {
    type: String,
    required: false,
  },
  textExcerpt: {
    type: String,
    required: false,
  },
  pageCount: {
    type: Number,
    required: false,
  },
  publishedAt: {
    type: Date,
    required: false,
  },
  lastFetched: {
    type: Date,
    default: Date.now,
    required: true,
  },
  checksum: {
    type: String,
    required: true,
  },
  etag: {
    type: String,
    required: false,
  },
  lastModified: {
    type: String,
    required: false,
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false,
  },
  removed: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const FiaDocument = mongoose.models.FiaDocument || mongoose.model('FiaDocument', FiaDocumentSchema);

export default FiaDocument;
