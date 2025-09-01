# Pac-Man Mobile 🎮

A modern, mobile-friendly Pac-Man game built with React, featuring touch controls, directional buttons, and anime-inspired styling. This project includes both a frontend React application and a backend server for leaderboard functionality.

![Pac-Man Mobile](https://img.icons8.com/color/96/000000/pacman.png)

## Features

- **Mobile-First Design**: Optimized for touch devices with swipe controls
- **Directional Buttons**: On-screen controls for precise movement
- **Anime-Inspired Styling**: Beautiful visuals with an anime aesthetic
- **Ghost AI**: Intelligent ghosts that chase and evade Pac-Man
- **Power Pellets**: Temporary ghost vulnerability for scoring opportunities
- **Leaderboard**: Local and online score tracking with a Node.js backend
- **Responsive Design**: Works on all screen sizes
- **RESTful API**: Backend server for storing and retrieving high scores

## How to Play

1. **Start the game** by tapping the "Start Game" button
2. **Control Pac-Man** using:
   - Swipe gestures in any direction
   - On-screen directional buttons
3. **Eat all pellets** to win the game
4. **Avoid ghosts** unless you've eaten a power pellet
5. **Set a high score** and compete on the leaderboard

## Project Structure

```
pacman-mobile/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── Game.js        # Game component with logic and rendering
│   │   ├── index.js       # Application entry point
│   │   ├── index.css      # Global styles and animations
│   │   └── maps.js        # Game maps and level data
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── server.js          # Express server with leaderboard API
│   └── package.json       # Backend dependencies
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Frontend Setup
1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Backend Setup
1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

4. The server will run on `http://localhost:3001`

### Deployment to Render
1. Create a Render account and connect your repository
2. For the frontend, create a Static Site and point to the client directory
3. For the backend, create a Web Service and point to the server directory
4. Set the environment variables if needed
5. Deploy!

## API Endpoints

The backend provides the following endpoints:

- `GET /leaderboard` - Retrieve the top scores
- `POST /leaderboard` - Submit a new score
- Request body: `{ name: "Player", score: 1000 }`

## Technologies Used

### Frontend
- **React**: Frontend framework
- **HTML5 Canvas**: Game rendering
- **CSS3**: Styling and animations
- **JavaScript ES6+**: Game logic
- **Local Storage**: Score persistence

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **Body-parser**: Request body parsing

## Customization

### Adding New Maps
Edit `maps.js` to add new game layouts. The format uses characters to represent:
- `W`: Wall
- `.`: Pellet
- `o`: Power pellet
- `P`: Pac-Man starting position
- `G`: Ghost starting position

### Styling Changes
Modify `index.css` to change the visual appearance. The CSS uses variables for easy color customization:

```css
:root {
  --bg1: #1a1a2e;
  --bg2: #16213e;
  --wall1: #0f3460;
  --pac: #ffd740;
  /* Add your own color variables */
}
```

## Browser Support

This game works on all modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Mobile Optimization

The game is specifically optimized for mobile devices with:
- Touch-friendly controls
- Responsive layout
- Performance-optimized rendering
- Battery-efficient game loop

## Troubleshooting

### Common Issues
1. **Black screen on startup**: Check your browser console for JavaScript errors
2. **Controls not working**: Ensure you're using a touch-enabled device or modern browser
3. **Leaderboard not loading**: Verify the backend server is running

### Debugging
1. Open browser developer tools (F12)
2. Check the Console tab for errors
3. Verify network requests to the backend are successful

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

Some ideas for future versions:
- Multiple levels with increasing difficulty
- Different ghost behaviors and personalities
- Sound effects and background music
- Power-up system with special abilities
- Multiplayer mode

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Pac-Man created by Toru Iwatani and published by Bandai Namco Entertainment
- Icons by Icons8
- Press Start 2P font by CodeMan38
- Inspired by classic arcade games

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Enjoy playing Pac-Man Mobile!** 🎯

*This project was created with love for retro gaming and modern web development. The code might not be perfect, but it's made with passion and a lot of debugging!* 😊
```