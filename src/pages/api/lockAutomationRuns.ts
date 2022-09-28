import type { NextApiRequest, NextApiResponse } from 'next'
import { getAPIData } from '../../utils/utils';
import Queries from '../api/resolvers/resolverMapping.json';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  let runIDsToLock = await getAPIData(Queries.QUERY_RUNS_TO_LOCK, {}, false);

  let results = {
    data: runIDsToLock[0]
  }

  res.status(200).json(results)
}
