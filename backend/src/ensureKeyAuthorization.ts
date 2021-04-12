import { Request, Response, NextFunction } from 'express';

const ensureKeyAuthorization = (
  request: Request,
  response: Response,
  next: NextFunction,
): any => {
  const accessKey = request.headers['x-access-key'];
  if (!accessKey) {
    console.log(`Token/Key is missing...`);
    return response.status(401).json({ result: 'Token/Key is missing.' })
  }

  if (accessKey === process.env.KEY_UPDATE_PREFERENCES) {
    return next();
  }
  console.log(`Invalid token/key...`);
  response.status(401).json({ result: 'Invalid token/key.' })
};

export default ensureKeyAuthorization;
