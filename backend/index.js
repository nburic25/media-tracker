// Uvoz Express biblioteke (framework za pravljenje servera)
const express = require('express');
// Uvoz Pool iz db.js (omogucava konekciju izmedju baze i backend-a)
const pool = require("./db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "tajni_kljuc_123";

// Kreiranje Express aplikacije (backend server)
const app = express();

// Kada neko ode na homepage
app.get("/", (req, res) => {
    // req = request (šta korisnik šalje serveru)
    // res = response (šta server vraća korisniku)

    // Slanje teksta u browser
    res.send("Backend radi!");
});
//  http://localhost:3000/

// potvrda da server radi i na kom portu
app.listen(3000, () => {
    // poruka u terminal-u
    console.log("Server radi na portu 3000");
});

// STARI /media
// vraca listu + filter(ako ga ima)
// app.get("/media", (req, res) => {

//     // query parametar iz URL-a
//     // npr: /media?type=movie  
//     const type = req.query.type;

//     // baza
//     const media = [
//         { id: 1, title: "Inception", type: "movie"},
//         { id: 2, title: "Breaking Bad", type: "series"},
//         { id: 3, title: "The Witcher", type: "series"},
//         { id: 4, title: "GTA V", type: "game"}
//     ];

//     // ako nema filtera, vrati sve
//     if(!type) {
//         return res.json(media);
//     }

//     // filtriranje po type(movie, series, game)
//     const filtered = media.filter(item => item.type === type);

//     // vrati filtrirane podatke
//     res.json(filtered);
// });
// http://localhost:3000/media
// http://localhost:3000/media?type=movie
// http://localhost:3000/media?type=series
// http://localhost:3000/media?type=game

// STARI /media/:id
// vraca jedan element zavisno od toga koji je ID
// app.get("/media/:id", (req, res) => {
//     // ID iz URL-a
//     const id = req.params.id;

//     // baza
//     const media = [
//         { id: 1, title: "Inception", type: "movie" },
//         { id: 2, title: "Breaking Bad", type: "series" },
//         { id: 3, title: "The Witcher", type: "series" },
//         { id: 4, title: "GTA V", type: "game" }
//     ];

//     // trazenje elementa sa odredjenim ID-em
//     const item = media.find(m => m.id == id);

//     // ako ne postoji
//     if(!item) {
//         return res.status(404).json({ message: "Media not found"});
//     }

//     // vraca pronadjeni element
//     res.json(item);
// });
// npr: // http://localhost:3000/media/1

// provjera da li konekcija "backend-database" radi
app.get("/test-db", async (req, res) => {
    // async dozvoljava cekanje
    try {
        // await ceka rezultat; SELECT NOW() vraca trenutno vrijeme iz baze
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska konekcije sa bazom" });
    }
});
// http://localhost:3000/test-db

// vraca listu svega sto je u media tabeli
// app.get("/media", async(req, res) => {
//     try {
//         const result = await pool.query("SELECT * FROM media");
//         res.json(result.rows); 
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Greska na serveru" });
//     }
// });
// // http://localhost:3000/media

// vraca sve media ili samo jedan od tipova
app.get("/media", async (req, res) => {
    try {
        const type = req.query.type;

        let query = "SELECT * FROM media";
        let values = [];

        if (type) {
            query += " WHERE type_id = $1";

            // mapiranje (privremeno rješenje)
            let typeId;

            if (type === "movie") typeId = 1;
            else if (type === "series") typeId = 2;
            else if (type === "game") typeId = 3;

            values.push(typeId);
        }

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});
// http://localhost:3000/media
// http://localhost:3000/media?type=movie
// http://localhost:3000/media?type=series
// http://localhost:3000/media?type=game

// vraca jedan element iz media po ID-u
app.get("/media/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await pool.query(
            "SELECT * FROM media WHERE id = $1",
            [id]
        );

        res.json(result.rows[0]); // jedan rezultat
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});
// http://localhost:3000/media/1
// http://localhost:3000/media/2

// dodajemo da bi mogli da saljemo podatke u body (req.body)
app.use(express.json());

// register
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. insert u bazu
        const result = await pool.query(
            `INSERT INTO users (username, email, password, role_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, email, role_id`,
            [username, email, hashedPassword, 2]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);

        // duplicate username/email
        if (err.code === "23505") {
            return res.status(400).json({
                message: "Username ili email vec postoji"
            });
        }

        res.status(500).json({ message: "Greska na serveru" });
    }
});

// login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. uzmi usera iz baze
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        // 2. provjera da li user postoji
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User ne postoji" });
        }

        const user = result.rows[0];

        // 3. provjera password-a (bcrypt)
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: "Pogresna lozinka" });
        }

        // 4. JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role_id: user.role_id
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // 5. response
        res.json({
            message: "Login uspjesan",
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});

// JWT middleware
function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Nema tokena" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // dodajemo usera u request
        next();
    } catch (err) {
        return res.status(403).json({ message: "Nevalidan token" });
    }
}

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role_id !== 1) {
        return res.status(403).json({
            message: "Samo admin moze ovo"
        });
    }
    next();
};

// protected route
app.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Ovo je protected ruta",
        user: req.user
    });
});

// CREATE USER-MEDIA
app.post("/user-media", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { media_id, status_id, rating } = req.body;

        const result = await pool.query(
            `INSERT INTO user_media (user_id, media_id, status_id, rating)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, media_id, status_id, rating]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);

        if (err.code === "23505") {
            return res.status(400).json({
                message: "Vec si dodao ovaj media"
            });
        }

        res.status(500).json({ message: "Greska na serveru" });
    }
});

// READ USER-MEDIA
app.get("/user-media", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT 
                um.id,
                um.rating,
                m.title,
                m.id AS media_id,
                s.name AS status
            FROM user_media um
            JOIN media m ON um.media_id = m.id
            JOIN user_media_status s ON um.status_id = s.id
            WHERE um.user_id = $1
            `,
            [userId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});

// UPDATE USER-MEDIA
app.put("/user-media/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const userMediaId = req.params.id;
        const { status_id, rating } = req.body;

        const result = await pool.query(
            `
            UPDATE user_media
            SET status_id = COALESCE($1, status_id),
                rating = COALESCE($2, rating)
            WHERE id = $3 AND user_id = $4
            RETURNING *
            `,
            [status_id, rating, userMediaId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ne postoji zapis" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});

// DELETE USER-MEDIA
app.delete("/user-media/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const userMediaId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM user_media
            WHERE id = $1 AND user_id = $2
            RETURNING *
            `,
            [userMediaId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ne postoji zapis ili nije tvoj"
            });
        }

        res.json({
            message: "Uspjesno obrisano",
            deleted: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});

// CREATE MEDIA
app.post("/media", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, type_id, description, release_year, image, video_url } = req.body;

        const result = await pool.query(
            `
            INSERT INTO media (title, type_id, description, release_year, image, video_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [title, type_id, description, release_year, image, video_url]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
})

// READ ALL MEDIA
app.get("/media", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM media ORDER BY id DESC`
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});

// UPDATE MEDIA
app.put("/media/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, release_year } = req.body;

        const result = await pool.query(
            `
            UPDATE media
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                release_year = COALESCE($3, release_year)
            WHERE id = $4
            RETURNING *
            `,
            [title, description, release_year, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Media ne postoji" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});

// DELETE MEDIA
app.delete("/media/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM media WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Media ne postoji" });
        }

        res.json({
            message: "Media obrisan",
            deleted: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});

app.get("/media", async (req, res) => {
    try {
        const { type_id, genre_id } = req.query;

        let query = `
            SELECT DISTINCT m.*
            FROM media m
            LEFT JOIN media_genre mg ON m.id = mg.media_id
            WHERE 1=1
        `;

        let values = [];
        let index = 1;

        if (type_id) {
            query += ` AND m.type_id = $${index}`;
            values.push(type_id);
            index++;
        }

        if (genre_id) {
            query += ` AND mg.genre_id = $${index}`;
            values.push(genre_id);
            index++;
        }

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greska na serveru" });
    }
});
