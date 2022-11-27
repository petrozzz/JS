console.log('Begin');
const maindoc = document.getElementsByClassName('main-container')[0];

let form = document.querySelector('form');
let log = document.querySelector('#log');

form.addEventListener('submit', function(event) {
    let data = new FormData(form);
    let output = '';
    for (const entry of data) {
    output = entry[0] + '=' + entry[1] + '\r';
    };
    log.innerText = output;
    event.preventDefault();
}, false);

console.log('Finish');