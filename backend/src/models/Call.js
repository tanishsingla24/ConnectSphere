import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    // Unordered participant pair (so we can find the call regardless of who started/ended)
    userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Offer direction (caller -> callee) once an offer is sent
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    callee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    status: {
      type: String,
      enum: ['matched', 'calling', 'ended'],
      default: 'matched',
      index: true,
    },

    commonInterests: { type: [String], default: [] },

    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    endedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Avoid duplicate records for the same matched pair.
callSchema.index({ userA: 1, userB: 1, status: 1, endedAt: 1 });

const Call = mongoose.model('Call', callSchema);

export default Call;

