// models/Note.ts
import mongoose, { Document, Model } from 'mongoose';

export interface INote extends Document {
  _id: string;
  productName: string;
  captions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new mongoose.Schema<INote>(
  {
    productName: { type: String, required: true, trim: true },
    captions: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
