import mongoose, { Schema } from 'mongoose';

interface IStoredSession {
  session_key?: number;
  session_name?: string;
  session_type?: string;
  meeting_key?: number;
  date_start?: string;
  date_end?: string;
  gmt_offset?: string;
  processed?: boolean;
}

interface ISessionQueue {
  meeting_key?: number;
  year?: number;
  sessions: IStoredSession[];
  processedSessions?: number[];
  liveSessionKey?: number;
  lastUpdated: Date;
}

const StoredSessionSchema = new Schema<IStoredSession>({
  session_key: { type: Number, required: false },
  session_name: { type: String, required: false },
  session_type: { type: String, required: false },
  meeting_key: { type: Number, required: false },
  date_start: { type: String, required: false },
  date_end: { type: String, required: false },
  gmt_offset: { type: String, required: false },
  processed: { type: Boolean, required: false },
}, { _id: false });

const SessionSchema = new Schema<ISessionQueue>({
  meeting_key: { type: Number, required: false, index: true },
  year: { type: Number, required: false, index: true },
  sessions: { type: [StoredSessionSchema], default: [] },
  processedSessions: { type: [Number], default: [] },
  liveSessionKey: { type: Number, required: false },
  lastUpdated: { type: Date, default: Date.now },
});

const SessionQueue = mongoose.models.SessionQueue || mongoose.model('SessionQueue', SessionSchema);

export default SessionQueue;
