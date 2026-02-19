export const seedSQL = `
-- Customers
INSERT INTO customers (full_name, email, city) VALUES
('Alice Johnson', 'alice@example.com', 'New York'),
('Bob Smith', 'bob@example.com', 'Los Angeles'),
('Charlie Brown', 'charlie@example.com', 'Chicago'),
('David Miller', 'david@example.com', 'Houston'),
('Emma Wilson', 'emma@example.com', 'Seattle'),
('Frank Taylor', 'frank@example.com', 'Boston'),
('Grace Lee', 'grace@example.com', 'San Francisco'),
('Henry Adams', 'henry@example.com', 'Austin'),
('Ivy Clark', 'ivy@example.com', 'Denver'),
('Jack White', 'jack@example.com', 'Miami'),
('NoOrder User', 'noorder@example.com', 'Nowhere');

-- Products
INSERT INTO products (product_name, category, price) VALUES
('Laptop', 'Electronics', 1200.00),
('Mouse', 'Electronics', 25.00),
('Keyboard', 'Electronics', 75.00),
('Monitor', 'Electronics', 300.00),
('Desk Chair', 'Furniture', 150.00),
('Desk', 'Furniture', 400.00),
('Pen', 'Stationery', 2.00),
('Notebook', 'Stationery', 5.00),
('Headphones', 'Accessories', 80.00),
('Backpack', 'Accessories', 60.00);

-- Orders
INSERT INTO orders (customer_id, order_date, status) VALUES
(1, '2025-01-05', 'completed'),
(2, '2025-01-07', 'completed'),
(3, '2025-01-10', 'completed'),
(1, '2025-01-12', 'completed'),
(4, '2025-01-15', 'cancelled'),
(5, '2025-01-18', 'completed'),
(6, '2025-01-20', 'completed'),
(7, '2025-01-22', 'completed'),
(8, '2025-01-25', 'completed'),
(2, '2025-01-28', 'completed'),
(9, '2025-02-02', 'completed'),
(10, '2025-02-05', 'completed'),
(1, '2025-02-10', 'completed'),
(2, '2025-03-01', 'completed'),
(11, '2025-01-20', 'pending');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1),
(2, 4, 1),
(3, 7, 10),
(4, 6, 1),
(5, 5, 1),
(6, 8, 5),
(7, 9, 2),
(8, 2, 3),
(9, 1, 1),
(10, 7, 20),
(11, 5, 1),
(11, 6, 1),
(12, 1, 1),
(12, 2, 1),
(13, 4, 1),
(14, 1, 1),
(15, 8, 2);

-- Payments
INSERT INTO payments (order_id, payment_date, amount, method) VALUES
(1, '2025-01-05', 1250.00, 'card'),
(2, '2025-01-07', 375.00, 'cash'),
(3, '2025-01-10', 20.00, 'upi'),
(4, '2025-01-12', 400.00, 'card'),
(6, '2025-01-18', 25.00, 'cash'),
(7, '2025-01-20', 160.00, 'card'),
(8, '2025-01-22', 75.00, 'upi'),
(9, '2025-01-25', 1200.00, 'card'),
(10, '2025-01-28', 40.00, 'cash'),
(11, '2025-02-02', 550.00, 'card'),
(12, '2025-02-05', 1225.00, 'card'),
(13, '2025-02-10', 300.00, 'card'),
(14, '2025-03-01', 1000.00, 'card');
`;