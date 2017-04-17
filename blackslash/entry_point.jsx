import preact from 'preact';

document.addEventListener('DOMContentLoaded',function(){
    const flash_msg = document.createElement('DIV');
    flash_msg.style.padding = '10px';
    flash_msg.style.color = 'red';
    flash_msg.innerHTML = 'HELOOO';
    document.appendChild(flash_msg);
});