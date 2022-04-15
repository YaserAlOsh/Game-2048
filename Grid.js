const GRID_SIZE = 4
const CELL_SIZE = 15
const CELL_GAP = 2


export default class Grid{
    #cells
    #tileCount

    constructor(gridElement){
        gridElement.style.setProperty("--grid-size",GRID_SIZE);
        gridElement.style.setProperty("--cell-size",`${CELL_SIZE}vmin`);
        gridElement.style.setProperty("--cell-gap",`${CELL_GAP}vmin`);
        // #cells makes it a private field
        this.#cells = createCellElements(gridElement)
        .map((cellElement,index) =>{
            return new Cell(cellElement,
                  index % GRID_SIZE,
                  Math.floor(index/GRID_SIZE));
        });
        this.#tileCount = 0
    }
    get cells() {
        return this.#cells
    }
    get cellsByColumn() {
        return this.#cells.reduce((cellGrid, cell) => {
            cellGrid[cell.x] = cellGrid[cell.x] || [] //this creates the array in the first iteration
            cellGrid[cell.x][cell.y] = cell
            return cellGrid
        },[])
    }
    get cellsByRow() {
        return this.#cells.reduce((cellGrid, cell) => {
            cellGrid[cell.y] = cellGrid[cell.y] || [] //this creates the array in the first iteration
            cellGrid[cell.y][cell.x] = cell
            return cellGrid
        },[])
    }

    get #emptyCells(){
        return this.#cells.filter(cell => cell.tile == null);
    }
    get tileCount(){
        return this.#tileCount
    }
    randomEmptyCell(){
        const randomIndex = Math.floor(Math.random() * this.#emptyCells.length);
        return this.#emptyCells[randomIndex];
    }
    addTileToRandomCell(tile){
        this.randomEmptyCell().tile = tile
        //console.log(this.randomEmptyCell())
        this.#tileCount++
    }
    tileAdded(){
        this.#tileCount++
    }
    isFull(){
        return this.#tileCount === GRID_SIZE * GRID_SIZE
    }
    tilesMerged(oldTile, mergedTile){
        this.#tileCount--
    }
    emptyGrid(){
        this.#cells.forEach(cell => { 
            if(cell.tile != null){ 
                cell.tile.remove()
                cell.tile = null
            }
        })
        this.#tileCount = 0
    }

}

class Cell{
    #cellElement
    #x
    #y
    #tile
    #mergeTile

    constructor(cellElement, x, y){
        this.#cellElement = cellElement;
        this.#x = x;
        this.#y = y;
    }
    get x() {
        return this.#x
    }
    get y(){
        return this.#y
    }
    get tile(){
        return this.#tile;
    }

    set tile(value){
        this.#tile = value;
        if (value == null) return;
        this.#tile.x = this.#x;
        this.#tile.y = this.#y;
    }

    get mergeTile(){
        return this.#mergeTile
    }

    set mergeTile(value){
        this.#mergeTile = value
        if(value == null) return
        this.#tile.merged()
        this.#mergeTile.x = this.#x
        this.#mergeTile.y = this.#y
    }

    canAccept(tile){
        return (this.tile == null ||
            //(cannot merge more than once in the same turn) 
            (this.mergeTile == null && this.tile.value === tile.value))
    }

    mergeTiles(){
        if(this.#tile == null || this.mergeTile == null) return 0
        this.tile.value = this.tile.value + this.mergeTile.value
        this.mergeTile.remove()
        this.mergeTile = null
        return this.tile.value
    }

}

function createCellElements(gridElement){
    const cells = []
    for(let i=0; i<GRID_SIZE*GRID_SIZE;i++){
        const cell = document.createElement("div");
        cell.classList.add("cell"); 
        cells.push(cell);
        gridElement.append(cell);
    }
    return cells;
}
