-- Migration to create housekeeping table to track background tasks results

CREATE TABLE IF NOT EXISTS housekeeping(
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    create_time timestamp without time zone DEFAULT now(),
    "data" JSONB,
    failed integer DEFAULT 0,
    passed integer DEFAULT 0,
    skipped integer DEFAULT 0,
    PRIMARY KEY(id)
);
