import bookingRepository from "@/repositories/booking-repository";
import { forbiddenError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getBooking(userId: number) {
  const booking = await bookingRepository.get(userId);
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}

async function findRoom(roomId: number) {
  const booking = await bookingRepository.findRoom(roomId);
  if (!booking) {
    throw notFoundError();
  }
}

async function roomUnable(roomId: number) {
  const booking = await bookingRepository.roomUnable(roomId);
  if (booking) {
    throw forbiddenError();
  }
}

async function findBooking(userId: number, bookingId: number) {
  const booking = await bookingRepository.findBooking(userId, bookingId);
  if (!booking) {
    throw forbiddenError();
  }
}

async function create(userId: number, roomId: number) {
  return await bookingRepository.create(userId, roomId);
}

async function update(bookingId: number, roomId: number) {
  return await bookingRepository.update(bookingId, roomId);
}

async function verifyTicket(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
}

export type BookingBody = {
  roomId: number;
};

const bookingService = {
  getBooking,
  verifyTicket,
  findRoom,
  roomUnable,
  create,
  update,
  findBooking,
};

export default bookingService;
