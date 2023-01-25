export const config = {
    defaultZoom: 1,
    defaultPosition: {
        left: 550,
        top: 0
    },
    defaultSize: {
        width: 800,
        height: 800
    },
    floors: ['GF', 'FF'],
    opacityUnderFF: 0.2, //Прозрачность участка на этаже выше GF 

    //Слои, рендерятся в текущей последовательности
    layers: [ 
        {
            name: 'background',
            position: {
                left: 0,
                top: 0
            },
            size: {
                width: 1000,
                height: 1000
            },
            src: 'images/background.jpg',
            opacity: 1,  
        },
        {
            name: 'plot',
            position: {
                left: 50,
                top: 50
            },
            size: {
                width: 700,
                height: 700
            },
            defaultOptions: ['noPod'],
            options: ['noPod', 'pod'],
            dublicateOptions: [['noPod', 'pod']], //Когда одна из опций true, вторая становится false
            src: {
                'noPod': 'images/plots/plot_no_pod.png', //Пути, в зависимости от выбранных опций
                'pod': 'images/plots/plot_pod.png',
            },
            opacity: 1,
        },
        {
            name: 'floorplan',
            position: {
                left: 81,
                top: -33
            },
            size: {
                width: 700,
                height: 700
            },
            defaultOptions: ['warm', 'standart'],
            options: ['warm', 'cold', 'premium', 'standart'],
            dublicateOptions: [['warm', 'cold'], ['premium', 'standart']], //Когда одна из опций true, вторая становится false
            src: {
            [['warm', 'standart', 'GF']]: 'images/floorplans/warm/standart/gf.png', //Пути, в зависимости от выбранных опций и этажа
            [['cold', 'standart', 'GF']]: 'images/floorplans/cold/standart/gf.png',
            [['warm', 'premium', 'GF']]: 'images/floorplans/warm/premium/gf.png',
            [['cold', 'premium', 'GF']]: 'images/floorplans/cold/premium/gf.png',

            [['warm', 'standart', 'FF']]: 'images/floorplans/warm/standart/ff.png',
            [['cold', 'standart', 'FF']]: 'images/floorplans/cold/standart/ff.png',
            [['warm', 'premium', 'FF']]: 'images/floorplans/warm/premium/ff.png',
            [['cold', 'premium', 'FF']]: 'images/floorplans/cold/premium/ff.png',
            },
            opacity: 1,
        },
    ]
}

