export const schemaSQL = `
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

PRAGMA foreign_keys = ON;

-- Customers
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  city TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);

-- Orders
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  order_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order Items
CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Payments
CREATE TABLE payments (
  payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  payment_date TEXT NOT NULL,
  amount REAL NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('card', 'cash', 'upi')),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
`;