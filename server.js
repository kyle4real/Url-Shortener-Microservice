require("dotenv").config();
const express = require("express");
const dns = require("dns");
const cors = require("cors");
const bodyParser = require("body-parser");
const vu = require("valid-url");

const { searchDB, searchDBByShortener } = require("./database.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", (req, res) => {
    res.sendFile(`${process.cwd()}/views/index.html`);
});

// const regex =
//     /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
app.post("/api/shorturl", (req, res) => {
    const url = req.body.url;
    if (vu.isWebUri(url) === undefined) return res.json({ error: "Invalid URL" });
    try {
        const { host } = new URL(url);
        dns.lookup(host, async (err) => {
            if (err) return res.json({ error: "Invalid URL" });
            const shortener = await searchDB(url);
            res.json({ original_url: url, short_url: shortener });
        });
    } catch (err) {
        res.json({ error: "Invalid URL" });
    }
});

app.get("/api/shorturl/:shortener", async (req, res) => {
    const url = await searchDBByShortener(req.params.shortener);
    res.redirect(`${url}`);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
