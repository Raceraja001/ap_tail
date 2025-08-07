# Development Guide

This guide covers the development setup, architecture, and best practices for the TailAdmin React Dashboard project.

## 🏗️ Architecture Overview

This project implements modern system design principles and SOLID principles:

### Core Architecture Patterns

- **Clean Architecture**: Separation of concerns with distinct layers
- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **Provider Pattern**: Dependency injection and context management
- **Factory Pattern**: Object creation abstraction

### SOLID Principles Implementation

- **Single Responsibility**: Each component/service has one reason to change
- **Open/Closed**: Extensible without modification through interfaces
- **Liskov Substitution**: Implementations are interchangeable
- **Interface Segregation**: Focused, specific interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Open Vitest UI
- `npm run validate` - Run all checks (type, lint, test)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common/shared components
│   ├── form/           # Form components
│   ├── tables/         # Table components
│   └── ui/             # Basic UI components
├── core/               # Core business logic
│   ├── api/            # API services and hooks
│   ├── auth/           # Authentication system
│   ├── data/           # Data layer (repositories, services)
│   ├── error/          # Error handling
│   ├── forms/          # Form utilities and validation
│   ├── http/           # HTTP client
│   ├── notifications/  # Notification system
│   ├── performance/    # Performance monitoring
│   └── routing/        # Routing utilities
├── context/            # React contexts
├── hooks/              # Custom React hooks
├── layout/             # Layout components
├── pages/              # Page components
└── test/               # Test utilities and setup
```

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Full application workflows

### Testing Tools

- **Vitest**: Test runner and framework
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking
- **User Event**: User interaction simulation

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## 🎨 Code Style

### ESLint Configuration

- TypeScript strict rules
- React hooks rules
- Import organization
- Code quality rules

### Prettier Configuration

- Single quotes
- Semicolons
- 2-space indentation
- 100 character line length

### Commit Convention

We use Conventional Commits:

```
feat: add new user management feature
fix: resolve authentication bug
docs: update API documentation
style: format code with prettier
refactor: restructure auth service
test: add user service tests
```

## 🔧 Development Workflow

### Pre-commit Hooks

Husky runs the following checks before each commit:

1. **Lint-staged**: Format and lint changed files
2. **Type checking**: Ensure TypeScript compilation
3. **Tests**: Run tests for changed files

### Code Review Checklist

- [ ] Follows SOLID principles
- [ ] Has appropriate tests
- [ ] Follows naming conventions
- [ ] Includes proper error handling
- [ ] Has TypeScript types
- [ ] Follows accessibility guidelines

## 🚀 Performance

### Optimization Strategies

- **Code Splitting**: Route-based lazy loading
- **Virtual Scrolling**: For large lists
- **Memoization**: React.memo, useMemo, useCallback
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: HTTP client and React Query caching

### Performance Monitoring

```typescript
import { usePerformance } from '../core/performance/usePerformance';

const MyComponent = () => {
  const { metrics } = usePerformance({
    componentName: 'MyComponent',
    trackMemory: true,
  });

  // Component logic
};
```

## 🔐 Security

### Authentication

- JWT token-based authentication
- Automatic token refresh
- Secure storage practices
- Permission-based access control

### Best Practices

- Input validation with Zod schemas
- XSS prevention
- CSRF protection
- Secure HTTP headers

## 📊 State Management

### Data Fetching

- **React Query**: Server state management
- **Repository Pattern**: Data access layer
- **Caching**: Intelligent caching strategies

### Local State

- **React Context**: Global application state
- **useState/useReducer**: Component-level state
- **Custom Hooks**: Reusable state logic

## 🎯 Best Practices

### Component Design

1. **Single Responsibility**: One component, one purpose
2. **Composition over Inheritance**: Use composition patterns
3. **Props Interface**: Well-defined TypeScript interfaces
4. **Error Boundaries**: Graceful error handling
5. **Accessibility**: ARIA labels and semantic HTML

### Performance

1. **Lazy Loading**: Route and component level
2. **Memoization**: Prevent unnecessary re-renders
3. **Virtual Scrolling**: For large datasets
4. **Bundle Splitting**: Optimize loading times

### Testing

1. **Test Behavior**: Focus on user interactions
2. **Mock External Dependencies**: Use MSW for API calls
3. **Accessibility Testing**: Include a11y checks
4. **Coverage Goals**: Aim for 80%+ coverage

## 🐛 Debugging

### Development Tools

- React Developer Tools
- Redux DevTools (if using Redux)
- React Query DevTools
- Performance monitoring hooks

### Common Issues

1. **Authentication**: Check token expiration and refresh logic
2. **Performance**: Use React Profiler and performance hooks
3. **State Updates**: Verify immutability and proper dependencies
4. **API Calls**: Check network tab and MSW handlers

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Vitest](https://vitest.dev)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
