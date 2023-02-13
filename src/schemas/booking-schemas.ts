import { BookingBody } from "@/services";
import Joi from "joi";

export const bookingSchema = Joi.object<BookingBody>({
  roomId: Joi.number().required(),
});
