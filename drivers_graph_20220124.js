// Draw a chart of Formula One drivers, showing their championship position each year
//
// Greg Turk, Jan 2022
//
// To Do
// - fix show more years bug, key "]"
// - add years (Is 28 the maximum number of ranked drivers?)
// - figure out official initials for each driver
//
// Use team that driver was on the longest for curve colors (most recent for ties)

let table;  // table of drivers and their yearly ranking
let nrows;
let ncols;

let year_min = 1997;     // first year in table
let year_max = 2021;     // end year in table
let num_years;

let years_to_show = 16;  // how many years to show
let start_year = 2000;   // starting year to show

// number of initial columns that we are not using for the per-year ranks
let column_shift = 3 + start_year - year_min;

let ribbon_width = 8;
let ribbon_thin = 2;
let side_pad = 55;
let top_pad = 30;
let bot_pad = 43;

let num_slots = 28;  // maximum number of ranked drivers in a year
let row_space;
let col_space;
let last_driver = 0;
let drivers_pinned = [];

let team_colors = {
  "mercedes": [60, 245, 200],       // tyrell, BAR, honda, brawn
  "redbull": [75, 75, 255],         // stewart, jaguar
  "ferrari": [250, 0, 0],
  "mclaren": [230, 125, 50],
  "renault": [250, 190, 6],         // toleman, benetton, lotus, alpine
  "tororosso": [40, 40, 200],       // minardi, alpha tauri
  "forceindia": [250, 150, 200],    // jordan, midland, spyker, racing point, aston martin
  "sauber": [190, 0, 0],            // alfa romeo
  "williams": [30, 150, 255],
  "haas": [120, 120, 120],
  "marussia": [240, 140, 110],      // virgin, manor
  "caterham": [65, 135, 60],
  "hrt": [210, 170, 75],
  "toyota": [220, 20, 45],
  "superaguri": [215, 0, 15],
  "ligier": [50, 160, 220],
  "prost": [60, 105, 255],
  "arrows": [250, 150, 90],
  "minardi": [235, 215, 90],
};

function preload() {
  // table is comma separated value "csv"
  // and has a header specifying the columns labels

  table = loadTable('assets/drivers_champ_years.csv', 'csv', 'header');
  
  //the file can be remote
  //table = loadTable("http://p5js.org/reference/assets/mammals.csv",
  //                  "csv", "header");
  
}

function setup() {
  
  createCanvas (1420, 760);
  
  //count the columns
  
  nrows = table.getRowCount();
  ncols = table.getColumnCount();
  //num_years = ncols - column_shift;
  num_years = year_max - year_min + 1;

  print(nrows + ' total rows in table');
  print(ncols + ' total columns in table');

  print(table.getColumn('Name'));
  //["Goat", "Leopard", "Zebra"]

  //cycle through the table, printing values
  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < ncols; c++) {
      //print(table.getString(r, c));
    }
  }
    
  // draw the diagran
  draw_diagram (-1);
}

// we only draw when something changes, so nothing here
function draw() {
}

function year_shift_down (num) {
  start_year -= num;
  if (start_year < year_min) {
    start_year = year_min;
  }
  column_shift = 3 + start_year - year_min;
}

function year_shift_up (num) {
  start_year += num;
  if (start_year > year_max - years_to_show + 1) {
    start_year = year_max - years_to_show + 1;
  }
  column_shift = 3 + start_year - year_min;
}

function find_driver_row (year, index) {
  for (let i = 0; i < nrows; i++) {
    let value = table.getString (i, year + column_shift);
    if (value == index) {
      return (i);
    }
  }
  return (-1);
}

function draw_ranks() {
  textSize (16);
  noStroke();
  
  let vshift = 36;
  
  for (let rank = 0; rank < num_slots; rank++) {
    let pos = get_position (0, rank);
    let xoff = 0.5 * textWidth (rank+1) + 30;
    text (rank+1, pos[0] - xoff, pos[1] + vshift);
    text (rank+1, width - xoff - 20, pos[1] + vshift);
  }
}

function draw_years() {
  textSize (16);
  fill (0, 0, 0);
  stroke (0, 0, 0);
  
  for (let offset = 0; offset < years_to_show; offset++) {
    let year = start_year + offset;
    let pos = get_position (offset, 0);
    text (year, pos[0]-5, pos[1]);
  }
}

function draw_year_arrows() {
  
//  fill (0, 0, 0);
//  rect (15, 15, 20, 20);
//  rect (width - 60, 15, 20, 20);
  
  let x = 15;
  let y = 25;
  let w = 20;
  let d = 7;
  
  stroke (0, 0, 0);
  strokeWeight (2);
  
  // maybe draw left arrow
  if (start_year > year_min) {
    line (x, y, x + w, y);
    line (x, y, x + d, y + d);
    line (x, y, x + d, y - d);
  }
  
  x = width - 60;
  
  // maybe draw right arrow
  if (start_year + years_to_show - 1 < year_max) {
    line (x, y, x + w, y);
    line (x + w, y, x + w - d, y + d);
    line (x + w, y, x + w - d, y - d);
  }
  
  strokeWeight (1);
}

function mousePressed() {
  
  let draw_the_diagramm = 0;
  
  // see if click is inside year arrows
  if (mouseY > 15 && mouseY < 35) {
    if (mouseX > 15 && mouseX < 35) {
      year_shift_down (1);
      draw_the_diagram = 1;
    }
    if (mouseX > width - 60 && mouseX < width - 60 + 20) {
      year_shift_up (1);
      draw_the_diagram = 1;
    }
  }
  
  // see whether we are in a driver's box
  let driver = get_driver_box();
  
  // exit if we are not in a driver's box and if we didn't shift years
  if (driver == -1) {
    if (draw_the_diagram == 1) {
      draw_diagram (drivers_pinned);
    }
    return;
  }
  
  // if this driver is in the pinned list, remove it
  if (drivers_pinned.includes (driver)) {
    const index = drivers_pinned.indexOf(driver);
    if (index > -1) {
      drivers_pinned.splice(index, 1);
    }
  }
  else {  // otherwise add it
    drivers_pinned.push (driver);
  }
  
  // draw the updated diagram
  draw_diagram (drivers_pinned);
}

// draw the diagram of drivers, if the mouse moves
function mouseMoved() {

  let driver_list = [...drivers_pinned];
  
  // see if the cursor is inside a driver's box, and if so,
  // highlight this driver
  let driver = get_driver_box();
  if (driver != -1 && !driver_list.includes (driver)) {
    driver_list.push (driver);
  }
  
  // draw the drivers diagram, highlighting those in a list
  draw_diagram (driver_list);

}

// handle keyboard commands
function keyPressed() {
  if (key == ',') {
    year_shift_down (1);
  }
  if (key == '.') {
    year_shift_up (1);
  }
  if (key == 'c') {
    drivers_pinned = [];
  }
  if (key == '[' && years_to_show > 8) {
    years_to_show -= 1;
  }
  if (key == ']' && years_to_show < num_years) {
    years_to_show += 1;
    if (start_year + years_to_show - 1 > year_max) {
      start_year -= 1;
    }
  }
  
  draw_diagram (drivers_pinned);
}

// return the ID of a driver if the mouse is in one of the driver's boxes
function get_driver_box() {
  
  let x0 = side_pad;
  let y0 = top_pad;
  let x = (mouseX - x0 + 5) / row_space;
  let y = (mouseY - y0 + 5) / col_space;
  
  // clear out empty rectangle
  //stroke (0, 0, 0);
  //fill (255, 255, 255);
  //rect (0, height - 80, 180, 100);
  //noFill();
  
  let driver = -1;
  let year = Math.floor(x);
  let rank = Math.floor(y);
  
  // find left side of box
  let xx = year * row_space + x0 - 5;
  
  // show cursor positions (relative to the rows and columns)
  //text (x, 10, height - 65);
  //text (y, 10, height - 45);
  //text (mouseX - xx, 10, height - 25);
  
  // see if we're in a box
//  if (x - Math.floor(x) < 0.37 && y - Math.floor(y) < 0.7) {
  if (mouseX - xx < 35 && y - Math.floor(y) < 0.7) {
    // if we are, show the integer column and row number
    //text (year, 10, height - 25);
    //text (rank, 30, height - 25);
    for (d = 0; d < nrows; d++) {
      let r = table.getString (d, year + column_shift);
      if (r == rank) {
        driver = d;
//        text (driver, 10, height - 7);
      }
    }
  }

  return (driver);
}

// show the nanes of the drivers in a list
function show_driver_names(driver_list) {
  
  textSize (20);
 
  let xoff = 70;
  let yoff = 5;
  
  for (i = 0; i < driver_list.length; i++) {
    
    // draw the name
    fill(0, 0, 0);
    stroke (0, 0, 0);
    let driver = driver_list[i];
    let name = table.getString (driver, 0);
    text (name, xoff, height - yoff);
    
    // draw box showing driver's ribbon color
    let col = get_driver_color(driver);
    noStroke();
    fill (col[0], col[1], col[2]);
    rect (xoff - 25, height - yoff - 17, 20, 20);
    
    // shift name position downward
    xoff += textWidth (name) + 45;
    
    // draw at most 6 names
    if (xoff > 1200) { return; }
  }
}

function get_position (i,j) {
  
  let x0 = side_pad;
  let x1 = width - side_pad;
  let y0 = top_pad;
  let y1 = height - bot_pad;
  let dx = (x1 - x0 - side_pad) / (years_to_show - 1);
  let dy = (y1 - y0) / (num_slots);
  
  row_space = dx;
  col_space = dy;
  
  let x = x0 + i * dx;
  let y = y0 + j * dy;
  
  return [x, y];
}

function get_driver_color(driver) {  
  let team = table.getString (driver, 2);
  let col = team_colors[team];
  if (col == undefined) {
    col = [0, 0, 0];
  }
  return (col);
}

// mute a given color, de-saturating it
function mute_color (col) {
  let fract = 0.3;
  color_mute = [0, 0, 0];
  color_mute[0] = fract * 255 + (1-fract) * col[0];
  color_mute[1] = fract * 255 + (1-fract) * col[1];
  color_mute[2] = fract * 255 + (1-fract) * col[2];
  return (color_mute);
}

// connect a list of positions with lines or curves
function draw_driver_ribbons (driver, mute) {

  // make a list of where all the driver boxes will be
  let position_list = [];
  for (let year = 0; year < years_to_show; year++) {
    let rank = table.getString (driver, year + column_shift);
    if (rank != "") {
      let pos = get_position (year, rank);
      position_list.push (pos[0]);
      position_list.push (pos[1]);
    }
  }

  // bail if we don't have at least two points in the list
  if (position_list.length <= 2) {
    return;
  }
  
  // get the driver's team and color
  let col = get_driver_color (driver);
  if (mute) {
    col = mute_color (col);
  }
  let r = col[0];
  let g = col[1];
  let b = col[2];
  
  //print (r + " " + g + " " + b);

  //print (list);
  
  let dx = 15;
  let dy = 5;

  // draw Bezier curves
  for (i = 0; i < position_list.length - 2; i += 2) {
    let x0 = position_list[i] + dx;
    let y0 = position_list[i+1] + dy;
    let x1 = position_list[i+2] + dx;
    let y1 = position_list[i+3] + dy;
    let xoff = (x1 - x0) * 50 / row_space;
    let delta_y = abs(y1 - y0) / col_space;
    delta_y = Math.min (delta_y, 8);
    xoff *= pow (1.07, delta_y);
    strokeWeight (ribbon_width);
    stroke (r, g, b);
    if (x1 - x0 > row_space + 2) {
      strokeWeight (ribbon_thin);
      xoff *= 0.5;
      //stroke (230, 230, 230);
    }
    bezier (x0, y0, x0 + xoff, y0, x1 - xoff, y1, x1, y1);
    //line (x0, y0, x1, y1);
  }

  strokeWeight (1);

}

// draw boxes for a driver across all years
function draw_driver_boxes (driver, mute) {

  for (let year = 0; year < years_to_show; year++) {
    
    let rank = table.getString (driver, year + column_shift);
    if (rank == "") {
      continue;
    }

    let pos = get_position (year, rank);
    let x = pos[0];
    let y = pos[1];
    
    let abbr = table.getString (driver, 1);
    let col = get_driver_color (driver);
    if (mute) {
      col = mute_color (col);
    }
    
    fill (255, 255, 255);
    stroke (col[0], col[1], col[2]);
    strokeWeight (3);
    let corner_radius = 3;
    rect (x-3, y-3, 33, 17, corner_radius);
    
    fill (0, 0, 0);
    stroke (0, 0, 0);
    strokeWeight (1);
    let xoff = (27 - textWidth (abbr)) * 0.5;  // use to center the initials in box
    text (abbr, x+xoff, y+10);
  }
}

// draw the full drivers diagram, maybe highlighting some drivers in the provided list
function draw_diagram (driver_list) {
  
  background (255, 255, 255);
  
  fill (0, 0, 0);
  stroke (0, 0, 0);
  
  draw_years();
  draw_ranks();
  draw_year_arrows();
  show_driver_names (driver_list);
  
  noFill();
  textSize (12);
  
  // draw all the driver's ribbons in muted colors
  //for (let driver = 0; driver < nrows; driver++) {
  //  draw_driver_ribbons (driver, true);
  //}
  
  // draw the listed driver's ribbons
  for (let i = 0; i < driver_list.length; i++) {
    let d = driver_list[i];
    draw_driver_ribbons (d, false);
  }

  // draw the boxes with the driver's abbreviated name
  for (let driver = 0; driver < nrows; driver++) {
    draw_driver_boxes (driver, true);
  }
  
  // draw the listed driver's box
  for (let i = 0; i < driver_list.length; i++) {
    let d = driver_list[i];
    draw_driver_boxes (d, false);
  }
}
