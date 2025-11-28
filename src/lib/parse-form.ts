import { IncomingForm, Files, Fields } from "formidable";
import { NextRequest } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function parseForm(req: NextRequest & { [key: string]: any }) {
  const form = new IncomingForm({ keepExtensions: true, multiples: false });

  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(req.__NEXT_INIT_QUERY?.__actualNodeRequest || req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
