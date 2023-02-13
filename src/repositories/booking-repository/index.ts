import { prisma } from "@/config";

async function get(userId: number) {
  return await prisma.booking.findFirst({
    select: {
      id: true,
      Room: true,
    },
    where: {
      userId: userId,
    },
  });
}

async function findRoom(roomId: number) {
  return await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}

async function roomUnable(roomId: number) {
  return await prisma.booking.findFirst({
    where: {
      roomId: roomId,
    },
  });
}

async function create(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId,
    },
  });
}

async function update(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId: roomId,
    },
  });
}

async function findBooking(userId: number, bookingId: number) {
  return await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: userId,
    },
  });
}

const bookingRepository = {
  get,
  findRoom,
  roomUnable,
  create,
  update,
  findBooking,
};

export default bookingRepository;
