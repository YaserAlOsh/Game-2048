export default class Tile{
    #tileElement
    #tileText
    #x
    #y
    #value

    constructor(tileContainer, value = Math.random() > .5 ? 1 : 2){
        this.#tileElement = document.createElement("div");
        this.#tileText = document.createElement("div");
        this.#tileElement.appendChild(this.#tileText);
        this.#tileElement.classList.add("tile");
        this.#tileText.classList.add("text");
        tileContainer.append(this.#tileElement);
        this.value = value;
    }
    get value() {
        return this.#value
    }
    set value(v){
        this.#value = v
        this.#tileText.textContent = v //.style.setProperty("content", v)
        // How many times this value has been raised by 2
        const power = Math.log2(v)
        const backgroundLightness = Math.max(100 - power * 6,0);
        this.#tileElement.style.setProperty(
            "--background-lightness",
            `${backgroundLightness}%`)
        this.#tileElement.style.setProperty(
            "--text-lightness",
            `${backgroundLightness <= 50 ? 90 : 10}%`)

    }

    set x(value){
        this.#x = value
        this.#tileElement.style.setProperty("--x",value)
    }

    set y(value){
        this.#y = value
        this.#tileElement.style.setProperty("--y",value)
    }
    get tileText(){
        return this.#tileText
    }
    removeAnimation(){
        this.tileText.classList.remove("anim");
    }
    merged(){
        this.#tileText.classList.add("anim");
        /*setTimeout(this.removeAnimation,
            /*function(){
            this.#tileText.classList.remove("anim");
        },
        1000);*/
        this.waitForTextTransition(true).then(() =>{
            this.tileText.classList.remove("anim");
        })
        
        //this.#tileText.style.getProperty("animation-duration"));
    }
    
    remove() {
        this.#tileElement.remove()
    }
    waitForTransition(animation = false){
        return new Promise(resolve =>{
            this.#tileElement.addEventListener(
                animation? "animationend" : "transitionend",
                resolve, {once:true})
        })
    }
    waitForTextTransition(animation = false){
        return new Promise(resolve =>{
            this.#tileText.addEventListener(
                animation? "animationend" : "transitionend",
                resolve, {once:true})
        })
    }
}