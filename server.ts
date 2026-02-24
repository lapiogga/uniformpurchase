import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json({ success: true, users });
  });

  app.get("/api/points/:userId", (req, res) => {
    const points = db.prepare("SELECT * FROM point_summary WHERE user_id = ?").get(req.params.userId);
    res.json({ success: true, points });
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json({ success: true, products });
  });

  app.get("/api/inventory/:storeId", (req, res) => {
    const inventory = db.prepare(`
      SELECT i.*, p.name, p.price, p.image_url 
      FROM inventory i 
      JOIN products p ON i.product_id = p.id 
      WHERE i.store_id = ?
    `).all(req.params.storeId);
    res.json({ success: true, inventory });
  });

  app.post("/api/orders", (req, res) => {
    const { user_id, store_id, order_type, product_type, total_amount, items } = req.body;
    const order_number = "ORD-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(Math.random() * 10000);
    const id = crypto.randomUUID();
    
    const stmt = db.prepare("INSERT INTO orders (id, order_number, user_id, store_id, order_type, product_type, status, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(id, order_number, user_id, store_id, order_type, product_type, "pending", total_amount);
    
    if (product_type === "custom" && items && items.length > 0) {
      const ticketId = crypto.randomUUID();
      const ticketNumber = "TKT-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(Math.random() * 10000);
      db.prepare("INSERT INTO tailoring_tickets (id, ticket_number, user_id, tailor_id, product_id, status) VALUES (?, ?, ?, ?, ?, ?)").run(ticketId, ticketNumber, user_id, null, items[0].product_id, "issued");
    }

    // Deduct points
    db.prepare("UPDATE point_summary SET used_points = used_points + ? WHERE user_id = ?").run(total_amount, user_id);

    res.json({ success: true, order_number });
  });

  app.get("/api/tickets", (req, res) => {
    const tickets = db.prepare("SELECT * FROM tailoring_tickets").all();
    res.json({ success: true, tickets });
  });

  app.post("/api/tickets/register", (req, res) => {
    const { ticket_number, tailor_id } = req.body;
    const ticket = db.prepare("SELECT * FROM tailoring_tickets WHERE ticket_number = ?").get(ticket_number) as any;
    if (ticket && ticket.status === "issued") {
      db.prepare("UPDATE tailoring_tickets SET status = 'registered', tailor_id = ?, registered_at = CURRENT_TIMESTAMP WHERE ticket_number = ?").run(tailor_id, ticket_number);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid or already registered ticket" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
