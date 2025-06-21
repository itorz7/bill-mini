import { pgTable, unique, uuid, varchar, text, timestamp, index, foreignKey, numeric, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	password: text().notNull(),
	telegramToken: text("telegram_token"),
	easyslipApiKey: text("easyslip_api_key"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	telegramChatId: varchar("telegram_chat_id", { length: 100 }).default(sql`NULL`),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	recipientNameTh: varchar("recipient_name_th", { length: 100 }).notNull(),
	paymentType: varchar("payment_type", { length: 10 }).notNull(),
	target: varchar({ length: 13 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	qrcode: text().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	recipientNameEn: varchar("recipient_name_en", { length: 100 }).notNull(),
	data: json(),
	recipientQrcode: varchar("recipient_qrcode", { length: 64 }).default(sql`NULL`),
}, (table) => [
	index("idx_transactions_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_transactions_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "transactions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("uq_transactions_recipient_qrcode").on(table.recipientQrcode),
]);
