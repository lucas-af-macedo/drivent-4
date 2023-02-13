import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService, { BookingBody } from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(userId);

    res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingBody = req.body as BookingBody;

  try {
    await bookingService.findRoom(bookingBody.roomId);
    await bookingService.roomUnable(bookingBody.roomId);
    await bookingService.verifyTicket(userId);

    const bookingId = (await bookingService.create(userId, bookingBody.roomId)).id;
    res.status(httpStatus.OK).send({ bookingId: bookingId });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.name === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingBody = req.body as BookingBody;
  const bookingId = Number(req.params.bookingId);

  try {
    await bookingService.findRoom(bookingBody.roomId);
    await bookingService.roomUnable(bookingBody.roomId);
    await bookingService.findBooking(userId, bookingId);

    const id = (await bookingService.update(bookingId, bookingBody.roomId)).id;
    res.status(httpStatus.OK).send({ bookingId: id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.name === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}
