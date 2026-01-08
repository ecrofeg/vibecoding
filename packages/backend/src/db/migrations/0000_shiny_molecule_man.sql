CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`current_balance` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `planned_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`date` text NOT NULL,
	`source_type` text NOT NULL,
	`savings_account_id` text,
	FOREIGN KEY (`savings_account_id`) REFERENCES `savings_accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`period` text NOT NULL,
	`day_of_month` integer,
	`day_of_week` integer,
	`source_type` text NOT NULL,
	`savings_account_id` text,
	FOREIGN KEY (`savings_account_id`) REFERENCES `savings_accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `recurring_income` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`period` text NOT NULL,
	`day_of_month` integer,
	`day_of_week` integer,
	`destination_type` text NOT NULL,
	`savings_account_id` text,
	FOREIGN KEY (`savings_account_id`) REFERENCES `savings_accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `savings_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`annual_interest_rate` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`document_id` text NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`linked_transaction_id` text,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade
);
