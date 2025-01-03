CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    roleId INTEGER,
    expireDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roleId) REFERENCES Role (id)
);

CREATE TABLE Role (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE RoleText (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roleId INTEGER UNIQUE NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (roleId) REFERENCES Role (id)
);
