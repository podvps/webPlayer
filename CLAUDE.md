# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
- Install dependencies: `pnpm install`
- Start development server: `pnpm run dev` (runs on http://localhost:3000)
- Build for production: `pnpm run build` (outputs to `dist/static/`)

### Project Scripts
- `pnpm dev:client` - Start Vite dev server with host flag on port 3000
- `pnpm build:client` - Build client assets to `dist/static/`
- `pnpm build` - Clean dist, build client, copy package.json, and create build.flag

## Architecture Overview

This is a React-based local video player application built with modern web technologies.

### Core Technologies
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with React plugin and TypeScript path mapping
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router DOM for navigation
- **UI Components**: Custom components with Framer Motion for animations
- **Video Player**: Custom HTML5 video player with Plyr-style controls
- **Notifications**: Sonner for toast notifications
- **Icons**: Font Awesome icons

### Project Structure
- `src/pages/Home.tsx` - Main video player component (922 lines)
- `src/components/` - Reusable UI components (FileTree, FolderNode, FileNode, etc.)
- `src/contexts/authContext.ts` - Authentication context (currently basic)
- `src/hooks/useTheme.ts` - Theme management hook
- `src/media/fileData.ts` - Mock file system data with hierarchical video library
- `src/styles/plyr-controls.css` - Custom CSS for video player controls

### Key Components Architecture

#### Video Player (Home.tsx)
The main application component that handles:
- Video playback with custom controls (play/pause, seek, volume, fullscreen)
- File tree integration for video selection
- Drag-and-drop file upload
- Auto-play functionality with video sequencing
- Responsive layout (horizontal on desktop, vertical on mobile)
- Theme switching (light/dark mode)
- Settings menu (playback speed, reset position)

#### File System
- Mock hierarchical file structure in `src/media/fileData.ts`
- Categories: 视频库 (Movies, Documentaries, TV Series), 下载 (Downloads), 收藏夹 (Favorites), 工作视频 (Work Videos)
- FileTree component with expand/collapse functionality
- File selection and video loading integration

#### Player Controls
- Custom Plyr-style control bar built with Tailwind CSS
- Standard controls: play/pause, seek, volume, mute, fullscreen
- Advanced features: picture-in-picture, auto-play, playback speed adjustment
- Progress bar with buffering indicator
- Responsive design (controls hide/show based on screen size)

### State Management
- React hooks for local state management
- Context API for authentication and theme
- No external state management library

### File Handling
- Supports local file upload via drag-and-drop or file picker
- Mock file system with predefined video library
- File metadata tracking (name, size, lastModified)
- Path-based file loading from `/media/` directory

### Build Configuration
- TypeScript with strict mode enabled
- Path aliases (`@/*` maps to `./src/*`)
- Vite with React plugin and TypeScript path resolution
- Production builds optimized for static hosting

### Development Notes
- The application uses mock file data rather than real file system access
- Video files are served from the `/media/` directory in production
- Responsive design switches between horizontal and vertical layouts
- All UI text is in Chinese
- The build configuration files have warning comments about not being editable