# GAKneeboard Project Context

This file provides high-level context about the GAKneeboard project for Amazon Q to understand the codebase structure and purpose.

## Project Overview
GAKneeboard is a Vue.js-based web application for creating customizable aviation kneeboard templates for pilots. It allows pilots to create, customize, and print flight planning documents with various tiles containing aviation-specific information.

## Key Architecture
- **Frontend**: Vue 3 with TypeScript, PrimeFaces UI components
- **Build**: Vite-based development and build system
- **Styling**: Scoped CSS with custom aviation-themed components

## Core Concepts
- **Tiles**: Modular components that display specific aviation information (airports, radios, weather, etc.)
- **Templates**: Collections of tiles arranged on pages for printing
- **Display Modes**: Different ways tiles can present their information
- **Kneeboard**: The final printed document pilots use during flight

## Main Directories
- `/src/components/`: Vue components organized by functionality
- `/src/model/`: TypeScript models and data structures
- `/src/lib/`: Utility libraries and services
- `/src/assets/`: Static assets and data files

## Component Categories
- **Airport**: Airport diagrams, runway information, frequencies
- **Radios**: Communication frequencies, lost comms procedures
- **Weather**: METAR, TAF, winds aloft information
- **Navigation**: VOR service volumes, navigation aids
- **Planning**: Flight planning tools, checklists, notes
- **Shared**: Reusable UI components across the application

## Development Workflow
- Use `npm run dev` for local development (port 5173)
- Version format: YWWN (Year + Week + Number within week)
- Release notes tracked in Release.md
- Version number stored in /src/assets/data.js