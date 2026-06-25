import mongoose, { Schema } from 'mongoose';

interface IF1Cache {
  endpoint: string;
  data: Record<string, unknown>;
  lastUpdated: Date;
  expiresAt: Date;
}

const F1CacheSchema = new Schema<IF1Cache>({
  endpoint: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas por defecto
    index: { expireAfterSeconds: 0 }, // TTL index
  },
});

const F1Cache = mongoose.models.F1Cache || mongoose.model('F1Cache', F1CacheSchema);

export default F1Cache;
