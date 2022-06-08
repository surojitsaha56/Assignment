const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage, fileFilter });

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Routes

// @route  POST api/v3/app/events
// @desc   Post event
// @access Public
async function createListing(client, newListing) {
    const result = await client.db("assignmentDB").collection("assignment").insertOne(newListing);
    return result.insertedId;
}

router.post('/events', upload.single('files'), async (req, res) => {
    let { name, files, tagline, schedule, description, moderator, category, sub_category, rigor_rank } = req.body;
    schedule = new Date(schedule);
    rigor_rank = parseInt(rigor_rank);
    files = req.file.path;
    type = "event";
    try {
        result = await createListing(client, { type, name, files, tagline, schedule, description, moderator, category, sub_category, rigor_rank , attendees: []})
        res.json(result);
        

    } catch(err) {
        res.status(500).send('Server error');
        console.log(err.message);
    }
});

// @route  PUT api/v3/app/events/:id
// @desc   Modify event
// @access Public
async function ReplaceOneListingByID(client, id, newListing) {
    await client.db("assignmentDB").collection("assignment").replaceOne({ _id: ObjectId(id) }, newListing);

    if (result){
        return result;
    } else {
        console.log('Error');
    }
}
router.put('/events/:id', upload.single('files'), async(req, res) => {
    
    const type = "event"; 
    let { name, files, tagline, schedule, description, moderator, category, sub_category, rigor_rank } = req.body;
    files = req.file.path;
    schedule = new Date(schedule);
    rigor_rank = parseInt(rigor_rank);
    try {
        await ReplaceOneListingByID(client, req.params.id, { type, name, files, tagline, schedule, description, moderator, category, sub_category, rigor_rank , attendees : []})

        res.json('Event modified');

    } catch(err) {
        res.status(500).send('Server error');
        console.log(err.message);
    }
});

// @route  DELETE api/v3/app/events/:id
// @desc   Delete event
// @access Public
async function DeleteOneListingByID(client, id) {
    try {
        await client.db("assignmentDB").collection("assignment").deleteOne({ _id: ObjectId(id) });
        console.log('Event deleted');
    
    } catch(err) {
        res.json('Server error');
        console.log(err.message);
    }
}
router.delete('/events/:id', async(req, res) => {
    
    try {
        await DeleteOneListingByID(client, req.params.id);
        res.json('Event deleted');
    } catch(err) {
        res.status(500).send('Server error');
        console.log(err.message);
    }
});

// @route  GET api/v3/app/events
// @desc   Get events
// @access Public
async function findOneListingByID(client, id) {
    const result = await client.db("assignmentDB").collection("assignment").findOne({ _id: ObjectId(id) });

    if (result){
        return result;
    } else {
        console.log('No event found');
        return None;
    }
}

async function findListingByLimit(client, limit, page, type) {
    if (type === 'latest') {
        type = -1;
    }
    const cursor = await client.db("assignmentDB").collection("assignment").find().limit(limit).skip(page).sort({ schedule : type });
    
    const results = await cursor.toArray();
    return results;
}

router.get('/events', async(req, res) => {
    limit = parseInt(req.query.limit);
    id = req.query.id;
    page = parseInt(req.query.page);
    type = req.query.type;

    if(id) {
        try {
            result = await findOneListingByID(client, id);
            res.json(result);
        } catch(err) {
            console.log(err.message);
            res.json('Server error');
        }
    }
    else {
        try {
            result = await findListingByLimit(client, limit, page, type);
            res.json(result)
        } catch(err) {
            console.log('Server Error');
        }
    }
    
})


module.exports = router;