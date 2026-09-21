import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum & label dipisah ke modul murni (tanpa import drizzle) supaya komponen
// client bisa memakainya tanpa ikut menarik driver database ke bundle browser.
export * from '@/lib/laundry/enums';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  // Outlet yang boleh diakses anggota ini. NULL = semua outlet
  // (dipakai untuk OWNER dan manajer pusat).
  outletId: integer('outlet_id').references(() => outlets.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

// ---------------------------------------------------------------------------
// Domain laundry (Fase 1)
//
// Catatan konvensi, berlaku untuk semua tabel di bawah ini:
// - Uang disimpan sebagai integer Rupiah penuh (tanpa sen, tanpa float).
// - Berat/jumlah pakai numeric(6,2) — drizzle mengembalikannya sebagai string,
//   jadi selalu lewat helper di lib/laundry/pricing.ts sebelum dihitung.
// - Waktu pakai timestamptz: simpan UTC, tampilkan WIB.
// ---------------------------------------------------------------------------

export const outlets = pgTable(
  'outlets',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    nama: varchar('nama', { length: 100 }).notNull(),
    kodeNota: varchar('kode_nota', { length: 10 }).notNull(),
    alamat: text('alamat'),
    telepon: varchar('telepon', { length: 30 }),
    aktif: boolean('aktif').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // Kode nota jadi prefix nomor nota. Dua outlet dengan kode sama akan berebut
  // urutan harian yang sama, jadi kodenya harus unik dalam satu tenant.
  (table) => [unique('outlets_team_kode_nota_unique').on(table.teamId, table.kodeNota)]
);

export const customers = pgTable(
  'customers',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    nama: varchar('nama', { length: 100 }).notNull(),
    telepon: varchar('telepon', { length: 30 }).notNull(),
    alamat: text('alamat'),
    catatan: text('catatan'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // Kasir sering buru-buru dan mendaftarkan orang yang sama dua kali.
  // Nomor WA dipakai sebagai identitas pelanggan di dalam satu tenant.
  (table) => [unique('customers_team_telepon_unique').on(table.teamId, table.telepon)]
);

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  nama: varchar('nama', { length: 100 }).notNull(),
  tipe: varchar('tipe', { length: 10 }).notNull(), // KILOAN | SATUAN
  satuan: varchar('satuan', { length: 10 }).notNull(), // kg | pcs
  hargaDefault: integer('harga_default').notNull(),
  // Minimum charge: kiloan biasanya minimal 3 kg walau bawaannya cuma 1 kg.
  minQty: numeric('min_qty', { precision: 6, scale: 2 }).notNull().default('1'),
  durasiJam: integer('durasi_jam').notNull().default(72),
  expressMultiplier: numeric('express_multiplier', { precision: 3, scale: 2 })
    .notNull()
    .default('1.5'),
  expressDurasiJam: integer('express_durasi_jam').notNull().default(24),
  aktif: boolean('aktif').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Override harga per outlet. Kalau tidak ada barisnya, pakai services.hargaDefault.
export const servicePrices = pgTable(
  'service_prices',
  {
    id: serial('id').primaryKey(),
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id),
    outletId: integer('outlet_id')
      .notNull()
      .references(() => outlets.id),
    harga: integer('harga').notNull(),
  },
  (table) => [unique('service_prices_service_outlet_unique').on(table.serviceId, table.outletId)]
);

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    outletId: integer('outlet_id')
      .notNull()
      .references(() => outlets.id),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id),
    nomorNota: varchar('nomor_nota', { length: 30 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('BARU'),
    // Diturunkan dari total pembayaran, tidak pernah diketik manual.
    statusBayar: varchar('status_bayar', { length: 20 }).notNull().default('BELUM_BAYAR'),
    tanggalMasuk: timestamp('tanggal_masuk', { withTimezone: true }).notNull().defaultNow(),
    estimasiSelesai: timestamp('estimasi_selesai', { withTimezone: true }).notNull(),
    tanggalSelesai: timestamp('tanggal_selesai', { withTimezone: true }),
    tanggalDiambil: timestamp('tanggal_diambil', { withTimezone: true }),
    subtotal: integer('subtotal').notNull().default(0),
    diskon: integer('diskon').notNull().default(0),
    total: integer('total').notNull().default(0),
    catatan: text('catatan'),
    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('orders_team_nomor_nota_unique').on(table.teamId, table.nomorNota)]
);

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  serviceId: integer('service_id')
    .notNull()
    .references(() => services.id),
  // Snapshot: nota lama harus tetap menampilkan harga saat transaksi dibuat,
  // walaupun harga layanannya sudah naik setelah itu.
  namaLayanan: varchar('nama_layanan', { length: 100 }).notNull(),
  tipe: varchar('tipe', { length: 10 }).notNull(),
  satuan: varchar('satuan', { length: 10 }).notNull(),
  qty: numeric('qty', { precision: 6, scale: 2 }).notNull(),
  hargaSatuan: integer('harga_satuan').notNull(),
  isExpress: boolean('is_express').notNull().default(false),
  subtotal: integer('subtotal').notNull(),
  catatan: text('catatan'),
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  status: varchar('status', { length: 20 }).notNull(),
  catatan: text('catatan'),
  changedBy: integer('changed_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  jumlah: integer('jumlah').notNull(),
  metode: varchar('metode', { length: 20 }).notNull(), // TUNAI | TRANSFER | QRIS | EWALLET
  catatan: text('catatan'),
  receivedBy: integer('received_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Relations domain laundry ---------------------------------------------

export const outletsRelations = relations(outlets, ({ one, many }) => ({
  team: one(teams, { fields: [outlets.teamId], references: [teams.id] }),
  orders: many(orders),
  servicePrices: many(servicePrices),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  team: one(teams, { fields: [customers.teamId], references: [teams.id] }),
  orders: many(orders),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  team: one(teams, { fields: [services.teamId], references: [teams.id] }),
  servicePrices: many(servicePrices),
  orderItems: many(orderItems),
}));

export const servicePricesRelations = relations(servicePrices, ({ one }) => ({
  service: one(services, {
    fields: [servicePrices.serviceId],
    references: [services.id],
  }),
  outlet: one(outlets, {
    fields: [servicePrices.outletId],
    references: [outlets.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  team: one(teams, { fields: [orders.teamId], references: [teams.id] }),
  outlet: one(outlets, { fields: [orders.outletId], references: [outlets.id] }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  createdByUser: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  service: one(services, {
    fields: [orderItems.serviceId],
    references: [services.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  changedByUser: one(users, {
    fields: [orderStatusHistory.changedBy],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  receivedByUser: one(users, {
    fields: [payments.receivedBy],
    references: [users.id],
  }),
}));

// --- Types & enum domain laundry ------------------------------------------

export type Outlet = typeof outlets.$inferSelect;
export type NewOutlet = typeof outlets.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ServicePrice = typeof servicePrices.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type OrderStatusHistoryRow = typeof orderStatusHistory.$inferSelect;

export type OrderWithRelations = Order & {
  outlet: Outlet;
  customer: Customer;
  items: OrderItem[];
  payments: Payment[];
};

// ---------------------------------------------------------------------------
// Notifikasi WhatsApp (Fase 2)
//
// Kredensial provider TIDAK disimpan di sini — dibaca dari environment.
// Tabel ini hanya menyimpan preferensi dan jejak pengiriman, yang bukan rahasia.
// ---------------------------------------------------------------------------

export const notificationSettings = pgTable(
  'notification_settings',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    aktifSiapAmbil: boolean('aktif_siap_ambil').notNull().default(true),
    aktifPesananMasuk: boolean('aktif_pesanan_masuk').notNull().default(false),
    templateSiapAmbil: text('template_siap_ambil').notNull(),
    templatePesananMasuk: text('template_pesanan_masuk').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('notification_settings_team_unique').on(table.teamId)]
);

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  // Boleh kosong untuk kiriman tes yang tidak terkait pesanan mana pun.
  orderId: integer('order_id').references(() => orders.id),
  jenis: varchar('jenis', { length: 20 }).notNull(),
  tujuan: varchar('tujuan', { length: 30 }).notNull(),
  // Isi final setelah template dirender, disimpan apa adanya: kalau template
  // diubah bulan depan, log lama harus tetap menunjukkan apa yang diterima pelanggan.
  pesan: text('pesan').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  provider: varchar('provider', { length: 20 }).notNull(),
  referensi: text('referensi'),
  galat: text('galat'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  team: one(teams, {
    fields: [notificationSettings.teamId],
    references: [teams.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  team: one(teams, { fields: [notifications.teamId], references: [teams.id] }),
  order: one(orders, { fields: [notifications.orderId], references: [orders.id] }),
}));

export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;

// ---------------------------------------------------------------------------
// Langganan & penagihan (Fase 3)
//
// Kredensial gateway TIDAK di sini — dibaca dari environment, sama seperti
// notifikasi WhatsApp di Fase 2.
//
// Kolom batas bernilai NULL berarti TAK TERBATAS, bukan nol. Kode yang
// membacanya wajib membedakan keduanya.
// ---------------------------------------------------------------------------

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  kode: varchar('kode', { length: 20 }).notNull().unique(),
  nama: varchar('nama', { length: 50 }).notNull(),
  hargaBulanan: integer('harga_bulanan').notNull(),
  hargaTahunan: integer('harga_tahunan').notNull(),
  maxOutlet: integer('max_outlet'),
  maxPengguna: integer('max_pengguna'),
  maxPesananPerBulan: integer('max_pesanan_per_bulan'),
  urutan: integer('urutan').notNull().default(0),
  aktif: boolean('aktif').notNull().default(true),
});

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    planId: integer('plan_id')
      .notNull()
      .references(() => plans.id),
    status: varchar('status', { length: 20 }).notNull().default('TRIAL'),
    siklus: varchar('siklus', { length: 20 }).notNull().default('BULANAN'),
    mulaiPada: timestamp('mulai_pada', { withTimezone: true }).notNull().defaultNow(),
    // NULL = tidak pernah kedaluwarsa (dipakai paket Gratis).
    berakhirPada: timestamp('berakhir_pada', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('subscriptions_team_unique').on(table.teamId)]
);

export const invoices = pgTable(
  'invoices',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.id),
    planId: integer('plan_id')
      .notNull()
      .references(() => plans.id),
    nomorInvoice: varchar('nomor_invoice', { length: 40 }).notNull(),
    siklus: varchar('siklus', { length: 20 }).notNull(),
    jumlah: integer('jumlah').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('MENUNGGU'),
    provider: varchar('provider', { length: 20 }).notNull(),
    providerRef: text('provider_ref'),
    urlBayar: text('url_bayar'),
    dibayarPada: timestamp('dibayar_pada', { withTimezone: true }),
    kedaluwarsaPada: timestamp('kedaluwarsa_pada', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('invoices_team_nomor_unique').on(table.teamId, table.nomorInvoice)]
);

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  invoices: many(invoices),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  team: one(teams, { fields: [subscriptions.teamId], references: [teams.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  team: one(teams, { fields: [invoices.teamId], references: [teams.id] }),
  plan: one(plans, { fields: [invoices.planId], references: [plans.id] }),
}));

export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;

// ---------------------------------------------------------------------------
// Email transaksional & pemulihan password (Fase 4)
// ---------------------------------------------------------------------------

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  // SHA-256 dari token asli. Token mentahnya hanya pernah ada di email —
  // tabel ini sama sensitifnya dengan tabel password, dan kalau database bocor
  // token mentah bisa langsung dipakai mengambil alih akun.
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  kedaluwarsaPada: timestamp('kedaluwarsa_pada', { withTimezone: true }).notNull(),
  dipakaiPada: timestamp('dipakai_pada', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emailLog = pgTable('email_log', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id),
  jenis: varchar('jenis', { length: 30 }).notNull(),
  tujuan: varchar('tujuan', { length: 255 }).notNull(),
  subjek: text('subjek').notNull(),
  // Isi disimpan dengan tautan yang sudah disamarkan — lihat lib/email/kirim.ts.
  // Kalau tidak, log ini berubah jadi daftar kunci cadangan setiap akun.
  isi: text('isi').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  provider: varchar('provider', { length: 20 }).notNull(),
  galat: text('galat'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type EmailLogRow = typeof emailLog.$inferSelect;
