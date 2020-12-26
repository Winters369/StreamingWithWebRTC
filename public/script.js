const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myPeer = new Peer(undefined, {
  path: '/peerjs',
  //hereku
  secure: true,
  host: 'capstone-streaming.herokuapp.com',
  port: '443'
})

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('chat_message')

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video:  {
    width: {exact:1280},
    height: {exact:720}
  },
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    //console.log('answer')
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', (userId, userName) => {
    appendMessage(`${userName} joined room!`)
    connectToNewUser(userId, stream)
  })
  /*
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('send-chat-message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", (message) => {
    $("ul").append(`<li class="message"><b>User: </b>${message}</li>`);
    scrollToBottom()
  })
  */
  messageForm.addEventListener('submit', e => {
    //don't refresh page when we send message, or we lose the messages
    e.preventDefault()
      const message = messageInput.value
    if(message !== ""){
      //show my message
      appendMessage(`You: ${message}`)
      //send information from cilent to server
      socket.emit('send-chat-message', message)
      //clear massge value after sending
      messageInput.value = ''
    }
  })
  socket.on('chat-message', data => {
    //console.log(data);//send hello world form server
    appendMessage(`${data.userName}: ${data.message}`)
  })
})

messageForm.addEventListener('love', ()=> {
  //socket.emit('send-love-message')
})

//bug: cannot find it
socket.on('love-message', userName => {
  console.log("cilent: love-message")
  appendMessage(`${userName}  gave host a huge ❤!!!`)
})

socket.on('user-disconnected', (userId, userName) => {
  if (peers[userId]) peers[userId].close()
  appendMessage(`${userName} leave room!`)
})

myPeer.on('open', id => {
  const userName = prompt('What is your name?')
  appendMessage('You joined!')
  socket.emit('join-room', ROOM_ID, id, userName)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

//new chat message
function appendMessage(message) {
  const messageElement = document.createElement('div')
  //save the messages
  messageElement.innerText = message
  //put messages on the view
  messageContainer.append(messageElement)
}

/* old chat room
const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}
*/


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}



const playStop = () => {
  const video = document.getElementById('video')
  //console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

function Control(x){
  if(x=='start'){
  　document.getElementById("MovieShow").play();
    document.getElementById("MovieShow").style.display="none";
  }else if(x=='stop'){
  　document.getElementById("MovieShow").pause();
    document.getElementById("MovieShow").style.display="";
  }}

const playStopMusic = () => {
  let enabled = myVideoStream.getMusicTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getMusicTracks()[0].enabled = false;
    setPlayMusic()
  } else {
    setStopMusic()
    myVideoStream.getMusicTracks()[0].enabled = true;
  }
}

const chat_window = () => {

}

const leave_room = () => {
  
}
/*---------------------------------------麥克風*/
const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}
/*-------------------------------------實況*/
const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
/*------------------------------------音樂*/
const setStopMusic = () => {
  const html = `
    <i class="fas fa-music"></i>
    <span>Stop Music</span>
  `
  document.querySelector('.main__music_button').innerHTML = html;
}

const setPlayMusic = () => {
  const html = `
  <i class="stop fas fa-music-slash"></i>
    <span>Play Music</span>
  `
  document.querySelector('.main__music_button').innerHTML = html;
}
/*-----------------------------------------------------------------------*/

/*下面沒有被使用--------------------------------------------------------------------*/
const setChatRoomOpen = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Chat</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setChatRoomClose = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Chat</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}



