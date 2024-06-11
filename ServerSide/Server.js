const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const PDFDocument = require('pdfkit');

const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4500;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const uri = "mongodb+srv://CommunityForum:Dhivya_M@cluster0.rbjtpcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWT_SECRET = "Forum";

// Static directory for downloads
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Download route
app.get('/download/post/:postId', async (req, res) => {
    const postId = req.params.postId;
    console.log(`Download request received for post ID: ${postId}`);

    try {
        const TopicCollection = client.db("CommunityForum").collection("Topics");
        const post = await TopicCollection.findOne({ _id: new ObjectId(postId) });

        if (!post) {
            console.log(`Post with ID ${postId} not found`);
            return res.status(404).json({ message: 'Post not found' });
        }

        const fileName = post.title.toLowerCase().replace(/ /g, '_') + '.pdf';
        const filePath = path.join(__dirname, 'downloads', fileName);
        console.log(`File path resolved to: ${filePath}`);

        if (!fs.existsSync(path.join(__dirname, 'downloads'))) {
            fs.mkdirSync(path.join(__dirname, 'downloads'));
        }

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(25).text(post.title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Author: ${post.author}`);
        doc.moveDown();
        doc.text(`Category: ${post.category}`);
        doc.moveDown();
        doc.text(`Created At: ${post.createdAt}`);
        doc.moveDown();
        doc.fontSize(14).text(post.description, { align: 'left' });
        doc.end();

        stream.on('finish', () => {
            console.log(`PDF generation completed, downloading file: ${filePath}`);
            res.download(filePath, (err) => {
                if (err) {
                    console.error("Error downloading file:", err);
                    res.status(500).send("Error downloading file.");
                } else {
                    console.log(`File download initiated for: ${filePath}`);
                }
            });
        });

        stream.on('error', (err) => {
            console.error("Error writing to stream:", err);
            res.status(500).send("Error generating file.");
        });

    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: 'Error fetching post' });
    }
});
async function run() {
  try {
    await client.connect();
    const UserCollection = client.db("CommunityForum").collection("User");
    const TopicCollection = client.db("CommunityForum").collection("Topics"); 
    const CommentCollection = client.db("CommunityForum").collection("Comments");
    const MessageCollection = client.db("CommunityForum").collection("Messages");
    const QuestionCollection = client.db("CommunityForum").collection("Questions");

    io.on('connection', (socket) => {
      console.log('a user connected');

      socket.on('user connected', (username) => {
        socket.username = username;
      });

      MessageCollection.find().toArray((err, messages) => {
        if (err) {
          console.error("Error fetching messages:", err);
        } else {
          console.log("Sending chat history:", messages);
          socket.emit('chat history', messages);
        }
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });

      socket.on('chat message', async (msg) => {
        const newMessage = {
          username: socket.username,
          message: msg.message,
          createdAt: new Date()
        };
        await MessageCollection.insertOne(newMessage);
        io.emit('chat message', newMessage);
      });
    });

    // User endpoints
    app.get("/users/:id", async (req, res) => {
      const user = await UserCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.json(user);
    });

    app.post("/signup", async (req, res) => {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { username, email, password: hashedPassword };
      const result = await UserCollection.insertOne(newUser);
      const token = jwt.sign({ id: result.insertedId }, JWT_SECRET);
      res.json({ token, username: newUser.username });
    });

    app.post("/login", async (req, res) => {
      const { username, password } = req.body;
      const user = await UserCollection.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid password" });
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res.json({ token, username: user.username });
    });

    // Topic endpoints
    app.get("/topics", async (req, res) => {
      try {
        const topics = await TopicCollection.aggregate([
          {
            $lookup: {
              from: "Comments",
              localField: "_id",
              foreignField: "topicId",
              as: "comments"
            }
          },
          {
            $addFields: {
              commentCount: { $size: "$comments" }
            }
          },
          {
            $project: {
              comments: 0
            }
          }
        ]).toArray();
        res.json(topics);
      } catch (error) {
        console.error("There was an error fetching the topics!", error);
        res.status(500).json({ error: "Failed to fetch topics" });
      }
    });

    app.get("/topics/category/:name", async (req, res) => {
      const categoryName = req.params.name;
      try {
        const topics = await TopicCollection.find({ category: categoryName }).toArray();
        res.json(topics);
      } catch (error) {
        console.error("Error fetching topics for category:", error);
        res.status(500).json({ message: "Error fetching topics" });
      }
    });

    app.get("/topics/:id/posts", async (req, res) => {
      const topicId = req.params.id;
      if (!ObjectId.isValid(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      try {
        const posts = await TopicCollection.find({ topicId: new ObjectId(topicId) }).toArray();
        res.json(posts);
      } catch (error) {
        console.error("Error fetching posts for topic:", error);
        res.status(500).json({ message: "Error fetching posts" });
      }
    });

    app.delete("/topics/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await TopicCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: 'Topic deleted successfully' });
        } else {
          res.status(404).json({ message: 'Topic not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting topic', error });
      }
    });

    app.post("/topics", async (req, res) => {
      const { title, description, author, category, filePath } = req.body;
      const newTopic = {
        title,
        description,
        author,
        category,
        filePath,
        createdAt: new Date()
      };
      const result = await TopicCollection.insertOne(newTopic);
      res.status(201).json(newTopic);
    });

    app.put("/topics/:id", async (req, res) => {
      const id = req.params.id;
      const { title, description, author, category, filePath } = req.body;
      const updateFields = {};
      if (title) updateFields.title = title;
      if (description) updateFields.description = description;
      if (author) updateFields.author = author;
      if (category) updateFields.category = category;
      if (filePath) updateFields.filePath = filePath;

      try {
        const result = await TopicCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );

        if (result.modifiedCount === 1) {
          res.status(200).json({ message: 'Topic updated successfully' });
        } else {
          res.status(404).json({ message: 'Topic not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error updating topic', error });
      }
    });

    // Comment endpoints
    app.get("/topics/:id/comments", async (req, res) => {
      const topicId = req.params.id;
      const comments = await CommentCollection.find({ topicId: new ObjectId(topicId) }).toArray();
      res.json(comments);
    });

    app.post("/topics/:id/comments", async (req, res) => {
      const topicId = req.params.id;
      const { author, text } = req.body;
      const newComment = {
        topicId: new ObjectId(topicId),
        author,
        text,
        createdAt: new Date()
      };
      const result = await CommentCollection.insertOne(newComment);
      res.status(201).json(newComment);
    });
    // Increment like count for topic
app.post("/topics/:id/like", async (req, res) => {
  const topicId = req.params.id;
  try {
    const result = await TopicCollection.updateOne(
      { _id: new ObjectId(topicId) },
      { $inc: { likeCount: 1 } }
    );
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Topic liked successfully' });
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error liking topic', error });
  }
});

// Decrement like count for topic
app.post("/topics/:id/unlike", async (req, res) => {
  const topicId = req.params.id;
  try {
    const result = await TopicCollection.updateOne(
      { _id: new ObjectId(topicId) },
      { $inc: { likeCount: -1 } }
    );
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Topic unliked successfully' });
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error unliking topic', error });
  }
});
// Search topics by title or category
app.get("/search/topics", async (req, res) => {
  const { query } = req.query;
  try {
    const topics = await TopicCollection.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive search by title
        { category: { $regex: query, $options: "i" } }, // Case-insensitive search by category
      ],
    }).toArray();
    res.json(topics);
  } catch (error) {
    console.error("Error searching topics:", error);
    res.status(500).json({ message: "Failed to search topics" });
  }
});

    
     // Question endpoints
     // Create a new question
    app.post("/questions", async (req, res) => {
      const { title, description, category, author } = req.body;
      const newQuestion = {
        title,
        description,
        category,
        author,
        createdAt: new Date()
      };

      try {
        const result = await QuestionCollection.insertOne(newQuestion);
        res.status(201).json(newQuestion);
      } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ message: "Failed to create question" });
      }
    });

    // Fetch all questions
    app.get("/questions", async (req, res) => {
      try {
        const questions = await QuestionCollection.find().toArray();
        res.json(questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: "Failed to fetch questions" });
      }
    });

    // Get questions by category
    app.get('/questions/category/:category', async (req, res) => {
      try {
        const category = req.params.category;
        const questions = await QuestionCollection.find({ category: category }).toArray();
        res.status(200).json(questions);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching questions' });
      }
    });

    // Increment like count for question
    app.post("/questions/:id/like", async (req, res) => {
      const questionId = req.params.id;
      try {
        const result = await QuestionCollection.updateOne(
          { _id: new ObjectId(questionId) },
          { $inc: { likeCount: 1 } }
        );
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: 'Question liked successfully' });
        } else {
          res.status(404).json({ message: 'Question not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error liking question', error });
      }
    });

    // Decrement like count for question
    app.post("/questions/:id/unlike", async (req, res) => {
      const questionId = req.params.id;
      try {
        const result = await QuestionCollection.updateOne(
          { _id: new ObjectId(questionId) },
          { $inc: { likeCount: -1 } }
        );
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: 'Question unliked successfully' });
        } else {
          res.status(404).json({ message: 'Question not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error unliking question', error });
      }
    });

    // Create a new comment for a question
    app.post("/questions/:id/comments", async (req, res) => {
      const questionId = req.params.id;
      const { text, author } = req.body;
      const newComment = {
        questionId: new ObjectId(questionId),
        text,
        author,
        createdAt: new Date()
      };
      try {
        const result = await CommentCollection.insertOne(newComment);
        res.status(201).json(newComment);
      } catch (error) {
        res.status(500).json({ message: 'Failed to create comment', error });
      }
    });

    // Fetch comments for a question
    app.get("/questions/:id/comments", async (req, res) => {
      const questionId = req.params.id;
      try {
        const comments = await CommentCollection.find({ questionId: new ObjectId(questionId) }).toArray();
        res.json(comments);
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments', error });
      }
    });

    // Delete question by ID
    app.delete("/questions/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await QuestionCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: 'Question deleted successfully' });
        } else {
          res.status(404).json({ message: 'Question not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting question', error });
      }
    });
    


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});