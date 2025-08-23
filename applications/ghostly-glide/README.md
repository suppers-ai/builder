# 👻 Ghostly Glide

A spooky-fun 2D web game where you play as a friendly ghost navigating through haunted houses, collecting spirit orbs while avoiding obstacles.

## 🎮 How to Play

### Controls
- **Movement**: Use LEFT/RIGHT arrow keys or A/D to move horizontally
- **Ethereal Form**: Press SPACE to become ethereal (pass through obstacles) - 5 second cooldown
- **Pause**: Press ESC or P to pause the game
- **Touch/Mobile**: Tap left or right side of the screen to move

### Objective
- Navigate your ghost upward through each haunted house
- Collect spirit orbs to complete levels (required amount shown in UI)
- Avoid obstacles or use ethereal form to pass through them
- Find special power-ups for bonus abilities
- Complete all 10 levels to achieve victory!

## 🎯 Game Features

### Power-ups
- **Spirit Orbs** (Cyan): Required collectibles to complete levels
- **Poltergeist Pearl** (Purple): Rare item that grants speed boost
- **Speed Boost**: Increases movement speed for 5 seconds
- **Invincibility**: Makes you immune to damage for 5 seconds
- **Extra Life**: Adds an additional life

### Obstacles
- **Static Obstacles**: Fixed barriers that damage on contact
- **Dynamic Obstacles**: Moving hazards with various patterns
- **Spooky Zones**: Areas that slow down your movement

### Levels
The game features 10 progressively challenging levels:
1. Haunted Mansion Entry
2. The Creaky Corridor
3. Phantom's Parlor
4. Spectral Staircase
5. Ghoulish Gallery
6. Ethereal Attic
7. Cursed Cellar
8. Wraith's Workshop
9. Poltergeist Plaza
10. Spirit King's Throne

## 🚀 Running the Game

### Prerequisites
- Deno runtime installed
- Node.js (for npm packages)

### Development
```bash
# Install dependencies (first time only)
deno cache dev.ts

# Run development server
deno task dev

# Or run directly
deno run -A dev.ts
```

The game will be available at http://localhost:8010

### Building for Production
```bash
# Build the game
deno task build

# Run production server
deno task preview
```

## 🏗️ Technical Stack

- **Runtime**: Deno
- **Framework**: Fresh 2.0
- **Frontend**: Preact with TypeScript
- **Styling**: TailwindCSS
- **Game Engine**: Custom HTML5 Canvas engine
- **Audio**: Web Audio API for synthesized sound effects

## 📁 Project Structure

```
ghostly-glide/
├── game/              # Game engine and logic
│   ├── engine.ts      # Main game engine
│   ├── levels.ts      # Level generator
│   └── audio.ts       # Audio manager
├── islands/           # Interactive components
│   └── GameCanvas.tsx # Main game canvas component
├── routes/            # Fresh routes
│   ├── _app.tsx       # App wrapper
│   └── index.tsx      # Home page
├── types/             # TypeScript definitions
│   └── game.ts        # Game type definitions
├── static/            # Static assets
│   └── styles.css     # Global styles
└── deno.json          # Deno configuration
```

## 🎨 Game Mechanics

### Scoring System
- Collect spirit orbs for points (100+ per orb)
- Combo system for consecutive collections
- Time bonus for quick completion
- Special items provide bonus points
- High score is saved locally

### Lives & Health
- Start with 3 lives
- Each ghost has 3 health points
- Taking damage reduces health
- Losing all health costs a life
- Game over when all lives are lost

### Special Abilities
- **Ethereal Form**: 3-second duration, 5-second cooldown
- Allows passing through all obstacles
- Visual indicator shows when available
- Strategic use required for difficult sections

## 🐛 Troubleshooting

### Game not loading?
- Ensure Deno is installed and up to date
- Check that port 8010 is not in use
- Clear browser cache and refresh

### Performance issues?
- Try using a modern browser (Chrome, Firefox, Safari)
- Close other tabs to free up resources
- The game is optimized for desktop but works on mobile

## 📝 License

This game was created as part of the Suppers AI Builder project.

## 🎉 Have Fun!

Enjoy navigating through the haunted houses and collecting those spirit orbs! Can you complete all 10 levels and achieve the highest score?