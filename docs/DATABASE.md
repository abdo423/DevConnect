# DevConnect Database Schema Documentation

## Overview

DevConnect uses MongoDB as its primary database with Mongoose as the ODM (Object Document Mapper). The database is designed to support a social platform where developers can connect, share posts, comment, and message each other.

## Database Structure

### Collections

1. **users** - User accounts and profiles
2. **posts** - User posts and content  
3. **comments** - Comments on posts
4. **messages** - Direct messages between users

---

## Schema Definitions

### Users Collection

The users collection stores all user account information, profiles, and social connections.

```typescript
interface UserDocument {
  _id: ObjectId;
  username: string;         // Unique username (3-30 characters)
  email: string;           // Unique email address
  password: string;        // Hashed password with bcrypt
  avatar?: string;         // Profile picture URL (optional)
  bio?: string;           // User biography (max 500 characters)
  followers: ObjectId[];   // Array of user IDs following this user
  following: ObjectId[];   // Array of user IDs this user follows
  posts: ObjectId[];      // Array of post IDs created by this user
  createdAt: Date;        // Account creation timestamp
  updatedAt: Date;        // Last profile update timestamp
}
```

**Validation Rules:**
- `username`: 3-30 characters, unique, alphanumeric + underscore
- `email`: Valid email format, unique
- `password`: Minimum 6 characters (hashed before storage)
- `bio`: Maximum 500 characters
- `avatar`: Valid URL format

**Indexes:**
```javascript
// Compound indexes for efficient queries
{ email: 1 }              // Unique index for authentication
{ username: 1 }           // Unique index for username lookup
{ followers: 1 }          // Index for follower queries
{ following: 1 }          // Index for following queries
{ createdAt: -1 }         // Index for recent users
```

---

### Posts Collection

The posts collection stores all user-generated content including text posts and optional images.

```typescript
interface PostDocument {
  _id: ObjectId;
  title: string;           // Post title (10-50 characters)
  content: string;         // Post content (minimum 30 characters)
  image?: string;          // Optional image URL
  author_id: ObjectId;     // Reference to Users collection
  likes: {                 // Array of likes
    user: ObjectId;        // User who liked the post
    createdAt: Date;       // When the like was created
  }[];
  comments: ObjectId[];    // References to Comments collection
  createdAt: Date;         // Post creation timestamp
  updatedAt: Date;         // Last post update timestamp
}
```

**Validation Rules:**
- `title`: 10-50 characters, required
- `content`: Minimum 30 characters, required  
- `image`: Valid URL format, optional
- `author_id`: Must reference existing user

**Indexes:**
```javascript
{ author_id: 1, createdAt: -1 }    // Posts by user, newest first
{ createdAt: -1 }                  // All posts, newest first
{ 'likes.user': 1 }                // Posts liked by specific user
{ title: 'text', content: 'text' } // Text search index
```

**Middleware Hooks:**
- **Pre-save**: Validates post data
- **Post-delete**: Removes associated comments and updates user's posts array

---

### Comments Collection  

The comments collection stores all comments made on posts.

```typescript
interface CommentDocument {
  _id: ObjectId;
  content: string;         // Comment text content
  author: ObjectId;        // Reference to Users collection
  post: ObjectId;          // Reference to Posts collection  
  createdAt: Date;         // Comment creation timestamp
  updatedAt: Date;         // Last comment update timestamp
}
```

**Validation Rules:**
- `content`: Required, minimum 1 character
- `author`: Must reference existing user
- `post`: Must reference existing post

**Indexes:**
```javascript
{ post: 1, createdAt: 1 }     // Comments for a post, oldest first
{ author: 1, createdAt: -1 }  // Comments by user, newest first
```

**Middleware Hooks:**
- **Pre-save**: Validates comment data and updates post's comments array
- **Post-delete**: Removes comment reference from post

---

### Messages Collection

The messages collection stores direct messages between users.

```typescript
interface MessageDocument {
  _id: ObjectId;
  sender: ObjectId;        // Reference to Users collection (sender)
  receiver: ObjectId;      // Reference to Users collection (receiver)
  content: string;         // Message text content
  read: boolean;           // Whether message has been read
  createdAt: Date;         // Message creation timestamp
  updatedAt: Date;         // Last message update timestamp
}
```

**Validation Rules:**
- `sender`: Must reference existing user
- `receiver`: Must reference existing user, cannot be same as sender
- `content`: Required, minimum 1 character
- `read`: Boolean, defaults to false

**Indexes:**
```javascript
{ sender: 1, receiver: 1, createdAt: -1 }  // Messages between users
{ receiver: 1, read: 1, createdAt: -1 }    // Unread messages for user
{ sender: 1, createdAt: -1 }               // Messages sent by user
```

---

## Relationships

### User Relationships

```
User (1) ──→ (N) Posts
User (1) ──→ (N) Comments  
User (1) ──→ (N) Messages (as sender)
User (1) ──→ (N) Messages (as receiver)
User (N) ──→ (N) User (followers/following)
```

### Content Relationships

```
Post (1) ──→ (N) Comments
Post (1) ──→ (N) Likes
User (N) ──→ (N) Posts (via likes)
```

### Message Relationships

```
User (sender) (1) ──→ (N) Messages
User (receiver) (1) ──→ (N) Messages
```

---

## Data Population

### Common Population Patterns

**Posts with Author Information:**
```typescript
Post.find()
  .populate('author_id', 'username avatar')
  .populate({
    path: 'comments',
    populate: {
      path: 'author',
      select: 'username avatar'
    }
  })
```

**User Profile with Posts:**
```typescript
User.findById(userId)
  .populate({
    path: 'posts',
    options: { sort: { createdAt: -1 }, limit: 10 }
  })
  .populate('followers', 'username avatar')
  .populate('following', 'username avatar')
```

**Messages with User Information:**
```typescript
Message.find({ 
  $or: [
    { sender: userId, receiver: otherUserId },
    { sender: otherUserId, receiver: userId }
  ]
})
.populate('sender', 'username avatar')
.populate('receiver', 'username avatar')
.sort({ createdAt: 1 })
```

---

## Performance Considerations

### Query Optimization

**Efficient Pagination:**
```typescript
// Use cursor-based pagination for large datasets
const posts = await Post.find({ createdAt: { $lt: cursor } })
  .sort({ createdAt: -1 })
  .limit(20);
```

**Aggregation Pipelines:**
```typescript
// Get user stats efficiently
const userStats = await User.aggregate([
  { $match: { _id: userId } },
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'author_id',
      as: 'userPosts'
    }
  },
  {
    $project: {
      username: 1,
      avatar: 1,
      postsCount: { $size: '$userPosts' },
      followersCount: { $size: '$followers' },
      followingCount: { $size: '$following' }
    }
  }
]);
```

### Indexing Strategy

**Compound Indexes:**
- `{ author_id: 1, createdAt: -1 }` - User's posts chronologically
- `{ sender: 1, receiver: 1, createdAt: -1 }` - Messages between users
- `{ receiver: 1, read: 1 }` - Unread messages

**Text Search:**
```typescript
// Enable text search on posts
db.posts.createIndex({ 
  title: "text", 
  content: "text" 
})
```

---

## Data Migration Scripts

### Initial Setup

```javascript
// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.posts.createIndex({ author_id: 1, createdAt: -1 })
db.comments.createIndex({ post: 1, createdAt: 1 })
db.messages.createIndex({ sender: 1, receiver: 1, createdAt: -1 })
```

### Sample Data

```javascript
// Sample user
db.users.insertOne({
  username: "johndoe",
  email: "john@example.com",
  password: "$2b$10$hashed_password_here",
  bio: "Full stack developer passionate about React and Node.js",
  followers: [],
  following: [],
  posts: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Backup and Recovery

### Regular Backups

```bash
# Daily backup script
mongodump --db devconnect --out /backups/$(date +%Y%m%d)

# Compress backup
tar -czf /backups/devconnect_$(date +%Y%m%d).tar.gz /backups/$(date +%Y%m%d)
```

### Restoration

```bash
# Restore from backup
mongorestore --db devconnect /backups/20240101/devconnect/
```

---

## Security Considerations

### Data Protection

- **Password Hashing**: All passwords hashed with bcrypt (10+ rounds)
- **Input Sanitization**: Mongoose schema validation prevents injection
- **Field Validation**: Strict validation rules on all user inputs
- **Access Control**: JWT-based authentication for data access

### Privacy

- **Sensitive Data**: Passwords never returned in API responses
- **User Control**: Users can delete their own posts and comments
- **Data Minimization**: Only necessary data stored and transmitted

---

## Monitoring and Maintenance

### Database Health

```javascript
// Monitor collection sizes
db.stats()
db.users.stats()
db.posts.stats()

// Check index usage
db.posts.getIndexes()
db.posts.aggregate([{ $indexStats: {} }])
```

### Performance Metrics

- Query execution time
- Index hit ratio
- Collection growth rate
- Connection pool utilization

This schema documentation provides a comprehensive overview of DevConnect's database structure, relationships, and best practices for development and maintenance.