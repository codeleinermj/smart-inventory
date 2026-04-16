import type { NextFunction, Request, Response } from "express";
import * as productsService from "../services/products.service.js";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // req.query has been replaced by validate() with a parsed/typed object.
    const result = await productsService.list(
      req.query as unknown as { limit: number; offset: number; status: "ok" | "all" | "low"; search?: string }
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await productsService.getById(req.params.id!);
    res.status(200).json(product);
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
    const product = await productsService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await productsService.update(req.params.id!, req.body);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await productsService.remove(req.params.id!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
