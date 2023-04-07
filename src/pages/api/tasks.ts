import type { NextApiRequest, NextApiResponse } from "next";
import { mainLoop } from "@/lib/babyagi";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");

    const outputCallback = (output: string) => {
      res.write(`data: ${output}\n\n`);
    };

    await mainLoop(outputCallback);

    res.end("done\n");
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export default handler;
