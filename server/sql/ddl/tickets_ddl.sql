CREATE TABLE tickets (
    id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    create_time timestamp without time zone DEFAULT now(),
    severity integer,
    message varchar(1024),
    PRIMARY KEY (id)
);