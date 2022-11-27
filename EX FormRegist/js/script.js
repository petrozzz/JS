console.log('Begin');

const registrationForm = document.getElementsByClassName('box1')[0];
const registrationResult = document.getElementsByClassName('result')[0];
const registrationText = document.getElementsByClassName('result-inherit')[0];
const avatars = Array.from(document.getElementsByClassName('avatar'));
let selectAvatar;


avatars.forEach(avatar => {
    avatar.addEventListener('click',()=>{resetAvatar(); avatar.classList.add('active'); selectAvatar = avatar});
});

console.log('Finish');

function resetAvatar(){
    avatars.forEach(avatar => {avatar.classList.remove('active')});
}

function onBtnSendClick(){
    
    const secondName = document.getElementsByClassName('input-name')[0].value;
    const firstName = document.getElementsByClassName('input-name')[1].value;
    const birthDay = document.getElementsByClassName('input-name')[2].value;    
    const nickName = document.getElementsByClassName('input-name')[3].value;
    const aboutSelf = document.getElementsByClassName('input-name')[4].value;
    
    if(nickName.length > 0){
       if(firstName.length > 0 || secondName.length > 0){
            str = `<p>${secondName} ${firstName}</p>`;
            (birthDay.length > 0) && (str += `<p>Родившийся ${birthDay}</p>`);
            str += `<p>Зарегистрирован<br>с ником: ${nickName}</p>`    
            
            let av = document.createElement('img');
            let tx = document.createElement('div');            
            av.classList.add('box');
            av.classList.add('avatar-noanimate');
            tx.classList.add('box'); 
            tx.classList.add('result-text');

            av.src = selectAvatar.src;

            tx.innerHTML = str;
    
            registrationText.append(av);
            registrationText.append(tx);

            registrationForm.classList.add('hide');
            registrationResult.classList.remove('hide');
        }
    }
    
/*
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
    */
}