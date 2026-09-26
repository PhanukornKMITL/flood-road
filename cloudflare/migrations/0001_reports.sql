PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS road_reports (
  id TEXT PRIMARY KEY,
  road_key TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('clear','flood','closed')),
  observed_at INTEGER NOT NULL,
  submitted_at INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  photo_key TEXT,
  CHECK(observed_at <= submitted_at)
);
CREATE INDEX IF NOT EXISTS road_reports_timeline ON road_reports(road_key, observed_at DESC, submitted_at DESC);
CREATE INDEX IF NOT EXISTS road_reports_reporters ON road_reports(road_key, reporter_id);
CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  need TEXT NOT NULL,
  people INTEGER NOT NULL CHECK(people BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','resolved','cancelled')),
  submitted_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  photo_key TEXT
);
CREATE INDEX IF NOT EXISTS help_requests_status ON help_requests(status, updated_at DESC);
