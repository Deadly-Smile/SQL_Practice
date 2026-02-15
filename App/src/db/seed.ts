export const seedSQL = `
-- Seed users
INSERT INTO users (username, email) VALUES
  ('alice', 'alice@example.com'),
  ('bob', 'bob@example.com'),
  ('charlie', 'charlie@example.com');

-- Seed products
INSERT INTO products (name, price, category, stock) VALUES
  ('Laptop', 999.99, 'Electronics', 15),
  ('Mouse', 29.99, 'Electronics', 50),
  ('Keyboard', 79.99, 'Electronics', 30),
  ('Desk Chair', 199.99, 'Furniture', 10),
  ('Monitor', 299.99, 'Electronics', 20);

-- Seed orders
INSERT INTO orders (user_id, product_id, quantity) VALUES
  (1, 1, 1),
  (1, 2, 2),
  (2, 3, 1),
  (2, 4, 1),
  (3, 5, 2),
  (3, 2, 3);
`;