import { Request, Response } from 'express';
import Event from '../models/Event';

export const getAllEvents = async(req:Request, res:Response) => {
    try {
        const events = await Event.find();
        return res.json({status:200 ,message: "Events fetched successfully", data:events});
    } catch (err) {
        return res.status(500).json({ message: "Error fetching events", error: err });
    }
}   

export const getEventDetail = async(req:Request, res:Response) => {
    try {
        if(!req.params.id){
            return res.status(400).json({message: "Event ID is required"});
        }
        const event = await Event.findById({_id: req.params.id});
        return res.json({status:200,message: "Event Details fetched successfully", data:event});
    } catch (err) {
        res.status(500).json({ message: "Error fetching events", error: err });
    }
}

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { name, date, sections } = req.body;

    if (!name || !sections) {
      return res.status(400).json({ message: "Name and sections are required" });
    }

    const newEvent = new Event({
      name,
      date: date ?? Date.now(), 
      sections,
    });

    await newEvent.save();

    return res.json({
      status: 200,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error creating event",
      error: err,
    });
  }
};

export const purchaseTickets = async (req: Request, res: Response) => {
  try {
    const { sectionName, rowName, numberOfTickets, sessionId } = req.body;
    const eventId = req.params.id;

    if (!eventId || !sectionName || !rowName || !numberOfTickets || !sessionId) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const sectionObj = event?.sections.find((s) => s.name === sectionName);
    if (!sectionObj) return res.status(404).json({ message: "Section not found" });

    const rowObj = sectionObj?.rows.find((r) => r.name === rowName);
    if (!rowObj) return res.status(404).json({ message: "Row not found" });

    const now = new Date();
    rowObj.lockedSeats = rowObj.lockedSeats?.filter((l) => l.expiresAt > now) || [];

    if (rowObj.lockedSeats.some((l) => l.sessionId !== sessionId)) {
      return res.status(400).json({ message: "Seat is locked by another user" });
    }

    if (rowObj.totalSeats < numberOfTickets) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    rowObj.lockedSeats = rowObj?.lockedSeats?.filter((l) => l?.sessionId !== sessionId);

    rowObj.totalSeats -= numberOfTickets;

    await event.save();

    const groupDiscount = numberOfTickets >= 4;

    return res.json({
      status: 200,
      message: groupDiscount
        ? "Ticket purchased successfully and group discount has applied"
        : "Tickets purchased successfully",
      data: event,
      groupDiscount,
    });

  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error purchasing tickets", error: err });
  }
};


export const lockSeat = async (req: Request, res: Response) => {
  try {
    const { sectionName, rowName, sessionId, seatId } = req.body;
    const eventId = req.params.id;
    if (!eventId || !sectionName || !rowName || !sessionId || !seatId) {
      return res.status(400).json({ message: "Missing lock details" });
    }

    const now = new Date();
    const lockDuration = 5 * 60 * 1000;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const row = event.sections
      .find((s) => s?.name === sectionName)!
      .rows?.find((r) => r?.name === rowName)!;

    row.lockedSeats = row.lockedSeats?.filter((l) => l.expiresAt > now) || [];

    if (row.lockedSeats.some((l) => l.seatId === seatId && l.sessionId !== sessionId)) {
      return res.status(400).json({ message: "Seat already locked by another user" });
    }

    row.lockedSeats.push({
      seatId,
      sessionId,
      expiresAt: new Date(now.getTime() + lockDuration),
    });

    await event.save();

    res.json({ status: 200, message: "Seat locked successfully" });
  } catch (err) {
    console.error("LockSeat error:", err);
    res.status(500).json({ message: "Error locking seat", error: err });
  }
};


