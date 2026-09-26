CREATE TABLE IF NOT EXISTS road_latest(road_key TEXT PRIMARY KEY,id TEXT,reporter_id TEXT,status TEXT,observed_at INTEGER,submitted_at INTEGER,note TEXT);
INSERT OR IGNORE INTO road_latest SELECT road_key,id,reporter_id,status,observed_at,submitted_at,note FROM road_reports ORDER BY observed_at DESC,submitted_at DESC;
CREATE TRIGGER IF NOT EXISTS update_road_latest AFTER INSERT ON road_reports BEGIN
INSERT INTO road_latest VALUES(NEW.road_key,NEW.id,NEW.reporter_id,NEW.status,NEW.observed_at,NEW.submitted_at,NEW.note)
ON CONFLICT(road_key) DO UPDATE SET id=excluded.id,reporter_id=excluded.reporter_id,status=excluded.status,observed_at=excluded.observed_at,submitted_at=excluded.submitted_at,note=excluded.note WHERE excluded.observed_at>road_latest.observed_at OR (excluded.observed_at=road_latest.observed_at AND excluded.submitted_at>road_latest.submitted_at);
END;
CREATE INDEX IF NOT EXISTS reports_recent_by_reporter ON road_reports(reporter_id,submitted_at);
