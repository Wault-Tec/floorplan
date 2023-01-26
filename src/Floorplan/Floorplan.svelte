<script>
import { onMount } from 'svelte';
import { config } from './';
import Loader from '../Loader/Loader.svelte';

const initialWidth = config.defaultSize.width;
const initialHeight = config.defaultSize.height;
const initialTop = `${config.defaultPosition.top}px`;
const initialLeft = `${config.defaultPosition.left}px`;

let activeFloor = 'GF';

const isRetina = window.devicePixelRatio > 1 ? true : false;

let loadEnded = false;
let canvas;
let zoom = config.defaultZoom || 1;
let ctx;

const floorOptions = {
    floors: config.floors
};

//Загрузка изображений
const loadImages = (layer) => {
    return new Promise ((resolve, reject) => {
        let src;
        let srcArray = [];

        if(typeof layer.src !== 'object') {
            src = fixSrc(layer.src)
        }

        for(let key in floorOptions[layer.name]) {
            let optionValue = floorOptions[layer.name][key]
            if (optionValue === true) {
                if (
                    layer.options &&
                    layer.options.length <= 2
                ) {
                    src = fixSrc(layer.src[key])
                } else if (
                    layer.options &&
                    layer.options.length > 2
                ) {
                    srcArray.push(key)
                } 
            }
        }

        if(srcArray.length > 0) {
            srcArray.push(activeFloor)
            if(!isRetina) {
                src = layer.src[srcArray]
            } else if (
                isRetina && 
                typeof layer.src[srcArray] !== 'object'
            ) {
                src = fixSrc(layer.src[srcArray])
            }
        }

        let img = new Image();
        const dx = Math.floor(layer.position.left);
        const dy = Math.floor(layer.position.top);
        const dWidth = Math.floor(layer.size.width);
        const dHeight = Math.floor(layer.size.height);

        img.onload = () => {
            let opacity = layer.opacity

            if (
                activeFloor == 'FF' && 
                layer.name !== 'plot' && 
                layer.name == 'background'
            ) 
            {
                opacity = config.opacityUnderFF
            }
            
            //Конфиг для отрисовки канвас
            const ctxInfo = {
                img,
                dx,
                dy, 
                dWidth, 
                dHeight,
                opacity,
            }

            resolve(ctxInfo)
        }

        if(src) {
            img.src = src;
        }
    })
}

//Отрисовка изображений
const drawImages = () => {
    loadEnded = false
    ctx = canvas.getContext('2d');
    ctx.scale(zoom, zoom)

    //Массив промисов с загрузкой слоев
    let promises = config.layers.map(layer => loadImages(layer, ctx))

    //Последовательная отрисовка изображений после успешного выполнения промисов
    Promise.all(promises)
        .then((values) => {
            values.forEach((value) => {
                ctx.drawImage(
                    value.img, 
                    value.dx,
                    value.dy, 
                    value.dWidth, 
                    value.dHeight
                );
                ctx.globalAlpha = value.opacity
            })
            loadEnded = true
            // setTimeout(() => loadEnded = true, 500)
        })
}

//Форматирует пути к изображениям с учетом retina
const fixSrc = (string) => {
    let fixSrc;
    if(!isRetina) {
        return string
    } else {
        if(string.includes('.jpg')) {
            fixSrc = `${string.slice(0, -4)}@2.jpg`
        } else {
            fixSrc = `${string.slice(0, -4)}@2.png`
        }
    }
    return fixSrc
}

onMount(() => {

    //Формирование floorOptions
    let optionsValues;
    config.layers.forEach((layer) => {
        optionsValues = {}
        if(layer.options && !layer.defaultOptions) {
            layer.options.forEach((option, key) => {
                if(key === 0) {
                    optionsValues[option] = true
                } else {
                    optionsValues[option] = false
                }
            })
            floorOptions[layer.name] = optionsValues
        } else if(layer.defaultOptions) {
            optionsValues = {}
            layer.options.forEach((option) => {
                if(layer.defaultOptions.includes(option)) {
                    optionsValues[option] = true
                } else {
                    optionsValues[option] = false
                }
            })
            floorOptions[layer.name] = optionsValues
        }
    })

    drawImages()
})

//Устанавливает выбранной опции значение true, а опции-дубликату значение false, и перерисовывает изображения
const handleClick = (layer, option) => {
    let dublicate;

    if(layer.dublicateOptions) {
            layer.dublicateOptions.map((array) => {
                if(array.includes(option)) {
                    const index = array.findIndex((item) => item == option)
                    if(index == 0) {
                        dublicate = array[1]
                    } else {
                        dublicate = array[0]
                    }
                }
        })
    }

    for(let key in floorOptions[layer.name]) {
        if(dublicate && floorOptions[layer.name][dublicate] == true) {
            floorOptions[layer.name][dublicate] = false
        }
    }

    if(floorOptions[layer.name][option] == true) return

    floorOptions[layer.name][option] = true;

    drawImages()
}

const changeFloor = (floor) => {
    activeFloor = floor
}

//Перерисовывает изображения при смене этажа
const updateCanvas = (node, param) => {

    return {
        update(param) {
            drawImages()
        }
    }
}

let scale = 1

const handleZoomIn = () =>  scale += 0.1;

const handleZoomOut = () =>  scale -= 0.1;
   
</script>

<div class='wrapper'>
    {#if !loadEnded}
        <Loader />
    {/if}
    <canvas 
        bind:this={canvas} 
        use:updateCanvas={activeFloor}
        width={initialWidth} 
        height={initialHeight} 
        class:visible={loadEnded} 
        style="
            top: {initialTop};
            left: {initialLeft};
            transform: {`scale(${scale})`};
        "
    />
    <div class="btns" >
        {#if config.floors}
            <div class="btns__row">
                {#each config.floors as floor}
                    <button 
                        class="btns__btn" 
                        class:active={floor == activeFloor} 
                        on:click={() => changeFloor(floor)}
                    >
                        {floor}
                    </button>
                {/each}
            </div>
        {/if}
        {#each config.layers as layer}
            {#if layer.options}
                <div class="btns__row">
                    {#each layer.options as option}
                        <button 
                            class="btns__btn" 
                            class:active={
                                floorOptions[layer.name] && 
                                floorOptions[layer.name][option] == true
                            }
                            on:click={() => handleClick(layer, option)} 
                        >
                            {option}
                        </button>
                    {/each}
                </div>
            {/if}
        {/each}
        <div class="btns__row">
            <button class="btns__btn" on:click={() => handleZoomIn()}>
                Zoom+
            </button>
            <button class="btns__btn" on:click={() => handleZoomOut()}>
                Zoom-
            </button>
        </div>
    </div>
</div>

<style lang="scss">

    .wrapper {
        position: relative;
        width: 100wh;
        height: 100vh;
    }

    canvas { 
        position: absolute;
        background: #eee; 
        opacity: 0;
        transition: .3s;
    }

    .btns {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
        position: absolute;
        top: 50%;
        left: 100px;

        &__row {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        &__btn {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 90px;
            height: 40px;
            background-color: #eee;
            border-radius: 5px;
            transition: .3s;
        }
    }

    .active {
        border: 1px solid black;
        background-color: #eef;
    }

    .visible {
        opacity: 1;
    }
</style>