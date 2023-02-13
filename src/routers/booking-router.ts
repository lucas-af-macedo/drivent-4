import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter.all("/*", authenticateToken).get("/").post("/").put("/:id");

export { bookingRouter };
