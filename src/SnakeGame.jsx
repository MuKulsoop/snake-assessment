import React from 'react'
import './SnakeGame.css'
import GameOver from './GameOver.jsx'

class SnakeGame extends React.Component {
  constructor(props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.state = {
      width: 0,
      height: 0,
      blockWidth: 0,
      blockHeight: 0,
      gameLoopTimeout: 100,
      timeoutId: 0,
      startSnakeSize: 0,
      snake1: [],
      snake2: [],
      apple1: {},
      apple2: {},
      direction1: 'right',
      direction2: 'left',
      directionChanged1: false,
      directionChanged2: false,
      isGameOver: false,
      snake1Color: this.props.snakeColor || this.getRandomColor(),
      snake2Color: this.getRandomColor(),
      apple1Color: this.props.appleColor || this.getRandomColor(),
      apple2Color: this.getRandomColor(),
      score1: 0,
      score2: 0,
      highScore: Number(localStorage.getItem('snakeHighScore')) || 0,
      newHighScore: false,
      winner: null,
    }
  }

  componentDidMount() {
    this.initGame()
    window.addEventListener('keydown', this.handleKeyDown)
    this.gameLoop()
  }

  initGame() {
    // Game size initialization
    let percentageWidth = this.props.percentageWidth || 40
    let width =
      document.getElementById('GameBoard').parentElement.offsetWidth *
      (percentageWidth / 100)
    width -= width % 30
    if (width < 30) width = 30
    let height = (width / 3) * 2
    let blockWidth = width / 30
    let blockHeight = height / 20

    // snake1 initialization (starts on left side)
    let startSnakeSize = this.props.startSnakeSize || 6
    let snake1 = []
    let Xpos1 = width / 4
    let Ypos1 = height / 2
    let snakeHead1 = { Xpos: Xpos1, Ypos: Ypos1 }
    snake1.push(snakeHead1)
    for (let i = 1; i < startSnakeSize; i++) {
      Xpos1 -= blockWidth
      let snakePart = { Xpos: Xpos1, Ypos: Ypos1 }
      snake1.push(snakePart)
    }

    // snake2 initialization (starts on right side)
    let snake2 = []
    let Xpos2 = (width / 4) * 3
    let Ypos2 = height / 2
    let snakeHead2 = { Xpos: Xpos2, Ypos: Ypos2 }
    snake2.push(snakeHead2)
    for (let i = 1; i < startSnakeSize; i++) {
      Xpos2 += blockWidth
      let snakePart = { Xpos: Xpos2, Ypos: Ypos2 }
      snake2.push(snakePart)
    }

    // apple1 position initialization
    let apple1Xpos =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth
    let apple1Ypos =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight
    while (this.isPositionOnSnakes(apple1Xpos, apple1Ypos, snake1, snake2)) {
      apple1Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple1Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
    }

    // apple2 position initialization
    let apple2Xpos =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth
    let apple2Ypos =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight
    while (
      this.isPositionOnSnakes(apple2Xpos, apple2Ypos, snake1, snake2) ||
      (apple2Xpos === apple1Xpos && apple2Ypos === apple1Ypos)
    ) {
      apple2Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple2Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
    }

    this.setState({
      width,
      height,
      blockWidth,
      blockHeight,
      startSnakeSize,
      snake1,
      snake2,
      apple1: { Xpos: apple1Xpos, Ypos: apple1Ypos },
      apple2: { Xpos: apple2Xpos, Ypos: apple2Ypos },
    })
  }

  gameLoop() {
    let timeoutId = setTimeout(() => {
      if (!this.state.isGameOver) {
        this.moveSnake(1)
        this.moveSnake(2)
        this.tryToEatApple(1)
        this.tryToEatApple(2)
        this.checkCollisions()
        this.setState({ directionChanged1: false, directionChanged2: false })
      }

      this.gameLoop()
    }, this.state.gameLoopTimeout)

    this.setState({ timeoutId })
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeoutId)
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  resetGame() {
    let width = this.state.width
    let height = this.state.height
    let blockWidth = this.state.blockWidth
    let blockHeight = this.state.blockHeight

    // snake1 reset
    let snake1 = []
    let Xpos1 = width / 4
    let Ypos1 = height / 2
    let snakeHead1 = { Xpos: Xpos1, Ypos: Ypos1 }
    snake1.push(snakeHead1)
    for (let i = 1; i < this.state.startSnakeSize; i++) {
      Xpos1 -= blockWidth
      let snakePart = { Xpos: Xpos1, Ypos: Ypos1 }
      snake1.push(snakePart)
    }

    // snake2 reset
    let snake2 = []
    let Xpos2 = (width / 4) * 3
    let Ypos2 = height / 2
    let snakeHead2 = { Xpos: Xpos2, Ypos: Ypos2 }
    snake2.push(snakeHead2)
    for (let i = 1; i < this.state.startSnakeSize; i++) {
      Xpos2 += blockWidth
      let snakePart = { Xpos: Xpos2, Ypos: Ypos2 }
      snake2.push(snakePart)
    }

    // apple1 position reset
    let apple1Xpos =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth
    let apple1Ypos =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight
    while (this.isPositionOnSnakes(apple1Xpos, apple1Ypos, snake1, snake2)) {
      apple1Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple1Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
    }

    // apple2 position reset
    let apple2Xpos =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth
    let apple2Ypos =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight
    while (
      this.isPositionOnSnakes(apple2Xpos, apple2Ypos, snake1, snake2) ||
      (apple2Xpos === apple1Xpos && apple2Ypos === apple1Ypos)
    ) {
      apple2Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple2Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
    }

    this.setState({
      snake1,
      snake2,
      apple1: { Xpos: apple1Xpos, Ypos: apple1Ypos },
      apple2: { Xpos: apple2Xpos, Ypos: apple2Ypos },
      direction1: 'right',
      direction2: 'left',
      directionChanged1: false,
      directionChanged2: false,
      isGameOver: false,
      gameLoopTimeout: 50,
      snake1Color: this.getRandomColor(),
      snake2Color: this.getRandomColor(),
      apple1Color: this.getRandomColor(),
      apple2Color: this.getRandomColor(),
      score1: 0,
      score2: 0,
      newHighScore: false,
      winner: null,
    })
  }

  getRandomColor() {
    let hexa = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) color += hexa[Math.floor(Math.random() * 16)]
    return color
  }

  moveSnake(player) {
    let snake = player === 1 ? [...this.state.snake1] : [...this.state.snake2]
    let previousPartX = snake[0].Xpos
    let previousPartY = snake[0].Ypos
    let tmpPartX = previousPartX
    let tmpPartY = previousPartY
    this.moveHead(player)
    snake = player === 1 ? [...this.state.snake1] : [...this.state.snake2]
    for (let i = 1; i < snake.length; i++) {
      tmpPartX = snake[i].Xpos
      tmpPartY = snake[i].Ypos
      snake[i].Xpos = previousPartX
      snake[i].Ypos = previousPartY
      previousPartX = tmpPartX
      previousPartY = tmpPartY
    }
    if (player === 1) {
      this.setState({ snake1: snake })
    } else {
      this.setState({ snake2: snake })
    }
  }

  tryToEatApple(player) {
    let snake = player === 1 ? this.state.snake1 : this.state.snake2
    let apple1 = this.state.apple1
    let apple2 = this.state.apple2
    let width = this.state.width
    let height = this.state.height
    let blockWidth = this.state.blockWidth
    let blockHeight = this.state.blockHeight

    // Check if snake ate apple1
    if (snake[0].Xpos === apple1.Xpos && snake[0].Ypos === apple1.Ypos) {
      let newTail = { Xpos: apple1.Xpos, Ypos: apple1.Ypos }
      snake.push(newTail)

      // Respawn apple1
      apple1.Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple1.Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
      while (
        this.isPositionOnSnakes(apple1.Xpos, apple1.Ypos, this.state.snake1, this.state.snake2) ||
        (apple1.Xpos === apple2.Xpos && apple1.Ypos === apple2.Ypos)
      ) {
        apple1.Xpos =
          Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
          blockWidth
        apple1.Ypos =
          Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
          blockHeight
      }

      if (player === 1) {
        this.setState({
          snake1: snake,
          apple1,
          score1: this.state.score1 + 1,
        })
      } else {
        this.setState({
          snake2: snake,
          apple1,
          score2: this.state.score2 + 1,
        })
      }
    }

    // Check if snake ate apple2
    if (snake[0].Xpos === apple2.Xpos && snake[0].Ypos === apple2.Ypos) {
      let newTail = { Xpos: apple2.Xpos, Ypos: apple2.Ypos }
      snake.push(newTail)

      // Respawn apple2
      apple2.Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple2.Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
      while (
        this.isPositionOnSnakes(apple2.Xpos, apple2.Ypos, this.state.snake1, this.state.snake2) ||
        (apple2.Xpos === apple1.Xpos && apple2.Ypos === apple1.Ypos)
      ) {
        apple2.Xpos =
          Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
          blockWidth
        apple2.Ypos =
          Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
          blockHeight
      }

      if (player === 1) {
        this.setState({
          snake1: snake,
          apple2,
          score1: this.state.score1 + 1,
        })
      } else {
        this.setState({
          snake2: snake,
          apple2,
          score2: this.state.score2 + 1,
        })
      }
    }
  }

  checkCollisions() {
    let snake1 = this.state.snake1
    let snake2 = this.state.snake2
    let width = this.state.width
    let height = this.state.height
    let blockWidth = this.state.blockWidth
    let blockHeight = this.state.blockHeight

    let snake1Dead = false
    let snake2Dead = false

    // Check snake1 wall collision
    if (
      snake1[0].Xpos < 0 ||
      snake1[0].Xpos >= width ||
      snake1[0].Ypos < 0 ||
      snake1[0].Ypos >= height
    ) {
      snake1Dead = true
    }

    // Check snake2 wall collision
    if (
      snake2[0].Xpos < 0 ||
      snake2[0].Xpos >= width ||
      snake2[0].Ypos < 0 ||
      snake2[0].Ypos >= height
    ) {
      snake2Dead = true
    }

    // Check snake1 self collision
    for (let i = 1; i < snake1.length; i++) {
      if (snake1[0].Xpos === snake1[i].Xpos && snake1[0].Ypos === snake1[i].Ypos) {
        snake1Dead = true
      }
    }

    // Check snake2 self collision
    for (let i = 1; i < snake2.length; i++) {
      if (snake2[0].Xpos === snake2[i].Xpos && snake2[0].Ypos === snake2[i].Ypos) {
        snake2Dead = true
      }
    }

    // Check snake1 hitting snake2's body
    for (let i = 0; i < snake2.length; i++) {
      if (snake1[0].Xpos === snake2[i].Xpos && snake1[0].Ypos === snake2[i].Ypos) {
        snake1Dead = true
      }
    }

    // Check snake2 hitting snake1's body
    for (let i = 0; i < snake1.length; i++) {
      if (snake2[0].Xpos === snake1[i].Xpos && snake2[0].Ypos === snake1[i].Ypos) {
        snake2Dead = true
      }
    }

    if (snake1Dead || snake2Dead) {
      let winner = null
      if (snake1Dead && !snake2Dead) {
        winner = 2
      } else if (snake2Dead && !snake1Dead) {
        winner = 1
      } else {
        winner = 0 // Both died
      }
      this.setState({ isGameOver: true, winner })
    }
  }

  isPositionOnSnakes(xpos, ypos, snake1, snake2) {
    for (let i = 0; i < snake1.length; i++) {
      if (xpos === snake1[i].Xpos && ypos === snake1[i].Ypos) return true
    }
    for (let i = 0; i < snake2.length; i++) {
      if (xpos === snake2[i].Xpos && ypos === snake2[i].Ypos) return true
    }
    return false
  }

  moveHead(player) {
    let direction = player === 1 ? this.state.direction1 : this.state.direction2
    switch (direction) {
      case 'left':
        this.moveHeadLeft(player)
        break
      case 'up':
        this.moveHeadUp(player)
        break
      case 'right':
        this.moveHeadRight(player)
        break
      default:
        this.moveHeadDown(player)
    }
  }

  moveHeadLeft(player) {
    let width = this.state.width
    let blockWidth = this.state.blockWidth
    let snake = player === 1 ? [...this.state.snake1] : [...this.state.snake2]
    snake[0].Xpos = snake[0].Xpos - blockWidth
    if (player === 1) {
      this.setState({ snake1: snake })
    } else {
      this.setState({ snake2: snake })
    }
  }

  moveHeadUp(player) {
    let height = this.state.height
    let blockHeight = this.state.blockHeight
    let snake = player === 1 ? [...this.state.snake1] : [...this.state.snake2]
    snake[0].Ypos = snake[0].Ypos - blockHeight
    if (player === 1) {
      this.setState({ snake1: snake })
    } else {
      this.setState({ snake2: snake })
    }
  }

  moveHeadRight(player) {
    let width = this.state.width
    let blockWidth = this.state.blockWidth
    let snake = player === 1 ? [...this.state.snake1] : [...this.state.snake2]
    snake[0].Xpos = snake[0].Xpos + blockWidth
    if (player === 1) {
      this.setState({ snake1: snake })
    } else {
      this.setState({ snake2: snake })
    }
  }

  moveHeadDown(player) {
    let height = this.state.height
    let blockHeight = this.state.blockHeight
    let snake = player === 1 ? [...this.state.snake1] : [...this.state.snake2]
    snake[0].Ypos = snake[0].Ypos + blockHeight
    if (player === 1) {
      this.setState({ snake1: snake })
    } else {
      this.setState({ snake2: snake })
    }
  }

  handleKeyDown(event) {
    // if spacebar is pressed to run a new game
    if (this.state.isGameOver && event.keyCode === 32) {
      this.resetGame()
      return
    }

    // Player 1 controls (WASD)
    if (!this.state.directionChanged1) {
      switch (event.keyCode) {
        case 65: // A
          this.goLeft(1)
          this.setState({ directionChanged1: true })
          break
        case 87: // W
          this.goUp(1)
          this.setState({ directionChanged1: true })
          break
        case 68: // D
          this.goRight(1)
          this.setState({ directionChanged1: true })
          break
        case 83: // S
          this.goDown(1)
          this.setState({ directionChanged1: true })
          break
        default:
      }
    }

    // Player 2 controls (Arrow keys)
    if (!this.state.directionChanged2) {
      switch (event.keyCode) {
        case 37: // Left arrow
          this.goLeft(2)
          this.setState({ directionChanged2: true })
          break
        case 38: // Up arrow
          this.goUp(2)
          this.setState({ directionChanged2: true })
          break
        case 39: // Right arrow
          this.goRight(2)
          this.setState({ directionChanged2: true })
          break
        case 40: // Down arrow
          this.goDown(2)
          this.setState({ directionChanged2: true })
          break
        default:
      }
    }
  }

  goLeft(player) {
    let currentDirection = player === 1 ? this.state.direction1 : this.state.direction2
    let newDirection = currentDirection === 'right' ? 'right' : 'left'
    if (player === 1) {
      this.setState({ direction1: newDirection })
    } else {
      this.setState({ direction2: newDirection })
    }
  }

  goUp(player) {
    let currentDirection = player === 1 ? this.state.direction1 : this.state.direction2
    let newDirection = currentDirection === 'down' ? 'down' : 'up'
    if (player === 1) {
      this.setState({ direction1: newDirection })
    } else {
      this.setState({ direction2: newDirection })
    }
  }

  goRight(player) {
    let currentDirection = player === 1 ? this.state.direction1 : this.state.direction2
    let newDirection = currentDirection === 'left' ? 'left' : 'right'
    if (player === 1) {
      this.setState({ direction1: newDirection })
    } else {
      this.setState({ direction2: newDirection })
    }
  }

  goDown(player) {
    let currentDirection = player === 1 ? this.state.direction1 : this.state.direction2
    let newDirection = currentDirection === 'up' ? 'up' : 'down'
    if (player === 1) {
      this.setState({ direction1: newDirection })
    } else {
      this.setState({ direction2: newDirection })
    }
  }

  render() {
    // Game over
    if (this.state.isGameOver) {
      return (
        <GameOver
          width={this.state.width}
          height={this.state.height}
          highScore={this.state.highScore}
          newHighScore={this.state.newHighScore}
          score={this.state.score1 + this.state.score2}
          winner={this.state.winner}
          score1={this.state.score1}
          score2={this.state.score2}
        />
      )
    }

    return (
      <div
        id='GameBoard'
        style={{
          width: this.state.width,
          height: this.state.height,
          borderWidth: this.state.width / 50,
        }}>
        {this.state.snake1.map((snakePart, index) => {
          return (
            <div
              key={`snake1-${index}`}
              className='Block'
              style={{
                width: this.state.blockWidth,
                height: this.state.blockHeight,
                left: snakePart.Xpos,
                top: snakePart.Ypos,
                background: this.state.snake1Color,
              }}
            />
          )
        })}
        {this.state.snake2.map((snakePart, index) => {
          return (
            <div
              key={`snake2-${index}`}
              className='Block'
              style={{
                width: this.state.blockWidth,
                height: this.state.blockHeight,
                left: snakePart.Xpos,
                top: snakePart.Ypos,
                background: this.state.snake2Color,
              }}
            />
          )
        })}
        <div
          className='Block'
          style={{
            width: this.state.blockWidth,
            height: this.state.blockHeight,
            left: this.state.apple1.Xpos,
            top: this.state.apple1.Ypos,
            background: this.state.apple1Color,
          }}
        />
        <div
          className='Block'
          style={{
            width: this.state.blockWidth,
            height: this.state.blockHeight,
            left: this.state.apple2.Xpos,
            top: this.state.apple2.Ypos,
            background: this.state.apple2Color,
          }}
        />
        <div id='Score' style={{ fontSize: this.state.width / 20 }}>
          P1: {this.state.score1}&ensp;&ensp;&ensp;&ensp;P2: {this.state.score2}
        </div>
      </div>
    )
  }
}

export default SnakeGame