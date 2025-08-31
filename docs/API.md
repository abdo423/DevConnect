# DevConnect API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

DevConnect uses JWT (JSON Web Token) authentication. Tokens are stored in HTTP-only cookies and also sent via Authorization header.

### Authentication Headers
```
Authorization: Bearer <jwt_token>
Cookie: auth-token=<jwt_token>
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Validation error or user already exists
- `500` - Server error

---

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Invalid credentials
- `500` - Server error

---

#### POST /auth/logout
Logout user and clear authentication token.

**Request:** No body required

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200` - Logout successful

---

#### GET /auth/check
Check if user is authenticated and return user data.

**Headers:** Cookie with auth-token required

**Response:**
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string"
  }
}
```

**Status Codes:**
- `200` - User authenticated
- `401` - Not authenticated

---

### Post Endpoints

#### GET /post/all
Get all posts (public endpoint).

**Response:**
```json
{
  "posts": [
    {
      "_id": "string",
      "title": "string",
      "content": "string",
      "image": "string",
      "author_id": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "likes": [
        {
          "user": "string",
          "createdAt": "string"
        }
      ],
      "comments": ["string"],
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

#### POST /post/create
Create a new post (requires authentication).

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "string (required, 10-50 characters)",
  "content": "string (required, minimum 30 characters)",
  "image": "string (optional, valid URL)"
}
```

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "string",
    "title": "string",
    "content": "string",
    "image": "string",
    "author_id": "string",
    "likes": [],
    "comments": [],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Status Codes:**
- `201` - Post created successfully
- `400` - Validation error
- `401` - Not authenticated
- `500` - Server error

---

#### DELETE /post/delete/:id
Delete a post (requires authentication, author only).

**Headers:** Authorization required

**Parameters:**
- `id` - Post ID

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

**Status Codes:**
- `200` - Post deleted successfully
- `401` - Not authenticated
- `403` - Not authorized (not post author)
- `404` - Post not found
- `500` - Server error

---

#### POST /post/like/:id
Like or unlike a post (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - Post ID

**Response:**
```json
{
  "message": "Post liked/unliked successfully",
  "post": {
    "_id": "string",
    "likes": [
      {
        "user": "string",
        "createdAt": "string"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - Post not found
- `500` - Server error

---

### Comment Endpoints

#### POST /comment/create/:postId
Create a comment on a post (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `postId` - Post ID

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Response:**
```json
{
  "message": "Comment created successfully",
  "comment": {
    "_id": "string",
    "content": "string",
    "author": "string",
    "post": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Status Codes:**
- `201` - Comment created successfully
- `400` - Validation error
- `401` - Not authenticated
- `404` - Post not found
- `500` - Server error

---

### Profile Endpoints

#### GET /profile/:userId
Get user profile by ID (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `userId` - User ID

**Response:**
```json
{
  "profile": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string",
    "followers": ["string"],
    "following": ["string"],
    "posts": ["string"],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### PUT /profile/update
Update user profile (requires authentication).

**Headers:** Authorization required

**Request Body:**
```json
{
  "username": "string (optional)",
  "bio": "string (optional)",
  "avatar": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string"
  }
}
```

**Status Codes:**
- `200` - Profile updated successfully
- `400` - Validation error
- `401` - Not authenticated
- `500` - Server error

---

#### POST /profile/follow/:userId
Follow or unfollow a user (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `userId` - User ID to follow/unfollow

**Response:**
```json
{
  "message": "User followed/unfollowed successfully",
  "isFollowing": "boolean"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

### Message Endpoints

#### POST /message/send
Send a direct message (requires authentication).

**Headers:** Authorization required

**Request Body:**
```json
{
  "receiverId": "string (required)",
  "content": "string (required)"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "messageData": {
    "_id": "string",
    "sender": "string",
    "receiver": "string",
    "content": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Status Codes:**
- `201` - Message sent successfully
- `400` - Validation error
- `401` - Not authenticated
- `404` - Receiver not found
- `500` - Server error

---

#### GET /message/messages/:userId
Get conversation with a specific user (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `userId` - User ID to get conversation with

**Response:**
```json
{
  "messages": [
    {
      "_id": "string",
      "sender": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "receiver": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "content": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `500` - Server error

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "details": ["Specific validation errors"]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized access, please try again"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden - insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (development frontend)

Update CORS configuration for production deployment.

## Socket.io Events

DevConnect uses Socket.io for real-time messaging features. Connect to the Socket.io server at the same base URL.

### Real-time Events
- `message` - Receive new messages
- `user_online` - User comes online
- `user_offline` - User goes offline

Refer to the Socket.io implementation in the codebase for detailed event handling.