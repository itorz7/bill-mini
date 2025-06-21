import { relations } from "drizzle-orm/relations";
import { users, transactions } from "./schema";

export const transactionsRelations = relations(transactions, ({one}) => ({
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	transactions: many(transactions),
}));