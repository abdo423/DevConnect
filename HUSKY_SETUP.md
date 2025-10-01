# Husky Setup Guide

This document explains the Husky setup for the DevConnect project.

## Overview

The DevConnect project uses **Husky** for Git hooks, **lint-staged** for running tasks on staged files, and **Prettier** for code formatting. This ensures consistent code style across the entire codebase.

## Structure

The project has Husky configured at multiple levels:

1. **Root Level** (`/`) - Main Husky setup for the monorepo
2. **Client** (`/Client/devConnect`) - Client-specific hooks
3. **Server** (`/Server`) - Server-specific hooks

## Installation

### For New Developers

When you first clone the repository:

```bash
# Clone the repository
git clone https://github.com/abdo423/DevConnect.git
cd DevConnect

# Install root dependencies (this sets up Husky hooks)
npm install

# Install Client dependencies
cd Client/devConnect
npm install

# Install Server dependencies
cd ../../Server
npm install
```

The `npm install` command automatically runs `npm prepare` which executes `husky` to set up the Git hooks.

## How It Works

### Pre-commit Hook

When you commit code, the pre-commit hook automatically:

1. Runs `lint-staged` on all staged files
2. Formats matching files with Prettier
3. Only allows the commit if formatting succeeds

**Affected file types:**

- JavaScript: `.js`, `.jsx`
- TypeScript: `.ts`, `.tsx`
- JSON: `.json`
- CSS: `.css`
- Markdown: `.md`

### Prettier Configuration

The project uses these Prettier settings (defined in `.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

## Manual Formatting

You can manually format files using npm scripts:

```bash
# From the root directory
npm run format           # Format all files
npm run format:check     # Check if files are formatted

# From Client directory
cd Client/devConnect
npm run format           # Format Client files
npm run format:check     # Check Client files

# From Server directory
cd Server
npm run format           # Format Server files
npm run format:check     # Check Server files
```

## Troubleshooting

### Hooks Not Running

If pre-commit hooks aren't running:

```bash
# Reinitialize Husky from the root
cd /path/to/DevConnect
npx husky install
```

### Bypassing Hooks (Emergency Only)

In rare cases where you need to bypass the hooks:

```bash
git commit --no-verify -m "Your commit message"
```

**Note:** Only use this in emergencies. The hooks ensure code quality.

### Hook Fails on Commit

If the hook fails:

1. Check the error message - it usually indicates which files need formatting
2. Run `npm run format` to fix formatting issues
3. Re-stage the files: `git add .`
4. Try committing again

## Commands Reference

| Command                  | Description                               |
| ------------------------ | ----------------------------------------- |
| `npm install`            | Installs dependencies and sets up Husky   |
| `npx husky init`         | Initializes Husky (done automatically)    |
| `npm run format`         | Formats all files with Prettier           |
| `npm run format:check`   | Checks if files are properly formatted    |
| `npx lint-staged`        | Runs lint-staged manually                 |
| `git commit --no-verify` | Bypasses pre-commit hooks (use sparingly) |

## Best Practices

1. **Always run `npm install` first** - This sets up the hooks
2. **Let the hooks do their job** - Don't bypass them unless absolutely necessary
3. **Commit logical chunks** - Makes it easier to track what was formatted
4. **Review changes** - Check what Prettier formatted before pushing
5. **Keep dependencies updated** - Regularly update husky, lint-staged, and prettier

## Configuration Files

- **Root**: `/.husky/pre-commit`, `/package.json`, `/.prettierrc`
- **Client**: `/Client/devConnect/.husky/pre-commit`, `/Client/devConnect/package.json`
- **Server**: `/Server/.husky/pre-commit`, `/Server/package.json`

## Need Help?

If you encounter issues with Husky setup:

1. Check this guide
2. Review the [DEVELOPMENT.md](./docs/DEVELOPMENT.md) documentation
3. Open an issue on GitHub
4. Ask the team for help

---

**Happy coding!** 🎉
