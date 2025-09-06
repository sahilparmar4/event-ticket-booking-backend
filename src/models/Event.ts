import mongoose, { Document, Schema } from 'mongoose';

interface LockedSeat {
  seatId: string;
  sessionId: string;
  expiresAt: Date;
}

interface Row {
  name: string;
  totalSeats: number;
  lockedSeats?: LockedSeat[];
}

interface Section {
  name: string;
  rows: Row[];
}

interface Event extends Document {
  name: string;
  date: Date;
  sections: Section[];
  _id: string;
}

const lockedSeatSchema: Schema<LockedSeat> = new Schema({
  seatId: { type: String, required: true },
  sessionId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const rowSchema: Schema<Row> = new Schema({
  name: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  lockedSeats: { type: [lockedSeatSchema], default: [] },
});

const sectionSchema: Schema<Section> = new Schema({
  name: { type: String, required: true },
  rows: { type: [rowSchema], required: true },
});

const eventSchema: Schema<Event> = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  sections: { type: [sectionSchema], required: true },
});

const Event = mongoose.model<Event>('events', eventSchema);

export default Event;
