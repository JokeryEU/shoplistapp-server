import { Request, Response, NextFunction } from 'express'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void
