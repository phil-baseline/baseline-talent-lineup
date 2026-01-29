# Contributing to Lineup

Thank you for your interest in contributing to Lineup! This document provides guidelines and information for contributors.

## Code of Conduct

Be kind and respectful. We're all here to build something useful together.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lineup.git
   cd lineup
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/baselinetalent/lineup/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and OS information
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues and discussions for similar ideas
2. Create a new issue with:
   - Clear description of the feature
   - Use case(s) it would solve
   - Any implementation ideas you have

### Pull Requests

1. Fork the repository and create a branch from `main`
2. Make your changes
3. Ensure the build passes: `npm run build`
4. Ensure type checking passes: `npm run typecheck`
5. Update documentation if needed
6. Submit a pull request

#### PR Guidelines

- Keep changes focused and atomic
- Write clear commit messages
- Add comments for complex logic
- Follow existing code style
- Test your changes in multiple browsers if touching UI

## Project Structure

```
src/
├── components/          # React components
│   ├── Board/          # Kanban board components
│   ├── CandidateDetail/ # Candidate detail and modal components
│   ├── Sidebar/        # Sidebar and navigation components
│   └── common/         # Shared/reusable components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── resumeParser.ts # PDF/DOCX resume parsing
│   ├── fileStorage.ts  # File System Access API wrapper
│   └── linkUtils.ts    # Link handling utilities
├── store/              # Zustand state management
│   ├── index.ts        # Main store
│   └── types.ts        # TypeScript types
└── App.tsx             # Root component
```

## Architecture Decisions

### Privacy First

All data stays on the user's machine. Never add features that:
- Send data to external servers
- Require user accounts
- Track usage analytics

### File-Based Storage

Data is stored as human-readable JSON files. Users should be able to:
- Read their data with any text editor
- Back up their data by copying files
- Migrate to other tools easily

### No Build-Time Dependencies on External Services

The app should work completely offline after initial load. Don't add:
- External API calls
- Third-party authentication
- Remote configuration

## Code Style

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer interfaces over type aliases for object shapes
- Export types alongside their components

### React

- Use functional components with hooks
- Keep components focused and small
- Colocate related code (component + styles + types)

### CSS

- Use Tailwind CSS utility classes
- Follow the existing color palette (see `tailwind.config.ts`)
- Prefer CSS variables for theme values

## Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are very welcome!

Suggested testing stack:
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

## Questions?

Feel free to open an issue for any questions about contributing. We're happy to help!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
