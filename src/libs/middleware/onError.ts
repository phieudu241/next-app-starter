import { NextApiRequest, NextApiResponse } from "next";
import log from "loglevel";

import { IResponse } from "models/Response";

const onError = (err: Error, req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  log.error(err);
  res.status(500).json({ error: err.message });
};

export default onError;