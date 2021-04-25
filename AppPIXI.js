let visited = [];
let tiles = [];
let table = [];
let size = 3;
let prev_size = 3;
let first;
let clicked = false;
let isInitField = false;

const canvas = document.getElementById('canvas');
const app = new PIXI.Application({
    view: canvas,
    width: 700,
    height: 700
});
app.renderer.backgroundColor = 0xFFFFFF

app.loader.baseUrl = 'sprites';

const tilesNames = ['carrot', 'eggplant', 'onion', 'peach'];
tilesNames.forEach(name => {
    app.loader.add(name, name + '.png')
});

app.loader.load();

/**
 * Generates new tile for given coordinates.
 * @param {number} r 
 * @param {number} c 
 */
function genTile(r, c) {
    const maxN = 4;
    let choice = 1 + Math.floor(Math.random() * Math.floor(maxN));

    while (table[r][c] == choice)
        choice = 1 + Math.floor(Math.random() * Math.floor(maxN));

    table[r][c] = choice;

    const tileName = tilesNames[choice - 1];
    const tile = new PIXI.Sprite.from(app.loader.resources[tileName].texture);

    tile.anchor.x = 0.5;
    tile.anchor.y = 0.5;

    tile.x = 50 + (100 * r);
    tile.y = 50 + (100 * c);

    tile.scale.x = 0.1;
    tile.scale.y = 0.1;

    tile.interactive = true;

    tile.click = function (data) {
        checkTile(r, c);
    };

    app.stage.addChild(tile);

    tiles[r][c] = tile;
}

/**
 * Generates fresh field with specified at html page parameter for size.
 */
function genField() {
    size = parseInt(document.getElementById('field').value);

    if (isInitField) {
        for (let r = 0; r < prev_size; r++) {
            for (let c = 0; c < prev_size; c++) {
                app.stage.removeChild(tiles[r][c]);
            }
        }
        prev_size = size;
    }

    tiles = new Array(size);
    table = new Array(size);
    for (let r = 0; r < size; r++) {
        tiles[r] = new Array(size);
        table[r] = new Array(size);
        for (let c = 0; c < size; c++) {
            genTile(r, c);
        }
    }
    isInitField = true;
}

/**
 * Marks tile based on found adjecent tiles.
 * Invokes calcScore() when found.
 * @param {number} r 
 * @param {number} c 
 */
function checkTile(r, c) {
    if (!clicked) {
        clicked = true;
        first = { r, c };
        tiles[r][c].tint = 0xFFAA00;

        checkNearTile(r, c);

        if (visited.length == 1) {
            tiles[r][c].tint = 0xFF0000;
            setTimeout(
                function () {
                    tiles[r][c].tint = 0xFFFFFF;
                    clicked = false;
                }, 500
            )
        } else {
            calcScore();
            visited.forEach(e => {

                setTimeout(
                    function () {
                        tiles[e.r][e.c].scale.x = 0.05;
                        tiles[e.r][e.c].scale.y = 0.05;
                    }
                    , 400
                );

                setTimeout(
                    function () {
                        app.stage.removeChild(tiles[e.r][e.c]);
                    }, 500
                );

                setTimeout(
                    function () {
                        genTile(e.r, e.c);
                        clicked = false;
                    }, 505
                );
            });
        }
    }
    visited = [];
}

/**
 * Calculates score based on the number of checked tiles.
 */
function calcScore() {
    let prev_score = parseInt(document.getElementById('score').innerText);
    let bonus = 0;
    for (let i = 3, s = 1; i <= visited.length; i++, s++) {
        bonus = s;
    }
    score = prev_score + visited.length + bonus;
    document.getElementById('score').innerText = score;
    document.getElementById('bonus').innerText = `${bonus} for ${visited.length} tiles`;
}

/**
 * Recurssive function to find adjecent tiles.
 * @param {number} r 
 * @param {number} c 
 */
function checkNearTile(r, c) {
    if (visited.find(e => {
        if (e.r == first.r && e.c == first.c)
            return true
        else
            return false
    }))
        tiles[r][c].tint = 0xFFFF00;

    visited.push({ r, c })

    // up
    if (r > 0 && !visited.find(e => {
        if (e.r == r - 1 && e.c == c)
            return true
        else
            return false
    })) {
        if (table[r][c] == table[r - 1][c]) {
            checkNearTile(r - 1, c);
        }
    }
    // left
    if (c > 0 && !visited.find(e => {
        if (e.r == r && e.c == c - 1)
            return true
        else
            return false
    })) {
        if (table[r][c] == table[r][c - 1]) {
            checkNearTile(r, c - 1);
        }
    }
    // down
    if (r < table.length - 1 && !visited.find(e => {
        if (e.r == r + 1 && e.c == c)
            return true
        else
            return false
    })) {
        if (table[r][c] == table[r + 1][c]) {
            checkNearTile(r + 1, c);
        }
    }
    // right
    if (c < table[r].length - 1 && !visited.find(e => {
        if (e.r == r && e.c == c + 1)
            return true
        else
            return false
    })) {
        if (table[r][c] == table[r][c + 1]) {
            checkNearTile(r, c + 1);
        }
    }
}