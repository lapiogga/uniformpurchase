import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT,
    rank TEXT,
    military_number TEXT,
    unit TEXT,
    store_id TEXT,
    tailor_id TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS point_summary (
    user_id TEXT PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    used_points INTEGER DEFAULT 0,
    reserved_points INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    product_type TEXT,
    price INTEGER,
    image_url TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    store_id TEXT,
    product_id TEXT,
    spec TEXT,
    quantity INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE,
    user_id TEXT,
    store_id TEXT,
    order_type TEXT,
    product_type TEXT,
    status TEXT,
    total_amount INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tailoring_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE,
    user_id TEXT,
    tailor_id TEXT,
    product_id TEXT,
    status TEXT,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    registered_at DATETIME
  );
`);

// Seed data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, email, password, name, role, rank, military_number, unit, store_id, tailor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertPoints = db.prepare('INSERT INTO point_summary (user_id, total_points, used_points, reserved_points) VALUES (?, ?, ?, ?)');

  // Admin
  insertUser.run('u1', 'admin@mil.kr', '1234', '김관리', 'admin', '대위', '12-345678', '국방부', null, null);
  insertPoints.run('u1', 600000, 0, 0);

  // Store
  insertUser.run('u2', 'store@mil.kr', '1234', '이판매', 'store', '중사', '15-123456', '제1피복판매소', 's1', null);
  insertPoints.run('u2', 400000, 0, 0);

  // Tailor
  insertUser.run('u3', 'tailor@mil.kr', '1234', '박체척', 'tailor', null, null, '맞춤양복점', null, 't1');
  insertPoints.run('u3', 0, 0, 0);

  // User
  insertUser.run('u4', 'user@mil.kr', '1234', '최장교', 'user', '소위', '20-987654', '제1보병사단', null, null);
  insertPoints.run('u4', 600000, 150000, 0);

  // Products
  const insertProduct = db.prepare('INSERT INTO products (id, name, category, product_type, price, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertProduct.run('p1', '전투복 상의', '전투복', 'finished', 45000, 'https://picsum.photos/seed/p1/400/400?blur=4', '사계절용 전투복 상의');
  insertProduct.run('p2', '전투복 하의', '전투복', 'finished', 40000, 'https://picsum.photos/seed/p2/400/400?blur=4', '사계절용 전투복 하의');
  insertProduct.run('p3', '맞춤 정복', '정복', 'custom', 250000, 'https://picsum.photos/seed/p3/400/400?blur=4', '장교용 맞춤 정복');

  // Inventory
  const insertInventory = db.prepare('INSERT INTO inventory (id, store_id, product_id, spec, quantity) VALUES (?, ?, ?, ?, ?)');
  insertInventory.run('i1', 's1', 'p1', '100', 50);
  insertInventory.run('i2', 's1', 'p1', '105', 30);
  insertInventory.run('i3', 's1', 'p2', '80', 40);
  insertInventory.run('i4', 's1', 'p2', '85', 20);
}

export default db;
