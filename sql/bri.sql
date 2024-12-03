-- create database
CREATE DATABASE IF NOT EXISTS bri_life;

-- dbbril_agen
CREATE TABLE IF NOT EXISTS dbbril_agen (
    id SERIAL PRIMARY KEY,
    level VARCHAR(8) NOT NULL,
    keterangan VARCHAR(255) NOT NULL,
    urutan INT NOT NULL CHECK (urutan > 0)
);

-- dbo.agen
CREATE TABLE IF NOT EXISTS dbo_agen (
    id SERIAL PRIMARY KEY,
    no_lisensi VARCHAR(8) NOT NULL,
    nama_agen VARCHAR(8) NOT NULL,
    id_agen_level INT NOT NULL,
    status BOOLEAN NOT NULL,
    status_tgl DATE NOT NULL,
    wilayah_kerja VARCHAR(255) NOT NULL,
    -- ref
    FOREIGN KEY (id_agen_level) REFERENCES dbbril_agen (id) ON DELETE CASCADE
);

-- dbo.agen_struktur
CREATE TABLE IF NOT EXISTS dbo_agen_struktur (
    id SERIAL PRIMARY KEY,
    parent_id INT,
    id_agen INT NOT NULL,
    berlaku_mulai DATE NOT NULL,
    berlaku_akhir DATE NOT NULL,
    status BOOLEAN NOT NULL,
    keteragan VARCHAR(255),
    -- ref
    FOREIGN KEY (id_agen) REFERENCES dbo_agen (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES dbo_agen (id) ON DELETE SET NULL
);