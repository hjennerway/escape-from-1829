// The exterior remains available even while the interior game is loading.
const button=document.createElement('button');
button.id='explore';button.className='secondary';
button.innerHTML='EXPLORE ON FOOT <span aria-hidden="true">↗</span>';
button.addEventListener('click',()=>{location.href='./explore.html';});
document.querySelector('.menu-actions').prepend(button);

const aerialButton=document.createElement('button');
aerialButton.id='aerial';aerialButton.type='button';
aerialButton.innerHTML='AERIAL VIEW <span aria-hidden="true">↗</span>';
aerialButton.addEventListener('click',()=>{location.href='./aerial.html';});
button.before(aerialButton);
