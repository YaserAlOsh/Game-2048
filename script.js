import Grid from "./Grid.js";
import Tile from "./Tile.js"
let playing = true
let lost = false
const gameBoard = document.getElementById("game-board");
const lostMenu = document.getElementById("game-over")
const scoreText = document.getElementById("score")
const bestScoreText = document.getElementById("high-score")

let score = 0
let bestScore = 0
const grid = new Grid(gameBoard);




let startTouch = false
let prevX = 0
let prevY = 0
const yMinSwipeTouchDist = 30
const xMinSwipeTouchDist = 30
let handlingEvent = false

updateHighScore()
setupInput()
startGame()

function startGame(){
    grid.addTileToRandomCell(new Tile(gameBoard,getRandomTileValue()))
    grid.addTileToRandomCell(new Tile(gameBoard,getRandomTileValue()))
    playing = true
    score = 0
    updateScore();
}

function setupInput(){
    handlingEvent = false
    window.addEventListener("keydown",e=> {
        e.preventDefault();
        handleInput(e.key)
    }, {once: true})
    
}
gameBoard.addEventListener("touchstart",e => {
    if(lost || !playing)
        return;
    e.preventDefault()
    startTouch = true;
    ;[...e.changedTouches].forEach(touch =>{
        prevX = touch.pageX
        prevY = touch.pageY
    })
})
gameBoard.addEventListener("touchmove", e=> {
    if(lost || !playing || handlingEvent)
        return;
    if(!startTouch)
        return
    
    let touch = e.changedTouches[0]
    if(touch === undefined)
        return
    //console.log(touch)
    
},{passive:true});
gameBoard.addEventListener("touchend", e=> {
    if(lost || !playing)
        return;
    if(e.changedTouches.length === 0)
        startTouch = false;
    let touch = e.changedTouches[0]
    if(touch === undefined)
        return
    if(Math.abs(touch.pageY - prevY) >= yMinSwipeTouchDist){
        if(touch.pageY < prevY)
            handleInput("ArrowUp");
        else 
           handleInput("ArrowDown");
    }else if(Math.abs(touch.pageX - prevX) >= xMinSwipeTouchDist){
        if(touch.pageX > prevX)
            handleInput("ArrowRight");
        else 
            handleInput("ArrowLeft");
    }
},{passive:true})


async function handleInput(key){
    handlingEvent = true
    if(!playing){
        if(lost){
            if(key === "Enter"){
                restartGame()
			}
        }
        handlingEvent = false
        return
    }
    let res = {canMove:false}
    switch (key){
        case "ArrowUp":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            
            await moveUp(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        case "ArrowDown":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            //let res = {canMove:false}
            await moveDown(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        case "ArrowLeft":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            //let res = {canMove:false}
            await moveLeft(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        case "ArrowRight":
            /*if(!canMove()){
                setupInput()
                return
            }*/
            //let res = {canMove:false}
            await moveRight(res)
            if(!res.canMove)
            {
                setupInput()
                return
            }
            break
        default:
            await setupInput()
            return
    }
    //handlingEvent = false
    grid.cells.forEach(cell => {score += cell.mergeTiles()})
    updateScore(score);
	
    const newTile = new Tile(gameBoard,getRandomTileValue())

    grid.addTileToRandomCell(newTile)
    //grid.tileAdded()
    //console.log(grid.tileCount)
    if(!canMoveAtAll()){
        console.log("Cannot move")
        newTile.waitForTransition(true).then(() => {
            console.log("show lost ui")
            setTimeout(showLoseUI(),3000);
        })
        return
    }
    setupInput()
}
function moveUp(res) {
    return slideTiles(grid.cellsByColumn,res)
}
function moveDown(res) {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()),res)
}
function moveLeft(res) {
    return slideTiles(grid.cellsByRow,res)
}
function moveRight(res) {
    return slideTiles(grid.cellsByRow.map(column => [...column].reverse()),res)
}
function slideTiles(cells, res) {
    return Promise.all(
        //Loop through each column
        cells.flatMap(group => {
            const promises = []
            //For each item, check if it can move.
            for(let i=1; i < group.length; i++){
                const cell = group[i]
                if(cell.tile == null) continue
                let lastValidCell
                for(let j=i-1; j>=0; j--){
                    const moveToCell = group[j]
                    //Cannot move up. break
                    if(!moveToCell.canAccept(cell.tile)) break
                    lastValidCell = moveToCell
                }
                //Is there a valid cell?
                if(lastValidCell != null){
                    if(!res.canMove)
                        res.canMove = true;
                    promises.push(cell.tile.waitForTransition())
                    //Should it be merged? (If tile is not null, it means we found a cell of the same value)
                    if(lastValidCell.tile != null){
                        lastValidCell.mergeTile = cell.tile
                        grid.tilesMerged(cell.tile, lastValidCell.tile)
                    }else {
                        lastValidCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        })
    )
}

function showLoseUI(){
    //lostMenu.style.setProperty("display","block");
    lostMenu.classList.add("active");
	let endScoreText = lostMenu.getElementsByClassName("score")[0]
	endScoreText.textContent = score
    if(score > bestScore){
        bestScore = score
        localStorage.setItem("best-score-2048",bestScore);
        
        triggerElement(lostMenu.getElementsByClassName("high-score-alert")[0])
        updateHighScore()
    }
	if(score < 100){
		lostMenu.getElementsByClassName("low-points")[0].classList.add("active");
		
		if(lostMenu.getElementsByClassName("good-points")[0].classList.contains("active"))
			lostMenu.getElementsByClassName("good-points")[0].classList.remove("active");
	}else {
		if(lostMenu.getElementsByClassName("low-points")[0].classList.contains("active"))
			lostMenu.getElementsByClassName("low-points")[0].classList.remove("active");
		
		lostMenu.getElementsByClassName("good-points")[0].classList.add("active");
	}
    new Promise(resolve => lostMenu.addEventListener(
       "animationend",
        resolve, {once:true})).then(() => {
            playing = false
            lost = true
            
            window.addEventListener("click",restartGame, {once: true})
			window.addEventListener("keydown",e=> {handleInput(e.key)}, {once: true})
        })
}
function restartGame(){
    if(!lost)
        return
    lostMenu.classList.remove("active");
    lost = false
    grid.emptyGrid()
    startGame()
    setupInput()
}


function canMoveAtAll(){
    if(!grid.isFull()){
        return true
    }
    return  canMove(grid.cellsByColumn) ||
            canMove(grid.cellsByColumn.map(column => [...column].reverse())) ||
            canMove(grid.cellsByRow) ||
            canMove(grid.cellsByRow.map(row => [...row].reverse()))
}
function canMove(cells){
    return cells.some(group => {
        return group.some((cell,index) => {
            if (index === 0) return false
            if(cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}

function updateScore(){
    scoreText.textContent = score
}

function getRandomTileValue(){
	let r = Math.random()
	return r > 0.5 ? 2 : 4;
	//return r > 0.25 ? (r < 0.5 ? 4 : 2) : 1;
}

function updateHighScore(){
    
    if(localStorage.getItem("best-score-2048") !== undefined){
        
        bestScore = localStorage.getItem("best-score-2048")
        console.log(bestScoreText)
        bestScoreText.textContent = bestScore
        /*for(i in bestScoreTexts){
            i.textContent = bestScore
        }*/
    }
}

function triggerElement(element){
    if(element.classList.contains("active"))
        element.classList.remove("active")
    else
        element.classList.add("active")
}