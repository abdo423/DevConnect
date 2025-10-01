# DevConnect Development Guide

## Development Environment Setup

### Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB (local or Atlas)
- Git
- VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
  - Bracket Pair Colorizer

### Initial Setup

1. **Clone and install dependencies:**

```bash
git clone https://github.com/abdo423/DevConnect.git
cd DevConnect

# Install server dependencies
cd Server && npm install

# Install client dependencies
cd ../Client/devConnect
npm install react-router-dom react-redux @reduxjs/toolkit date-fns
npm install
```

2. **Fix known issues:**

**Server TypeScript Config Fix:**
Edit `Server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

3. **Environment Configuration:**

Create `Server/.env`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/devconnect
JWT_SECRET=your-super-secure-jwt-secret-key-for-development
```

Create `Server/config/development.json`:

```json
{
  "app": {
    "port": 3000
  },
  "db": {
    "connectionString": "mongodb://localhost:27017/devconnect"
  },
  "jwt": {
    "secret": "your-super-secure-jwt-secret-key-for-development",
    "expiresIn": "7d"
  }
}
```

## Development Workflow

### Running the Application

**Terminal 1 - Backend:**

```bash
cd Server
npm run dev
```

Server runs on `http://localhost:3000`

**Terminal 2 - Frontend:**

```bash
cd Client/devConnect
npm run dev
```

Client runs on `http://localhost:5173`

**Terminal 3 - Database (if running locally):**

```bash
mongod
```

### Code Structure

#### Backend Structure (`/Server/src/`)

```
├── controllers/          # Business logic
│   ├── user.ts          # User management
│   ├── post.ts          # Post operations
│   ├── comment.ts       # Comment handling
│   ├── message.ts       # Direct messaging
│   └── profile.ts       # Profile management
├── middlewares/         # Express middlewares
│   └── auth.ts         # Authentication middleware
├── models/             # MongoDB schemas
│   ├── User.ts         # User model
│   ├── Post.ts         # Post model
│   ├── Comment.ts      # Comment model
│   └── Message.ts      # Message model
├── routes/             # API routes
│   ├── auth.ts         # Auth endpoints
│   ├── Post.ts         # Post endpoints
│   ├── comment.ts      # Comment endpoints
│   ├── Profile.ts      # Profile endpoints
│   ├── Message.ts      # Message endpoints
│   ├── protectedAuth.ts # Protected auth routes
│   └── protectedPost.ts # Protected post routes
├── services/           # External services
├── Types/              # TypeScript definitions
└── index.ts           # Server entry point
```

#### Frontend Structure (`/Client/devConnect/src/`)

```
├── components/         # Reusable UI components
│   ├── LoginForm.tsx   # Login component
│   ├── CreatePost.tsx  # Post creation
│   ├── CommentsPopUp.tsx # Comments modal
│   └── MobileNavbar.tsx # Mobile navigation
├── features/          # Feature modules
│   ├── Auth/          # Authentication logic
│   ├── Posts/         # Post management
│   ├── Profile/       # User profiles
│   ├── Message/       # Direct messaging
│   └── Comments/      # Comment system
├── Pages/             # Route components
│   ├── Home.tsx       # Home feed
│   ├── Profile.tsx    # User profile
│   ├── Login.tsx      # Login page
│   ├── Register.tsx   # Registration
│   ├── Messages.tsx   # Message interface
│   └── EditProfile.tsx # Profile editing
├── app/               # Redux store
├── lib/               # Utilities
└── main.tsx           # App entry point
```

## Development Standards

### Code Style

**TypeScript Guidelines:**

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type assertions sparingly
- Prefer `interface` over `type` for object shapes
- Use `const assertions` for readonly data

**React Guidelines:**

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow component composition patterns
- Keep components focused and single-purpose

**Naming Conventions:**

- Components: PascalCase (`UserProfile.tsx`)
- Files: camelCase or kebab-case consistently
- Variables: camelCase (`userName`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types/Interfaces: PascalCase (`UserInterface`)

### Code Quality and Formatting

The project uses **Husky**, **lint-staged**, and **Prettier** to maintain consistent code quality across the codebase.

**Automatic Code Formatting:**

- Pre-commit hooks automatically format staged files using Prettier
- Prettier runs on all `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, and `.md` files
- Configuration is defined in `.prettierrc` at the root level

**Running Prettier Manually:**

```bash
# Format all files in the project
npm run format

# Check if files are formatted correctly
npm run format:check
```

**Pre-commit Hooks:**
Git pre-commit hooks are configured using Husky and will automatically:

1. Run lint-staged on all staged files
2. Format code with Prettier
3. Only allow commit if formatting succeeds

**Setup for New Developers:**
When you first clone the repository and run `npm install` in the root directory, Husky will automatically set up the git hooks. If hooks aren't working, you can manually initialize them:

```bash
# From the repository root
npm install
npx husky init
```

**Formatting Configuration:**
The project uses the following Prettier settings (`.prettierrc`):

- Semi-colons: enabled
- Single quotes: enabled
- Tab width: 2 spaces
- Trailing commas: ES5
- Print width: 80 characters

**Best Practices:**

- Commit your code in logical chunks
- Let the pre-commit hook handle formatting automatically
- Don't disable or skip the pre-commit hooks
- If you need to bypass hooks (emergency only), use `git commit --no-verify`

### Git Workflow

**Branch Naming:**

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation changes

**Commit Messages:**
Follow conventional commits format:

```
type(scope): description

feat(auth): add JWT token refresh functionality
fix(posts): resolve image upload validation issue
docs(api): update endpoint documentation
refactor(components): optimize post rendering performance
```

**Pull Request Process:**

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Create PR with descriptive title and body
5. Request code review
6. Address feedback and merge

### Testing Guidelines

**Backend Testing:**

```bash
cd Server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

**Test Structure:**

```typescript
describe('POST /api/posts/create', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup
  });

  it('should create post with valid data', async () => {
    const response = await request(app)
      .post('/api/posts/create')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPostData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('post');
  });
});
```

**Frontend Testing:**

```bash
cd Client/devConnect
npm test                   # Run tests
npm run test:coverage     # Coverage report
```

**Component Testing:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../app/store';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  const renderWithRedux = (component) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('renders login form correctly', () => {
    renderWithRedux(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
```

## API Development

### Adding New Endpoints

1. **Create Model (if needed):**

```typescript
// Server/src/models/NewModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import * as z from 'zod';

export interface NewModelDocument extends Document {
  field1: string;
  field2: number;
  createdAt: Date;
  updatedAt: Date;
}

const newModelSchema = new Schema<NewModelDocument>(
  {
    field1: { type: String, required: true },
    field2: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<NewModelDocument>('NewModel', newModelSchema);
```

2. **Create Controller:**

```typescript
// Server/src/controllers/newController.ts
import { Request, Response } from 'express';
import NewModel from '../models/NewModel';

export const createNew = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newItem = new NewModel(data);
    await newItem.save();

    res.status(201).json({
      message: 'Created successfully',
      item: newItem,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

3. **Create Routes:**

```typescript
// Server/src/routes/newRoutes.ts
import { Router } from 'express';
import { createNew } from '../controllers/newController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/create', authMiddleware, createNew);

export default router;
```

4. **Register Routes:**

```typescript
// Server/src/index.ts
import newRoutes from './routes/newRoutes';

app.use('/api/new', newRoutes);
```

### Frontend API Integration

1. **Create API Service:**

```typescript
// Client/devConnect/src/features/New/newApi.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:3000/new';

export const createNew = async (data: NewData) => {
  try {
    const token = Cookies.get('auth-token');
    if (!token) throw new Error('Not authenticated');

    const response = await axios.post(`${BASE_URL}/create`, data, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};
```

2. **Redux Integration:**

```typescript
// Client/devConnect/src/features/New/newSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createNew } from './newApi';

export const createNewThunk = createAsyncThunk(
  'new/create',
  async (data: NewData, { rejectWithValue }) => {
    try {
      const response = await createNew(data);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const newSlice = createSlice({
  name: 'new',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createNewThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createNewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default newSlice.reducer;
```

## Database Management

### MongoDB Best Practices

**Schema Design:**

- Use appropriate data types
- Implement proper indexing
- Define validation rules
- Use references vs. embedding strategically

**Indexing Strategy:**

```typescript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
postSchema.index({ author_id: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
```

**Connection Management:**

```typescript
// Server/src/config/database.ts
import mongoose from 'mongoose';
import config from 'config';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = config.get<string>('db.connectionString');

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

## Performance Optimization

### Frontend Performance

**Bundle Optimization:**

```typescript
// Lazy load components
const Profile = lazy(() => import('./Pages/Profile'));
const Messages = lazy(() => import('./Pages/Messages'));

// Code splitting in routes
<Route path="/profile" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Profile />
  </Suspense>
} />
```

**State Management:**

```typescript
// Memoize selectors
export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter((post) => post.author_id === userId)
);

// Optimize component re-renders
const PostItem = React.memo(({ post }: { post: Post }) => {
  // Component implementation
});
```

### Backend Performance

**Database Optimization:**

```typescript
// Use lean queries for read-only data
const posts = await Post.find().lean();

// Populate only required fields
const posts = await Post.find()
  .populate('author_id', 'username avatar')
  .populate('comments', 'content author createdAt');

// Use aggregation pipelines for complex queries
const userStats = await User.aggregate([
  { $match: { _id: userId } },
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'author_id',
      as: 'posts',
    },
  },
  {
    $project: {
      username: 1,
      postsCount: { $size: '$posts' },
      followersCount: { $size: '$followers' },
    },
  },
]);
```

## Debugging

### Backend Debugging

**VS Code Debug Configuration:**
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/Server/src/index.ts",
      "outFiles": ["${workspaceFolder}/Server/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**Logging Strategy:**

```typescript
// Create logger utility
import config from 'config';

export const logger = {
  info: (message: string, meta?: any) => {
    if (config.get('NODE_ENV') === 'development') {
      console.log(`[INFO] ${message}`, meta || '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  debug: (message: string, meta?: any) => {
    if (config.get('NODE_ENV') === 'development') {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  },
};
```

### Frontend Debugging

**Redux DevTools:**

```typescript
// app/store.ts - Redux DevTools integration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    profile: profileReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
```

**React DevTools:**

- Install React Developer Tools browser extension
- Use Profiler tab for performance analysis
- Inspect component props and state

## Security Considerations

### Backend Security

**Input Validation:**

```typescript
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(10).max(50),
  content: z.string().min(30),
  image: z.string().url().optional(),
});

export const validateCreatePost = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createPostSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Validation failed', details: error.errors });
  }
};
```

**Rate Limiting:**

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

app.use('/auth/login', authLimiter);
```

### Frontend Security

**XSS Prevention:**

```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);
```

**Secure API Calls:**

```typescript
// Always validate data before sending
const createPost = async (postData: PostData) => {
  const validatedData = createPostSchema.parse(postData);
  // Make API call with validated data
};
```

## Common Issues and Solutions

### TypeScript Issues

**Module Resolution:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/features/*": ["features/*"]
    }
  }
}
```

### MongoDB Connection Issues

**Connection Timeout:**

```typescript
// Increase timeout values
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});
```

### CORS Issues

**Frontend calling Backend:**

```typescript
// Server CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

## Contributing Guidelines

1. **Fork the repository**
2. **Create a feature branch**
3. **Follow code style guidelines**
4. **Write/update tests**
5. **Update documentation**
6. **Submit a pull request**

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Error handling implemented
- [ ] Types are properly defined
- [ ] API endpoints are documented
