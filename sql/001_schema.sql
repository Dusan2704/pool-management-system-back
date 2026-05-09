CREATE DATABASE IF NOT EXISTS bazeni
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bazeni;


-- Tabela: user
-- Svi korisnicki nalozi 

CREATE TABLE IF NOT EXISTS user (
  user_id       VARCHAR(36)          NOT NULL,
  first_name    VARCHAR(50)          NOT NULL,
  last_name     VARCHAR(50)          NOT NULL,
  email         VARCHAR(120)         NOT NULL,
  phone         VARCHAR(20)          NOT NULL,
  password_hash VARCHAR(255)         NOT NULL,
  role          ENUM('admin','user') NOT NULL DEFAULT 'user',
  is_active     TINYINT(1)           NOT NULL DEFAULT 1,
  created_at    DATETIME             NOT NULL DEFAULT NOW(),
  updated_at    DATETIME                      DEFAULT NULL ON UPDATE NOW(),
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabela: pool_session
-- Termini za koriscenje bazena koje unosi administrator

CREATE TABLE IF NOT EXISTS pool_session (
  session_id   VARCHAR(36)              NOT NULL,
  session_date DATE                     NOT NULL,
  start_time   TIME                     NOT NULL,
  end_time     TIME                     NOT NULL,
  capacity     INT                      NOT NULL,
  status       ENUM('open','cancelled') NOT NULL DEFAULT 'open',
  created_by   VARCHAR(36)              NOT NULL,
  created_at   DATETIME                 NOT NULL DEFAULT NOW(),
  updated_at   DATETIME                          DEFAULT NULL ON UPDATE NOW(),
  PRIMARY KEY (session_id),
  CONSTRAINT fk_session_creator FOREIGN KEY (created_by)
    REFERENCES user(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabela: reservation
-- Veza N:M izmedju korisnika i termina

CREATE TABLE IF NOT EXISTS reservation (
  reservation_id VARCHAR(36)                                          NOT NULL,
  user_id        VARCHAR(36)                                          NOT NULL,
  session_id     VARCHAR(36)                                          NOT NULL,
  status         ENUM('active','cancelled_by_user','cancelled_by_admin') NOT NULL DEFAULT 'active',
  reserved_at    DATETIME                                             NOT NULL DEFAULT NOW(),
  cancelled_at   DATETIME                                                      DEFAULT NULL,
  cancelled_by   VARCHAR(36)                                                   DEFAULT NULL,
  PRIMARY KEY (reservation_id),
  UNIQUE KEY uq_user_session (user_id, session_id),
  CONSTRAINT fk_reservation_user    FOREIGN KEY (user_id)    REFERENCES user(user_id)         ON DELETE RESTRICT,
  CONSTRAINT fk_reservation_session FOREIGN KEY (session_id) REFERENCES pool_session(session_id) ON DELETE RESTRICT,
  CONSTRAINT fk_reservation_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabela: page
-- CMS modul - tekstualne stranice koje urdjuje admin

CREATE TABLE IF NOT EXISTS page (
  page_id      VARCHAR(36)  NOT NULL,
  slug         VARCHAR(80)  NOT NULL,
  title        VARCHAR(120) NOT NULL,
  content      LONGTEXT              DEFAULT NULL,
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order   INT          NOT NULL DEFAULT 0,
  updated_by   VARCHAR(36)           DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT NOW(),
  updated_at   DATETIME              DEFAULT NULL ON UPDATE NOW(),
  PRIMARY KEY (page_id),
  UNIQUE KEY uq_page_slug (slug),
  CONSTRAINT fk_page_editor FOREIGN KEY (updated_by)
    REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabela: refresh_token
-- Cuva izdate refresh tokene radi mogucnosti opoziva

CREATE TABLE IF NOT EXISTS refresh_token (
  token_id   VARCHAR(36)  NOT NULL,
  user_id    VARCHAR(36)  NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME     NOT NULL,
  revoked_at DATETIME              DEFAULT NULL,
  created_at DATETIME     NOT NULL DEFAULT NOW(),
  PRIMARY KEY (token_id),
  UNIQUE KEY uq_token_hash (token_hash),
  CONSTRAINT fk_token_user FOREIGN KEY (user_id)
    REFERENCES user(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
