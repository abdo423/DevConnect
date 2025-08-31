# DevConnect Troubleshooting Guide

## Common Setup Issues

### Frontend Issues

#### Build Errors

**Missing Dependencies:**
```bash
Error: Cannot find module 'react-router-dom'
```

**Solution:**
```bash
cd Client/devConnect
npm install react-router-dom react-redux @reduxjs/toolkit date-fns
```

**TypeScript Compilation Errors:**
```bash
src/App.tsx:1:29 - error TS2307: Cannot find module 'react-router-dom'
```

**Solution:**
Install missing packages and check `package.json`:
```bash
npm install @types/react-router-dom @types/react-redux
```

**Vite Build Issues:**
```bash
Could not resolve "./components/ui/button"
```

**Solution:**
Check path aliases in `vite.config.ts`:
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

#### Runtime Errors

**Redux Store Not Found:**
```bash
Error: Could not find "store" in the context of "Connect(Component)"
```

**Solution:**
Wrap your app with Redux Provider:
```typescript
// main.tsx
import { Provider } from 'react-redux';
import { store } from './app/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

**API Connection Errors:**
```bash
Network Error: Request failed with status code 404
```

**Solution:**
1. Check if backend server is running on port 3000
2. Verify API base URL in frontend code
3. Check CORS configuration in backend

---

### Backend Issues

#### Server Startup Errors

**TypeScript Configuration Error:**
```bash
error TS5110: Option 'module' must be set to 'NodeNext' when option 'moduleResolution' is set to 'NodeNext'
```

**Solution:**
Update `Server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

**MongoDB Connection Failed:**
```bash
MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
```

**Solution:**
1. Check if MongoDB is running: `mongod`
2. Verify connection string in configuration
3. Check network connectivity to MongoDB Atlas
4. Ensure IP address is whitelisted in Atlas

**Missing Configuration:**
```bash
Error: Configuration property 'db.connectionString' is not defined
```

**Solution:**
Create configuration files:
```bash
# Copy example files
cp Server/.env.example Server/.env
cp Server/config/development.json.example Server/config/development.json

# Edit with your values
nano Server/.env
nano Server/config/development.json
```

**Port Already in Use:**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### Authentication Issues

**JWT Token Errors:**
```bash
JsonWebTokenError: invalid token
```

**Solution:**
1. Check JWT secret in configuration matches between client/server
2. Verify token format in Authorization header: `Bearer <token>`
3. Check token expiration

**Cookie Issues:**
```bash
Error: auth-token cookie not found
```

**Solution:**
1. Verify CORS credentials are enabled: `credentials: true`
2. Check cookie domain and path settings
3. Ensure HTTPS in production

---

### Database Issues

#### Connection Problems

**Authentication Failed:**
```bash
MongoServerError: Authentication failed
```

**Solution:**
1. Check username/password in connection string
2. Verify user has correct permissions
3. Check database name in connection string

**Network Timeout:**
```bash
MongooseServerSelectionError: connect ETIMEDOUT
```

**Solution:**
1. Check internet connection
2. Verify MongoDB Atlas IP whitelist
3. Increase connection timeout in mongoose options

#### Schema Validation Errors

**Validation Error:**
```bash
ValidationError: Path `email` is required
```

**Solution:**
1. Ensure all required fields are provided
2. Check field types match schema definition
3. Verify custom validation functions

**Duplicate Key Error:**
```bash
MongoServerError: E11000 duplicate key error
```

**Solution:**
1. Check unique constraints in schema
2. Handle duplicate entries in application logic
3. Update instead of insert if record exists

---

### Environment Setup Issues

#### Node.js Version Compatibility

**Unsupported Node Version:**
```bash
error engines Wanted: {"node":">=18.0.0"}
```

**Solution:**
```bash
# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 18
nvm install 18
nvm use 18
```

#### Package Manager Issues

**npm Cache Problems:**
```bash
npm ERR! Unexpected end of JSON input
```

**Solution:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Permission Errors (macOS/Linux):**
```bash
EACCES: permission denied
```

**Solution:**
```bash
# Use nvm instead of system Node.js
# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

---

### Development Environment Issues

#### Hot Reload Not Working

**Vite HMR Issues:**
```bash
[vite] hmr update /src/App.tsx failed
```

**Solution:**
1. Check file watching limits on Linux: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
2. Restart development server
3. Clear browser cache

**Backend Auto-restart Issues:**
```bash
nodemon not restarting on file changes
```

**Solution:**
1. Check nodemon configuration in `package.json`
2. Verify file patterns in nodemon config
3. Install nodemon globally: `npm install -g nodemon`

#### IDE and Editor Issues

**TypeScript IntelliSense Not Working:**

**Solution:**
1. Install VS Code TypeScript extension
2. Restart TypeScript server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
3. Check `tsconfig.json` configuration

**Import Path Errors:**
```bash
Cannot resolve symbol 'Component'
```

**Solution:**
1. Check path aliases in `tsconfig.json`
2. Verify file extensions in imports
3. Restart IDE/editor

---

### Production Deployment Issues

#### Build Failures

**Frontend Build Errors:**
```bash
Build failed with 1 error: error: No loader is configured for ".node" files
```

**Solution:**
1. Check for binary dependencies
2. Update Vite configuration for node modules
3. Use appropriate build target

**Backend Compilation Errors:**
```bash
Unable to compile TypeScript
```

**Solution:**
1. Fix TypeScript errors in source code
2. Update `tsconfig.json` for production
3. Check for missing type definitions

#### Deployment Platform Issues

**Vercel Deployment:**
```bash
Error: Command "npm run build" exited with 1
```

**Solution:**
1. Check build script in `package.json`
2. Verify environment variables are set
3. Check build logs for specific errors

**Railway/Heroku Deployment:**
```bash
Application error: Failed to bind to $PORT
```

**Solution:**
```typescript
// Use process.env.PORT in server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
```

#### Database Connection in Production

**Connection String Issues:**
```bash
MongoParseError: Invalid connection string
```

**Solution:**
1. URL encode special characters in password
2. Use srv connection string for Atlas
3. Check connection string format

---

### Performance Issues

#### Slow API Responses

**Database Query Performance:**

**Solution:**
1. Add appropriate indexes:
```javascript
db.posts.createIndex({ author_id: 1, createdAt: -1 })
```

2. Use aggregation pipelines for complex queries
3. Implement pagination for large datasets
4. Use lean() for read-only queries

**Memory Leaks:**
```bash
Process ran out of memory
```

**Solution:**
1. Monitor memory usage: `process.memoryUsage()`
2. Check for unclosed database connections
3. Implement connection pooling
4. Use clustering for Node.js

#### Frontend Performance Issues

**Large Bundle Size:**
```bash
Warning: Bundle size exceeds recommended limit
```

**Solution:**
1. Implement code splitting:
```typescript
const LazyComponent = lazy(() => import('./Component'));
```

2. Analyze bundle with webpack-bundle-analyzer
3. Remove unused dependencies
4. Use dynamic imports for heavy libraries

---

### Security Issues

#### CORS Errors

**Blocked by CORS Policy:**
```bash
Access to fetch at 'http://localhost:3000' blocked by CORS policy
```

**Solution:**
```typescript
// Backend CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "https://your-domain.com"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Authentication Errors

**Token Expired:**
```bash
TokenExpiredError: jwt expired
```

**Solution:**
1. Implement token refresh mechanism
2. Handle expired tokens gracefully in frontend
3. Clear invalid tokens from storage

---

### Testing Issues

#### Jest Configuration

**Module Resolution Errors:**
```bash
Cannot find module '@/components/Button'
```

**Solution:**
```javascript
// jest.config.js
module.exports = {
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

#### Mock Issues

**Axios Mocking:**
```bash
TypeError: Cannot read property 'get' of undefined
```

**Solution:**
```typescript
// __mocks__/axios.ts
export default {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
};
```

---

### Debugging Tips

#### Enable Debug Logs

**Backend:**
```typescript
// Add debug logging
import debug from 'debug';
const log = debug('devconnect:server');

log('Server starting...');
```

**Frontend:**
```typescript
// Redux DevTools
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});
```

#### Network Debugging

**Check API Calls:**
1. Use browser Network tab
2. Verify request headers and body
3. Check response status codes
4. Use tools like Postman for API testing

#### Database Debugging

**MongoDB Queries:**
```javascript
// Enable query logging
mongoose.set('debug', true);

// Check slow queries
db.setProfilingLevel(2);
db.system.profile.find().sort({ts: -1}).limit(5);
```

---

### Getting Help

#### Documentation Resources

1. **MongoDB**: https://docs.mongodb.com/
2. **Express.js**: https://expressjs.com/
3. **React**: https://reactjs.org/docs/
4. **TypeScript**: https://www.typescriptlang.org/docs/
5. **Vite**: https://vitejs.dev/guide/

#### Community Support

1. **Stack Overflow**: Tag questions with specific technologies
2. **GitHub Issues**: Check project repositories for similar issues
3. **Discord/Slack**: Join relevant developer communities
4. **Reddit**: r/reactjs, r/node, r/mongodb

#### Creating Bug Reports

When reporting issues:
1. Include error messages and stack traces
2. Provide minimal reproduction steps
3. Share relevant configuration files
4. Specify environment details (OS, Node version, etc.)
5. Include screenshots for UI issues

---

This troubleshooting guide covers the most common issues you might encounter while setting up and developing DevConnect. Keep this guide updated as new issues are discovered and resolved.