console.log('Begin');
const maindoc = document.getElementsByClassName('main-container')[0];
const elementSender = document.getElementsByClassName('sender')[0];

console.log('Finish');

function onBtnSendClick(){
    const elmMess = document.getElementsByClassName('input-message')[0];
    const inpMess = elmMess.value;
    const inpName = document.getElementsByClassName('input-name')[0].value;
    const now = (new Date()).toLocaleString();    
    
    let message = document.createElement('div');    
    message.classList.add('box');
    message.classList.add('message');
    message.innerHTML = 
    `<div class="box message-header">
            <div class="div name">${inpName}</div>
            <div class="div date">${now}</div>
    </div>
    <div class="box message-content">${inpMess}</div>`;     
    maindoc.appendChild(message);    
    message.after(elementSender);
    elmMess.value = '';  
}