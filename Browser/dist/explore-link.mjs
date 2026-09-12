// The exterior remains available even while the interior game is loading.
const button=document.createElement('button');
button.id='explore';button.className='secondary';
button.innerHTML='EXPLORE THE ASYLUM <span aria-hidden="true">↗</span>';
button.addEventListener('click',()=>{location.href='./explore.html';});
document.querySelector('.menu-actions').append(button);
