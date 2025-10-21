import { Request } from "express";

export interface AuthenticatedRequest {
  user?: {
    email: string;
  };
}

export type TypedRequest<
  Params = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = {}
> = Request<Params, ResBody, ReqBody, ReqQuery> & AuthenticatedRequest;
