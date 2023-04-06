// pages/api/tasks.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Import the mainLoop function from the lib/mainLoop.ts file
import { mainLoop } from "@/lib/babyagi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await mainLoop();
    res.status(200).json({ message: "Task loop completed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while running the task loop" });
  }
}
