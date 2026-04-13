import type { NextFunction, Request, Response } from "express";
import * as movementsService from "../services/movements.service.js";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const movements = await movementsService.listByProduct(req.params.id!);
    res.status(200).json(movements);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await movementsService.create(
      req.params.id!,
      req.body,
      req.user!.id
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}