import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createBooking,
  createTicketTypeWithIncludesHotelFalse,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user not have booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and a list of hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createRoom.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: createRoom.id,
          capacity: createRoom.capacity,
          hotelId: createRoom.hotelId,
          name: createRoom.name,
          createdAt: createRoom.createdAt.toISOString(),
          updatedAt: createRoom.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe("PUT /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/0");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if the body is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidBody = {};

      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(invalidBody);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 if the room not exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = {
        roomId: 0,
      };

      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if the room is unable", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createRoom.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server
        .put("/booking/" + booking.id)
        .set("Authorization", `Bearer ${token}`)
        .send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if the booking not exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);
      const createRoom2 = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createRoom.id);

      const body = {
        roomId: createRoom2.id,
      };

      const response = await server
        .put("/booking/" + booking.id)
        .set("Authorization", `Bearer ${token}`)
        .send(body);

      expect(response.status).toBe(httpStatus.OK);

      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if the body is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidBody = {};

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(invalidBody);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 if the room not exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = {
        roomId: 0,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if the enrolloment not exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if the ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if the ticket not exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if the ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if the ticket is not includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithIncludesHotelFalse();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if the room is unable", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);
      await createBooking(user.id, createRoom.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const createdHotel = await createHotel();
      const createRoom = await createRoomWithHotelId(createdHotel.id);

      const body = {
        roomId: createRoom.id,
      };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
    });
  });
});
