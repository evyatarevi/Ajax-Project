const express = require('express');
const mongodb = require('mongodb');

const db = require('../data/database');

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/', function (req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function (req, res) {
  const posts = await db
    .getDb()
    .collection('posts')
    .find({}, { title: 1, summary: 1, 'author.name': 1 })  // 'author.name' between '' because the dot (.).
    .toArray();
  res.render('posts-list', { posts: posts });
});

router.get('/new-post', async function (req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', { authors: authors });
});

router.post('/posts', async function (req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db
    .getDb()
    .collection('authors')
    .findOne({ _id: authorId });

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getDb().collection('posts').insertOne(newPost);
  res.redirect('/posts');
});

router.get('/posts/:id', async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ _id: new ObjectId(postId) }, { summary: 0 });

  if (!post) {
    return res.status(404).render('404');
  }

  post.humanReadableDate = post.date.toLocaleDateString('en-US', {  //create a human-readable date string in the specified locale (in this case, 'en-US', which is American English).
    // The second argument to the function is an options object that defines how the date should be formatted
    weekday: 'long',  // the full weekday name (e.g., "Monday") should be included.
    year: 'numeric',  // the full year (e.g., "2023") should be included.
    month: 'long',    // the full month name (e.g., "August") should be included.
    day: 'numeric',   // the day of the month (e.g., "31") should be included.
  });
  post.date = post.date.toISOString();  //converts the date to a string representation in the ISO 8601 format (like "2023-08-31T00:00:00.000Z").
  
  res.render('post-detail', { post: post, comments: null });
});

router.get('/posts/:id/edit', async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render('404');
  }

  res.render('update-post', { post: post });
});

router.post('/posts/:id/edit', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection('posts')
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
          // date: new Date()
        },
      }
    );

  res.redirect('/posts');
});

router.post('/posts/:id/delete', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection('posts')
    .deleteOne({ _id: postId });
  res.redirect('/posts');
});

//GET comments
router.get('/posts/:id/comments', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const comments = await db
    .getDb()
    .collection('comments')
    .find({ postId: postId }).toArray();

  return res.json(comments);  /*res.json() - built-in method of Express, encode data as JSON for sending back JSON data.
  Not that json() in the browser side is different method that decode data. Because JSON is that data format,
  that machine-readable data format, which is typically used for transmitting data between client and server.
  'comments' - the data which should encoded and send back. another option is send as object in parameter: {comments: comments}.
 */
});

//POST comments
router.post('/posts/:id/comments', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newComment = {
    postId: postId,
    title: req.body.title,
    text: req.body.text,
  };
  try {
    await db.getDb().collection('comments').insertOne(newComment);
    res.status(200).json({message: 'The comment saved successfully'});
  } catch (error) {
    res.status(500).json({message: error});
    
  }
});

module.exports = router;



/*
The ISO 8601 format is a standardized way of representing dates, times, and durations.
It was developed by the International Organization for Standardization (ISO) to provide a consistent and unambiguous 
way to express temporal information, regardless of cultural or regional differences. ISO 8601 is widely used in various
contexts for communication, data interchange, and storage due to its clarity and precision.
*/

/*
JSON.stringify() vs res.json()
If you use JSON.stringify() directly, you have more control over the JSON serialization process.
You can manipulate the object and customize how it is transformed into a JSON string before sending it in the response:

    app.get('/data', (req, res) => {
        const data = { key: 'value' };
        const jsonString = JSON.stringify(data);

        res.setHeader('Content-Type', 'application/json');
        res.send(jsonString);

When you use res.json(), Express automatically sets the Content-Type header to application/json and converts the 
provided JavaScript object into a JSON string using JSON.stringify():

    app.get('/data', (req, res) => {
        const data = { key: 'value' };
        res.json(data);
        });
*/
