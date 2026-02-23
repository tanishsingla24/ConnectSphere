# Contributing to Interest-Based Video Chat

We appreciate your interest in contributing to this project! This document provides guidelines and instructions for development.

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Report issues responsibly
- Avoid spam and self-promotion

## Development Setup

### Prerequisites
- Node.js 16+
- MongoDB
- Git

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd interest-based-video-chat

# Setup both backend and frontend
cd backend
npm install
cp .env.example .env

cd ../frontend
npm install
cp .env.example .env
```

### Running in Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Code Style Guidelines

### General
- Use ES6+ syntax and modern JavaScript
- Write self-documenting code with clear variable names
- Keep functions small and focused (single responsibility)
- Add comments for complex logic
- Follow DRY principle (Don't Repeat Yourself)

### Backend (Node.js/Express)
- Use `async/await` instead of traditional callbacks
- Separate business logic into services
- Keep controllers thin (just handle HTTP)
- Validate all input with validators
- Use descriptive error messages
- Follow RESTful conventions for API design

### Frontend (React)
- Use functional components with hooks
- Lift state to Context when needed globally
- Extract reusable components
- Use meaningful component names
- Keep state management simple
- Document prop types

### Naming Conventions

**Backend:**
- `camelCase` for variables and functions
- `PascalCase` for classes and models
- UPPER_SNAKE_CASE for constants
- Prefix event names with verb (e.g., `user-joined`, `match-found`)

**Frontend:**
- `PascalCase` for components
- `camelCase` for functions and variables
- UPPER_SNAKE_CASE for constants
- Use descriptive hook names (`useAuth`, `usePeerConnection`)

## Making Changes

### Before You Start
1. Check existing issues to avoid duplicates
2. For major features, open an issue for discussion first
3. Ask questions in issues if unclear

### Process
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make focused, logical commits
3. Write clear commit messages:
   ```
   feat: Add user interest matching algorithm
   
   - Implement O(n) matching algorithm
   - Prioritize by common interest count
   - Add comprehensive tests
   ```

### Commit Message Format
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Build, dependencies, or tooling

## Testing

### Manual Testing
- Test all user workflows (register → login → match → call)
- Test error scenarios (wrong password, duplicate email, etc.)
- Test edge cases (rapid button clicks, network disconnect)
- Test on multiple browsers

### Expected Test Scenarios
1. **Authentication**: Register, login, token refresh
2. **Matching**: Join queue with different interest combinations
3. **WebRTC**: Connection establishment, media streaming
4. **Error Handling**: API failures, network issues
5. **UI**: Responsive design on mobile/tablet/desktop

## Documentation

- Update README if adding new features
- Document new environment variables
- Add inline comments for complex logic
- Include examples in API documentation

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All new features are documented
- [ ] Manual testing completed
- [ ] Browser console has no errors/warnings
- [ ] Backend console shows no errors
- [ ] .env files are in .gitignore (never commit real credentials)

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed:
- [ ] Tested locally
- [ ] Verified on multiple browsers
- [ ] Error handling tested

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #(issue number)
```

### Expectations
- Keep PRs focused (one feature/fix per PR)
- Write descriptive PR titles
- Link related issues
- Respond to review comments promptly
- Request re-review after making changes

## Project Structure Guidelines

### Adding a New Feature

**Backend:**
1. Create model if new data type: `src/models/NewModel.js`
2. Add validation: `src/utils/validators.js`
3. Create controller: `src/controllers/newController.js`
4. Add service if complex logic: `src/services/newService.js`
5. Add routes: `src/routes/new.js`
6. Import in `server.js`

**Frontend:**
1. Create page/component in appropriate folder
2. Add styles to relevant CSS file
3. Create service if API calls: `src/services/newService.js`
4. Add hook if complex state: `src/hooks/useNew.js`
5. Update routing in `main.jsx`

### File Organization
- Keep related files close together
- Use barrel exports (`index.js`) for cleaner imports
- One component per file (unless closely related)
- Maximum 300 lines per file preferably

## Performance Considerations

### Backend
- Index frequently queried fields in MongoDB
- Use pagination for large data sets
- Cache expensive operations
- Monitor database queries
- Profile server endpoints

### Frontend
- Lazy load routes and components
- Memoize expensive computations
- Avoid unnecessary re-renders
- Optimize image sizes
- Monitor bundle size

## Security Review Checklist

- [ ] No credentials in code
- [ ] Input validation on all endpoints
- [ ] Authentication checks on protected routes
- [ ] SQL injection prevention (using ODM)
- [ ] CORS properly configured
- [ ] Error messages don't expose internals
- [ ] Password validation strong enough
- [ ] No console.log with sensitive data

## Debugging Tips

### Backend
```bash
# Debug with Node inspector
node --inspect-brk src/server.js

# Check MongoDB connection
node -e "require('dotenv').config(); require('./src/config/mongodb').connectDB()"

# View environment
npm run dev 2>&1 | grep -i "error\|warn"
```

### Frontend
- Use React DevTools browser extension
- Check Network tab for API calls
- Check Console for errors
- Use Vue/React debugger for state inspection

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+

Test on at least:
- Latest Chrome
- Firefox
- Safari (if Mac)

## Release Process

1. Update version in `package.json` files
2. Update `CHANGELOG.md` (if exists)
3. Create git tag: `git tag vX.Y.Z`
4. Push: `git push origin vX.Y.Z`

## Questions or Need Help?

- Comment on related GitHub issue
- Check documentation in `/docs`
- Review similar implemented features
- Ask in pull request discussions

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process on port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Kill process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                  # Mac/Linux
```

### MongoDB Connection Failed
```bash
# Ensure MongoDB running
mongo # or mongosh for newer versions

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/interest-video-chat
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [MDN Web Docs](https://developer.mozilla.org)
- [Express.js Guide](https://expressjs.com)
- [React Docs](https://react.dev)
- [MongoDB Docs](https://docs.mongodb.com)
- [Socket.IO Docs](https://socket.io/docs)

---

**Thank you for contributing!** 🚀
