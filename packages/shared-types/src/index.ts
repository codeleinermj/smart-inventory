export interface HealthResponse {
  status: "ok" | "error";
  service: "api" | "ml" | "web";
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export * from "./auth.js";
export * from "./products.js";
