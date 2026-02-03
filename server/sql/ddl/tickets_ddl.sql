CREATE TABLE tickets (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    create_time timestamp without time zone DEFAULT now(),
    severity integer,
    message TEXT,
    status varchar(20) DEFAULT 'open',
    PRIMARY KEY (id)
);