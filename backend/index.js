// Uvoz Express biblioteke (framework za pravljenje servera)
const express = require('express');
// Uvoz Pool iz db.js (omogucava konekciju izmedju baze i backend-a)
const pool = require("./db");
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
