import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID ?? '';
const tableName = process.env.AIRTABLE_TABLE_NAME ?? '';

const airtable = new Airtable({ apiKey });
const base = airtable.base(baseId);
const table = base(tableName);

type Evaluation = 'good' | 'bad';

interface Data {
  objective: string;
  evaluation: Evaluation;
  model: string;
  agent: string;
  iterations: number;
  last_result: string;
  task_list: string;
  session_summary: string;
  iteration_number: number;
  finished: boolean;
  output: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const {
      objective,
      evaluation,
      model,
      agent,
      iterations,
      last_result,
      task_list,
      session_summary,
      iteration_number,
      finished,
      output,
    }: Data = req.body;

    try {
      await table.create([
        {
          fields: {
            Objective: objective,
            Evaluation: evaluation,
            Model: model,
            Agent: agent,
            Iterations: iterations,
            LastResult: last_result,
            TaskList: task_list,
            SessionSummary: session_summary,
            IterationNumber: iteration_number,
            Finished: finished,
            Output: output,
          },
        },
      ]);

      res.status(200).json({ message: 'Data successfully sent to Airtable' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send data to Airtable' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
