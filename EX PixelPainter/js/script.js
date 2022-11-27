
console.log('Begin');

const fied = document.getElementsByClassName('field')[0];
const btns = document.getElementsByClassName('btn');

const cx = 20;
const cy = 20;

let cells = new Array(cy*cx);

for(let k =0; k < cells.length; k++){
      cells[k] = document.createElement('div');
      cells[k].classList.add('box');
      cells[k].classList.add('cell');
      fied.append(cells[k]);
};

const clrs = ['black', 'white', 'red', 'green', 'blue', 'yellow'];
let curentColor;

let isDrag = 0;

btns[btns.length-1].addEventListener('click', (event)=> {
      clearField();           
});

for(let k =0; k < btns.length-1; k++ ){
      btns[k].addEventListener('click', (event)=> {
            refreshBth();      
            btns[k].classList.add('cheked');
            curentColor = clrs[k];           
      });
}


for(let k =0; k < cells.length; k++ ){
      cells[k].addEventListener('click', (event)=> {
            clearCell(k);      
            cells[k].classList.add(curentColor);                       
      });
}

for(let k =0; k < cells.length; k++ ){
      cells[k].addEventListener('mousemove', (event)=> {
            if(isDrag){
                  clearCell(k);      
                  cells[k].classList.add(curentColor);
            }                       
      });
}

fied.addEventListener('mousedown', (event)=> {
      isDrag = 1;            
});

fied.addEventListener('mouseup', (event)=> {
      isDrag = 0;            
});

function refreshBth(){
      for(btn of btns){
            btn.classList.remove('cheked');
      };
}

function clearCell(k){
      cells[k].classList.remove('black');
      cells[k].classList.remove('white');
      cells[k].classList.remove('red');
      cells[k].classList.remove('green');
      cells[k].classList.remove('blue');
      cells[k].classList.remove('yellow');
}

function clearField(){
      for(let k =0; k < cells.length; k++)
            clearCell(k);
}

console.log('Finish');

