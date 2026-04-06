import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "..", "database.json");

interface Database {
  users: any[];
  products: any[];
  orders: any[];
  order_items: any[];
  pickup_slots: any[];
  reviews: any[];
}

const getDb = (): Database => {
  if (!fs.existsSync(dbPath)) {
    const initialDb: Database = {
      users: [],
      products: [],
      orders: [],
      order_items: [],
      pickup_slots: [],
      reviews: [],
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  // Ensure all tables exist (for backward compatibility)
  if (!data.pickup_slots) data.pickup_slots = [];
  if (!data.reviews) data.reviews = [];
  return data;
};

const saveDb = (db: Database) => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

export const dbInit = async () => {
  getDb();
};

export const query = async (table: keyof Database, filter: (item: any) => boolean = () => true) => {
  const db = getDb();
  return db[table].filter(filter);
};

export const get = async (table: keyof Database, filter: (item: any) => boolean) => {
  const db = getDb();
  return db[table].find(filter);
};

export const run = async (table: keyof Database, action: "insert" | "update" | "delete", data: any, filter: (item: any) => boolean = () => false) => {
  const db = getDb();
  if (action === "insert") {
    db[table].push(data);
  } else if (action === "update") {
    const index = db[table].findIndex(filter);
    if (index !== -1) {
      db[table][index] = { ...db[table][index], ...data };
    }
  } else if (action === "delete") {
    db[table] = db[table].filter((item) => !filter(item));
  }
  saveDb(db);
};

export default { getDb, saveDb };
