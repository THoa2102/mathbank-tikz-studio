const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { dataDir } = require("./paths");

const listFields = [
  "id",
  "title",
  "figure_type",
  "grade",
  "chapter",
  "lesson",
  "topic",
  "difficulty",
  "tikz_code",
  "scene_json",
  "created_at",
  "updated_at"
];

function normalizeAsset(asset) {
  const id = `tikz_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  return {
    id,
    title: String(asset.title || "Hình TikZ"),
    figure_type: asset.figureType || asset.figure_type || null,
    grade: asset.grade ? Number(asset.grade) : null,
    chapter: asset.chapter || null,
    lesson: asset.lesson || null,
    topic: asset.topic || null,
    difficulty: asset.difficulty || null,
    image_data_url: asset.imageDataUrl || asset.image_data_url || null,
    tikz_code: asset.tikzCode || asset.tikz_code || "",
    scene_json: asset.sceneJson || asset.scene_json || null,
    created_at: now,
    updated_at: now
  };
}

function matchFilter(item, { q, grade }) {
  if (q) {
    const kw = q.toLowerCase();
    const haystack = [item.title, item.chapter, item.lesson, item.topic]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(kw)) return false;
  }
  if (grade !== "" && grade !== null && grade !== undefined) {
    if (Number(item.grade) !== Number(grade)) return false;
  }
  return true;
}

// ----- Backend SQLite (uu tien) -----
function createSqliteBackend() {
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(path.join(dataDir, "mathbank.db"));
  db.exec(`
    CREATE TABLE IF NOT EXISTS tikz_assets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      figure_type TEXT,
      grade INTEGER,
      chapter TEXT,
      lesson TEXT,
      topic TEXT,
      difficulty TEXT,
      image_data_url TEXT,
      tikz_code TEXT,
      scene_json TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_assets_grade ON tikz_assets(grade);
    CREATE INDEX IF NOT EXISTS idx_assets_created ON tikz_assets(created_at);
  `);

  const cols = listFields.join(", ");
  return {
    kind: "sqlite",
    listAssets({ q = "", grade = "" } = {}) {
      const where = [];
      const params = {};
      if (q) {
        where.push("(title LIKE :kw OR chapter LIKE :kw OR lesson LIKE :kw OR topic LIKE :kw)");
        params.kw = `%${q}%`;
      }
      if (grade !== "" && grade !== null && grade !== undefined) {
        where.push("grade = :grade");
        params.grade = Number(grade);
      }
      const sql =
        `SELECT ${cols} FROM tikz_assets` +
        (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
        " ORDER BY datetime(created_at) DESC LIMIT 200";
      return db.prepare(sql).all(params);
    },
    getAsset(id) {
      return db.prepare("SELECT * FROM tikz_assets WHERE id = ?").get(id) || null;
    },
    createAsset(asset) {
      const row = normalizeAsset(asset);
      db.prepare(
        `INSERT INTO tikz_assets
          (id, title, figure_type, grade, chapter, lesson, topic, difficulty, image_data_url, tikz_code, scene_json, created_at, updated_at)
         VALUES
          (:id, :title, :figure_type, :grade, :chapter, :lesson, :topic, :difficulty, :image_data_url, :tikz_code, :scene_json, :created_at, :updated_at)`
      ).run(row);
      return this.getAsset(row.id);
    },
    deleteAsset(id) {
      return db.prepare("DELETE FROM tikz_assets WHERE id = ?").run(id).changes > 0;
    }
  };
}

// ----- Backend JSON (du phong khi khong co node:sqlite) -----
function createJsonBackend() {
  const file = path.join(dataDir, "mathbank.json");
  function readAll() {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      return [];
    }
  }
  function writeAll(items) {
    fs.writeFileSync(file, JSON.stringify(items, null, 2), "utf8");
  }
  return {
    kind: "json",
    listAssets(filter = {}) {
      return readAll()
        .filter((item) => matchFilter(item, filter))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 200)
        .map((item) => {
          const light = {};
          for (const key of listFields) light[key] = item[key];
          return light;
        });
    },
    getAsset(id) {
      return readAll().find((item) => item.id === id) || null;
    },
    createAsset(asset) {
      const row = normalizeAsset(asset);
      const items = readAll();
      items.unshift(row);
      writeAll(items);
      return row;
    },
    deleteAsset(id) {
      const items = readAll();
      const next = items.filter((item) => item.id !== id);
      writeAll(next);
      return next.length !== items.length;
    }
  };
}

let backend;
try {
  backend = createSqliteBackend();
} catch (error) {
  console.warn(`node:sqlite khong dung duoc (${error.message}); chuyen sang luu JSON.`);
  backend = createJsonBackend();
}

console.log(`Thu vien hinh: backend ${backend.kind}, du lieu tai ${dataDir}`);

module.exports = {
  backendKind: backend.kind,
  listAssets: (...args) => backend.listAssets(...args),
  getAsset: (...args) => backend.getAsset(...args),
  createAsset: (...args) => backend.createAsset(...args),
  deleteAsset: (...args) => backend.deleteAsset(...args)
};
