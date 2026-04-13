import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: uuid("product_id").notNull(),
    type: text("type").notNull(), // 'in' | 'out' | 'adjustment'
    quantity: integer("quantity").notNull(),
    reason: text("reason"),
    userId: uuid("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    typeCheck: check(
      "stock_movements_type_check",
      sql`${table.type} IN ('in', 'out', 'adjustment')`
    ),
  })
);

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;