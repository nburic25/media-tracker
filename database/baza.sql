-- USER ROLE
CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES user_role(id) ON DELETE SET NULL
);

-- MEDIA TYPE
CREATE TABLE media_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- MEDIA
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type_id INT,
    description TEXT,
    release_year INT,
    image TEXT,
    video_url TEXT,
    FOREIGN KEY (type_id) REFERENCES media_type(id) ON DELETE SET NULL
);

-- GENRE
CREATE TABLE genre (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- MEDIA_GENRE (M:N)
CREATE TABLE media_genre (
    media_id INT,
    genre_id INT,
    PRIMARY KEY (media_id, genre_id),
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE CASCADE
);

-- USER MEDIA STATUS
CREATE TABLE user_media_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- USER MEDIA
CREATE TABLE user_media (
    id SERIAL PRIMARY KEY,
    user_id INT,
    media_id INT,
    status_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    UNIQUE (user_id, media_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES user_media_status(id) ON DELETE SET NULL
);

-- COMMENTS
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INT,
    media_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

-- INSERT

INSERT INTO user_role (name) VALUES
('admin'),
('user');

INSERT INTO media_type (name) VALUES
('movie'),
('series'),
('game');

INSERT INTO user_media_status (name) VALUES
('wishlist'),
('watching'),
('completed');

INSERT INTO genre (name) VALUES
('action'),
('adventure'),
('drama'),
('comedy'),
('horror'),
('sci-fi'),
('fantasy'),
('thriller'),
('crime'),
('mystery'),
('animation'),
('documentary'),
('rpg');
