DROP TABLE IF EXISTS features_listings    CASCADE;
DROP TABLE IF EXISTS roles_permissions    CASCADE;
DROP TABLE IF EXISTS applications         CASCADE;
DROP TABLE IF EXISTS listings             CASCADE;
DROP TABLE IF EXISTS listing_pictures     CASCADE;
DROP TABLE IF EXISTS agencies_pictures    CASCADE;
DROP TABLE IF EXISTS features             CASCADE;
DROP TABLE IF EXISTS feature_type         CASCADE;
DROP TABLE IF EXISTS listing_address      CASCADE;
DROP TABLE IF EXISTS listing_type         CASCADE;
DROP TABLE IF EXISTS listing_status       CASCADE;
DROP TABLE IF EXISTS application_status   CASCADE;
DROP TABLE IF EXISTS users                CASCADE;
DROP TABLE IF EXISTS agencies             CASCADE;
DROP TABLE IF EXISTS agency_address       CASCADE;
DROP TABLE IF EXISTS permissions          CASCADE;
DROP TABLE IF EXISTS roles                CASCADE;

CREATE TABLE permissions (
    tag_permission  VARCHAR(100) PRIMARY KEY
);

CREATE TABLE roles (
    id_role     SERIAL      PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE feature_type (
    id_feature_type SERIAL       PRIMARY KEY,
    label           VARCHAR(100) NOT NULL
);

CREATE TABLE listing_type (
    id_type SERIAL       PRIMARY KEY,
    label   VARCHAR(100) NOT NULL
);

CREATE TABLE listing_status (
    id_status   SERIAL       PRIMARY KEY,
    label       VARCHAR(100) NOT NULL
);

CREATE TABLE application_status (
    id_applications_status  SERIAL       PRIMARY KEY,
    label                   VARCHAR(100) NOT NULL
);

CREATE TABLE agency_address (
    id_address  SERIAL       PRIMARY KEY,
    address     VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    zip_code    VARCHAR(10)  NOT NULL
);

CREATE TABLE listing_address (
    id_address  SERIAL       PRIMARY KEY,
    address     VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    zip_code    VARCHAR(10)  NOT NULL
);

CREATE TABLE agencies (
    id_agency       SERIAL       PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    phone_number    VARCHAR(20),
    fk_address      INT          NOT NULL,

    CONSTRAINT fk_agency_address
        FOREIGN KEY (fk_address) REFERENCES agency_address(id_address)
);

CREATE TABLE agencies_pictures (
    id_picture  SERIAL  PRIMARY KEY,
    picture     TEXT    NOT NULL,
    fk_agency   INT     NOT NULL,

    CONSTRAINT fk_agpic_agency
        FOREIGN KEY (fk_agency) REFERENCES agencies(id_agency) ON DELETE CASCADE
);

CREATE TABLE users (
    id_user             SERIAL       PRIMARY KEY,
    username            VARCHAR(100) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    profile_picture     TEXT,
    profile_description TEXT,
    fk_agency           INT,
    fk_role             INT          NOT NULL,

    CONSTRAINT fk_user_agency
        FOREIGN KEY (fk_agency) REFERENCES agencies(id_agency) ON DELETE SET NULL,
    CONSTRAINT fk_user_role
        FOREIGN KEY (fk_role)   REFERENCES roles(id_role)
);

CREATE TABLE roles_permissions (
    fk_role         INT          NOT NULL,
    tag_permission  VARCHAR(100) NOT NULL,

    PRIMARY KEY (fk_role, tag_permission),

    CONSTRAINT fk_rp_role
        FOREIGN KEY (fk_role)        REFERENCES roles(id_role)              ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission
        FOREIGN KEY (tag_permission) REFERENCES permissions(tag_permission)  ON DELETE CASCADE
);

CREATE TABLE listing_pictures (
    id_picture  SERIAL PRIMARY KEY,
    picture     TEXT   NOT NULL
);

CREATE TABLE features (
    id_feature      SERIAL       PRIMARY KEY,
    feature_icon    VARCHAR(100),
    feature_name    VARCHAR(100) NOT NULL,
    id_feature_type INT          NOT NULL,

    CONSTRAINT fk_feature_type
        FOREIGN KEY (id_feature_type) REFERENCES feature_type(id_feature_type)
);

CREATE TABLE listings (
    id_listing          SERIAL         PRIMARY KEY,
    title               VARCHAR(200)   NOT NULL,
    description         TEXT,
    price               NUMERIC(12, 2) NOT NULL,
    room_count          INT,
    energy_rating       CHAR(1),
    publication_date    DATE           NOT NULL DEFAULT CURRENT_DATE,
    land_area           NUMERIC(10, 2),
    bedroom_count       INT,
    living_area         NUMERIC(10, 2),
    floor_number        INT,

    fk_address          INT            NOT NULL,
    fk_type             INT            NOT NULL,
    fk_picture          INT,
    fk_status           INT            NOT NULL,
    fk_agency           INT            NOT NULL,

    CONSTRAINT fk_listing_address
        FOREIGN KEY (fk_address) REFERENCES listing_address(id_address),
    CONSTRAINT fk_listing_type
        FOREIGN KEY (fk_type)    REFERENCES listing_type(id_type),
    CONSTRAINT fk_listing_picture
        FOREIGN KEY (fk_picture) REFERENCES listing_pictures(id_picture),
    CONSTRAINT fk_listing_status
        FOREIGN KEY (fk_status)  REFERENCES listing_status(id_status),
    CONSTRAINT fk_listing_agency
        FOREIGN KEY (fk_agency)  REFERENCES agencies(id_agency)
);

ALTER TABLE listing_pictures
    ADD COLUMN fk_listing INT,
    ADD CONSTRAINT fk_lp_listing
        FOREIGN KEY (fk_listing) REFERENCES listings(id_listing) ON DELETE CASCADE;

CREATE TABLE features_listings (
    fk_feature  INT NOT NULL,
    fk_listing  INT NOT NULL,

    PRIMARY KEY (fk_feature, fk_listing),

    CONSTRAINT fk_fl_feature
        FOREIGN KEY (fk_feature) REFERENCES features(id_feature)  ON DELETE CASCADE,
    CONSTRAINT fk_fl_listing
        FOREIGN KEY (fk_listing) REFERENCES listings(id_listing)  ON DELETE CASCADE
);

CREATE TABLE applications (
    id_application  SERIAL       PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    message         TEXT,
    submission_date DATE         NOT NULL DEFAULT CURRENT_DATE,

    fk_status       INT          NOT NULL,
    fk_user         INT          NOT NULL,
    fk_listing      INT          NOT NULL,

    CONSTRAINT fk_app_status
        FOREIGN KEY (fk_status)  REFERENCES application_status(id_applications_status),
    CONSTRAINT fk_app_user
        FOREIGN KEY (fk_user)    REFERENCES users(id_user)           ON DELETE CASCADE,
    CONSTRAINT fk_app_listing
        FOREIGN KEY (fk_listing) REFERENCES listings(id_listing)     ON DELETE CASCADE
);

INSERT INTO roles (role_name) VALUES
    ('admin'),
    ('agent'),
    ('client');

INSERT INTO permissions (tag_permission) VALUES
    ('listings.create'),
    ('listings.edit'),
    ('listings.delete'),
    ('applications.view'),
    ('applications.manage'),
    ('users.manage'),
    ('agencies.manage');

INSERT INTO roles_permissions (fk_role, tag_permission) VALUES
    (1, 'listings.create'),
    (1, 'listings.edit'),
    (1, 'listings.delete'),
    (1, 'applications.view'),
    (1, 'applications.manage'),
    (1, 'users.manage'),
    (1, 'agencies.manage'),
    (2, 'listings.create'),
    (2, 'listings.edit'),
    (2, 'listings.delete'),
    (2, 'applications.view'),
    (2, 'applications.manage'),
    (3, 'applications.view');

INSERT INTO listing_type (label) VALUES
    ('Vente'),
    ('Location'),
    ('Viager');

INSERT INTO listing_status (label) VALUES
    ('Disponible'),
    ('Sous compromis'),
    ('Vendu'),
    ('Loué'),
    ('Archivé');

INSERT INTO application_status (label) VALUES
    ('En attente'),
    ('Acceptée'),
    ('Refusée'),
    ('Annulée');

INSERT INTO feature_type (label) VALUES
    ('Extérieur'),
    ('Intérieur'),
    ('Sécurité'),
    ('Énergie');

INSERT INTO features (feature_icon, feature_name, id_feature_type) VALUES
    ('pool',     'Piscine',           1),
    ('garden',   'Jardin',            1),
    ('garage',   'Garage',            1),
    ('balcony',  'Balcon',            1),
    ('cellar',   'Cave',              2),
    ('elevator', 'Ascenseur',         2),
    ('alarm',    'Alarme',            3),
    ('digicode', 'Digicode',          3),
    ('solar',    'Panneaux solaires', 4),
    ('dpe_a',    'DPE A',             4);

INSERT INTO agency_address (address, city, zip_code) VALUES
    ('12 Cours Mirabeau', 'Aix-en-Provence', '13100');

INSERT INTO agencies (name, description, phone_number, fk_address) VALUES
    ('Ymmo Siège', 'Siège social Ymmo — Aix-en-Provence', '04 42 00 00 00', 1);

INSERT INTO users (username, password, email, fk_agency, fk_role) VALUES
    ('admin', '$2b$12$placeholder_hash', 'admin@ymmo.fr', 1, 1);