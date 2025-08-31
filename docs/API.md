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

#### POST /Auth/register
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
  "success": true,
  "message": "User created successfully",
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

#### POST /Auth/login
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
  "success": true,
  "message": "Successfully logged in",
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

#### POST /Auth/logout
Logout user and clear authentication token.

**Request:** No body required

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "clientSideCleanup": true
}
```

**Status Codes:**
- `200` - Logout successful

---

#### GET /Auth/check
Check if user is authenticated and return user data.

**Headers:** Cookie with auth-token required

**Response:**
```json
{
  "loggedIn": true,
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string"
  }
}
```
```

**Status Codes:**
- `200` - User authenticated
- `401` - Not authenticated

---

### Post Endpoints

#### GET /Post/all
Get all posts (public endpoint).

**Response:**
```json
[
  {
    "_id": "string",
    "title": "string",
    "content": "string",
    "image": "string",
    "author_id": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string"
    },
    "likes": [
      {
        "user": "string",
        "createdAt": "string"
      }
    ],
    "comments": [
      {
        "_id": "string",
        "content": "string",
        "createdAt": "string"
      }
    ],
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

#### POST /Post/create
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

#### DELETE /Post/delete/:id
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

#### PATCH /Post/update/:id
Update an existing post (requires authentication, author only).

**Headers:** Authorization required

**Parameters:**
- `id` - Post ID

**Request Body:**
```json
{
  "title": "string (optional, 10-50 characters)",
  "content": "string (optional, minimum 30 characters)",
  "image": "string (optional, valid URL)"
}
```

**Response:**
```json
{
  "message": "Post updated successfully",
  "post": {
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
}
```

**Status Codes:**
- `200` - Post updated successfully
- `400` - Validation error
- `401` - Not authenticated
- `403` - Not authorized (not post author)
- `404` - Post not found
- `500` - Server error

---

#### POST /Post/like/:id
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

#### GET /Post/comments/:id
Get comments for a specific post (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - Post ID

**Response:**
```json
{
  "comments": [
    {
      "_id": "string",
      "content": "string",
      "user": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "post": "string",
      "likes": [
        {
          "user": "string",
          "createdAt": "string"
        }
      ],
      "createdAt": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - Post not found
- `500` - Server error

---

### Comment Endpoints

#### POST /Comment/create
Create a comment on a post (requires authentication).

**Headers:** Authorization required

**Request Body:**
```json
{
  "post": "string (required, post ID)",
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
    "user": {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    },
    "post": "string",
    "likes": [],
    "createdAt": "string"
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

#### DELETE /Comment/delete/:id
Delete a comment (requires authentication, author only).

**Headers:** Authorization required

**Parameters:**
- `id` - Comment ID

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

**Status Codes:**
- `200` - Comment deleted successfully
- `401` - Not authenticated
- `403` - Not authorized (not comment author)
- `404` - Comment not found
- `500` - Server error

---

#### PATCH /Comment/update/:id
Update a comment (requires authentication, author only).

**Headers:** Authorization required

**Parameters:**
- `id` - Comment ID

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Response:**
```json
{
  "message": "Comment updated successfully",
  "comment": {
    "_id": "string",
    "content": "string",
    "user": {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    },
    "post": "string",
    "likes": [
      {
        "user": "string",
        "createdAt": "string"
      }
    ],
    "createdAt": "string"
  }
}
```

**Status Codes:**
- `200` - Comment updated successfully
- `400` - Validation error
- `401` - Not authenticated
- `403` - Not authorized (not comment author)
- `404` - Comment not found
- `500` - Server error

---

#### GET /Comment/post/:id
Get comments for a specific post (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - Post ID

**Response:**
```json
{
  "comments": [
    {
      "_id": "string",
      "content": "string",
      "user": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "post": "string",
      "likes": [
        {
          "user": "string",
          "createdAt": "string"
        }
      ],
      "createdAt": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - Post not found
- `500` - Server error

---

#### POST /Comment/like/:id
Like or unlike a comment (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - Comment ID

**Response:**
```json
{
  "message": "Comment liked/unliked successfully",
  "likes": [
    {
      "user": "string",
      "createdAt": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - Comment not found
- `500` - Server error

---

### Profile Endpoints

#### GET /Profile/
Get current authenticated user's profile (requires authentication).

**Headers:** Authorization required

**Response:**
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string",
  "bio": "string",
  "followers": [
    {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    }
  ],
  "following": [
    {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    }
  ],
  "posts": [
    {
      "_id": "string",
      "title": "string",
      "content": "string",
      "createdAt": "string"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### GET /Profile/:id
Get user profile by ID (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - User ID

**Response:**
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string",
  "bio": "string",
  "followers": [
    {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    }
  ],
  "following": [
    {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    }
  ],
  "posts": [
    {
      "_id": "string",
      "title": "string",
      "content": "string",
      "createdAt": "string"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### PATCH /Profile/update/:id
Update user profile (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - User ID (must match authenticated user)

**Request Body:**
```json
{
  "username": "string (optional)",
  "bio": "string (optional, max 500 characters)",
  "avatar": "string (optional, valid URL)"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
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
- `200` - Profile updated successfully
- `400` - Validation error
- `401` - Not authenticated
- `500` - Server error

---

#### POST /Profile/follow/:id
Follow or unfollow a user (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - User ID to follow/unfollow

**Response:**
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string",
    "followers": ["string"],
    "following": ["string"]
  },
  "message": "User followed/unfollowed successfully"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

### Message Endpoints

#### POST /Message/send
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
  "data": {
    "_id": "string",
    "senderId": {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    },
    "receiverId": {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    },
    "content": "string",
    "createdAt": "string"
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

#### GET /Message/messages/:id
Get conversation with a specific user (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - User ID to get conversation with

**Response:**
```json
{
  "messages": [
    {
      "_id": "string",
      "senderId": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "receiverId": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "content": "string",
      "createdAt": "string"
    }
  ],
  "count": "number"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

### Additional Auth Endpoints

#### GET /Auth/healthcheck
Health check endpoint to verify API status.

**Response:**
```json
{
  "status": "OK"
}
```

**Status Codes:**
- `200` - API is healthy

---

#### GET /Auth/user/:id
Get user information by ID (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - User ID

**Response:**
```json
{
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
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### DELETE /Auth/user/:id
Delete a user account (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - User ID

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Status Codes:**
- `200` - User deleted successfully
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### GET /Auth/following/:id
Get list of users that a specific user is following (requires authentication).

**Headers:** Authorization required

**Parameters:**
- `id` - User ID

**Response:**
```json
{
  "message": "Following users fetched successfully",
  "following": [
    {
      "_id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string",
      "bio": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### GET /Auth/sentMessages
Get list of users who have sent messages to the authenticated user but are not followed (requires authentication).

**Headers:** Authorization required

**Response:**
```json
{
  "senders": [
    {
      "_id": "string",
      "username": "string",
      "avatar": "string"
    }
  ],
  "count": "number"
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
  "message": "Validation failed",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["field_name"],
      "message": "Required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized: User not authenticated"
}
```
or for auth endpoints:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden - insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```
or for specific resources:
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```
or for auth endpoints:
```json
{
  "success": false,
  "message": "Server error"
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