import { sql } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
    minStock: integer("min_stock").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    // Partial unique index — SKU is unique only among active (non-deleted) rows.
    // This is what allows soft-deleted SKUs to be reused later.
    skuActiveUnique: uniqueIndex("products_sku_active_unique")
      .on(table.sku)
      .where(sql`${table.deletedAt} IS NULL`),
  })
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
