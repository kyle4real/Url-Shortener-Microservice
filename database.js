require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlDataSchema = new Schema({
    url: { type: String, required: true },
    shortener: { type: Number, required: true },
});
const shortenerDocSchema = new Schema({
    shortenerNum: Number,
});

const UrlData = mongoose.model("UrlData", urlDataSchema);
const ShortenerDoc = mongoose.model("ShortenerDoc", shortenerDocSchema);

const searchDB = async (url) => {
    const allData = await UrlData.find({});
    if (allData.length === 0) {
        const x = new ShortenerDoc({ shortenerNum: 0 });
        x.save((err) => {
            if (err) return console.error(err);
            console.log(`Shortener Doc Created`);
        });
    }
    const data = await UrlData.find({ url: url });
    if (data.length === 0) {
        return await handleNew(url);
    } else {
        return data[0].shortener;
    }
};

const handleNew = async (url) => {
    // get current num and increment by 1 locally
    const shortenerData = await ShortenerDoc.find({});
    const shortenerNum = shortenerData[0].shortenerNum + 1;
    // create new data for document and save it
    const newData = new UrlData({ url: url, shortener: shortenerNum });
    newData.save((err, data) => {
        if (err) return console.error(err);
        console.log(`${data.url} saved to database.`);
    });
    // Increment shortener doc by 1 in database
    ShortenerDoc.find({}, (err, data) => {
        if (err) return console.log(err);
        data[0].shortenerNum++;
        data[0].save((err, data) => {
            if (err) return console.error(err);
            console.log(data);
        });
    });
    return shortenerNum;
};

const searchDBByShortener = async (shortener) => {
    try {
        const data = await UrlData.find({ shortener: shortener });
        return data[0].url;
    } catch (err) {
        return "/";
    }
};

exports.searchDB = searchDB;
exports.searchDBByShortener = searchDBByShortener;
