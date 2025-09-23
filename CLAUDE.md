# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Next.js with Turbopack)
- **Build for production**: `npm run build` (uses Next.js with Turbopack)
- **Start production server**: `npm start`
- **Lint code**: `npm run lint` (uses ESLint with Next.js config)

## Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4. The project is named "face-recognition" but currently contains the default Next.js starter template.

### Key Technologies
- **Framework**: Next.js 15.5.4 with Turbopack for fast builds
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Full TypeScript setup with strict mode
- **Fonts**: Geist Sans and Geist Mono from next/font/google

### Project Structure
- `app/` - App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Home page (currently default Next.js template)
  - `globals.css` - Global styles including Tailwind directives
- `public/` - Static assets (SVG icons)
- TypeScript path alias `@/*` maps to project root

### Configuration Files
- `tsconfig.json` - TypeScript configuration with Next.js plugin
- `eslint.config.mjs` - ESLint configuration extending Next.js rules
- `next.config.ts` - Next.js configuration (minimal setup)
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS

### Requirements
Alright right now this is a Next js template project.
What I need is this:
I want a web app that you upload a profile photo face picture, like a 3x4 or just selfie, you upload it and then it becomes 3 tree and put on a head that you can move around and interact with. after that I need a set of 3d glasses that you can choose and put on the avatar 3d face with created based on the uploaded image. so the 3d avatar model should wear the glass on click.
now this is the whole picture for now. focus on a slick clean UI design likes vercel apps and design model.
research whats best for the job and lets do it step by step. do a todo list and lets to it step by step so i can track and commit things. good boy.