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

myPeer.on('open', id => {
  const userName = prompt('What is your name?')
  appendMessage('You joined!')
  socket.emit('join-room', ROOM_ID, id, userName)
  //socket.emit('veritfy-hostOguest')
})
/*
socket.on('show-video',(num_room_guests) => {
  console.log(num_room_guests)
  if(num_room_guests===1){
    appendMessage("You are the room host!")
  }else{
    appendMessage("Welcome!")
  }
})*/

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}

navigator.mediaDevices.getUserMedia({
  video:  {//limit video in HD
    width: {exact:1280},
    height: {exact:720}
  },
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  
  //add other video while they call
  myPeer.on('call', call => {
    //console.log('answer')
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
  //show message and connect while new guest join
  socket.on('user-connected', (userId, userName) => {
    appendMessage(`${userName} joined room!`)
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', (userId, userName) => {
  if (peers[userId]) peers[userId].close()
  appendMessage(`${userName} leave room!`)
})

//chat room
/*
let text = $("input");// input value
$('html').keydown(function (e) {// when press enter send message
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
    //console.log(message)
    socket.emit('send-chat-message', message)
    //clear massge value after sending
    messageInput.value = ''
  }
})
socket.on('chat-message', (message, userName) => {
  //console.log("hello");//send hello world form server to other cilents
  //appendMessage(`${data.userName}: ${data.message}`)
  appendMessage(`${userName}: ${message}`)
})

socket.on('love-message', userName => {
  //console.log("cilent: love-message")
  appendMessage(`${userName}  gave host a huge ❤!!!`)
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
  //scroll to bottom
  scrollToBottom()
}

function scrollToBottom(){
  var d = $('.main__chat_window')
  d.scrollTop(d.prop("scrollHeight"))
}

function send_love(){
  socket.emit('send-love-message')
  appendMessage("You gave host a huge ❤!!!")
}

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
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const playStopMusic = () => {
  let state_music = document.getElementById("MovieShow").style.display;
  if (state_music=="none") {
    document.getElementById("MovieShow").pause();
    document.getElementById("MovieShow").style.display="";
    document.getElementById("lyric_text").style.display = "none"
    setPlayMusic()
  } else {
    document.getElementById("MovieShow").play();
    document.getElementById("MovieShow").style.display="none";
    document.getElementById("lyric_text").style.display = "grid"
    setStopMusic()
  }
}

const showHideFilter = () => {
  let state_filter = document.getElementById("state_filter").style.display;
  if(state_filter==""){
    state_filter = "none"
  }
  if (state_filter=="none") {
    document.getElementById("state_filter").style.display = "grid"
    setShowFilter()
  } else {
    document.getElementById("state_filter").style.display = "none"
    setHideFilter()
  }
}

const showHideChat_window = () => {
  let state_chat_window = document.getElementById("state_chat_window").style.display
  if(state_filter==""){
    state_filter = "flex"
  }
  if (state_chat_window=="none") {
    document.getElementById("state_chat_window").style.display = "grid"
    setChatRoomClose()
  } else {
    document.getElementById("state_chat_window").style.display = "none"
    setChatRoomOpen()
  }
}

const leave_room = () => {
  //console.log("LEAVE ROOM")
  if (confirm("leave room?")){
    window.location.assign("../")
  }
}
//--------------//
//  icon setup  //
//--------------//
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

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
const setShowFilter = () => {
  const html = `
    <i class="stop fas fa-filter"></i>
    <span>hide</span>
  `
  document.querySelector('.main__filter_button').innerHTML = html;
}

const setHideFilter = () => {
  const html = `
    <i class="fas fa-filter"></i>
    <span>show</span>
  `
  document.querySelector('.main__filter_button').innerHTML = html;
}

const setStopMusic = () => {
  const html = `
    <i class="fas fa-music"></i>
    <span>Pause</span>
  `
  document.querySelector('.main__music_button').innerHTML = html;
}

const setPlayMusic = () => {
  const html = `
    <i class="stop fas fa-music"></i>
    <span>Play</span>
  `
  document.querySelector('.main__music_button').innerHTML = html;
}

const setChatRoomOpen = () => {
  const html = `
    <i class="stop fas fa-comment-alt"></i>
    <span>Chat</span>
  `
  document.querySelector('.main__chat_button').innerHTML = html;
}

const setChatRoomClose = () => {
  const html = `
    <i class="fas fa-comment-alt"></i>
    <span>Chat</span>
  `
  document.querySelector('.main__chat_button').innerHTML = html;
}

/*-------------------------------------------------------濾鏡*/

  function fileSelect() { 
    let img = document.getElementById('video-grid')
    document.getElementById('file').onchange = function() { 
      var reader = new FileReader();
      reader.onload = function(e) { 
        img.src = e.target.result; 
      } 
      reader.readAsDataURL(this.files[0]); 
    } 
  }
  function reset() { 
    let reset_btn = document.getElementById('reset'); 
    let val_boxes = document.getElementsByClassName('val-box'); 
    let val_arr = Array.prototype.slice.call(val_boxes); 
    let img = document.getElementById('video-grid') 
    reset_btn.addEventListener('click', function() { 
      //所有的数据输入重置为空 
      val_arr.forEach(function(item) { 
        item.value = "";
      }); //去掉图片的css属性 
      img.style.filter = ""; 
    }) 
  }
  function filter(type) { 
    //获取滤镜类型关联的dom节点 //绑定change事件 //更改右侧输入框的显示的值，以及更新滤镜效果 
    let ele = document.getElementById(type); 
    let ele_val = document.getElementById(type + '-val'); 
    ele_val.addEventListener('keyup',function(e){ 
      if(e.key == 13){
         ele.value = ele_val.value; 
         setCss(type, ele_val.value); 
        } 
      }) 
      ele.addEventListener('change', function() { 
        ele_val.value = ele.value; 
        setCss(type, ele_val.value);
     });
  }

  function setCss(type, val) { 
    let img = document.getElementById('video-grid') 
    //已经存在某个滤镜,更改滤镜数值 
    if (img.style.filter.indexOf(type) > -1) { 
      let reg = new RegExp("(?<=" + type + ")" + "\\(.*\\)", "g")
       img.style.filter = img.style.filter.replace(reg, function(match) { return `(${val/100})` }); 
      } else { 
        //直接添加新滤镜 
        img.style.filter += `${type}(${val/100})` 
      } 
  } 
  window.onload = function() { 
    //亮度
     filter('brightness'); 
     //对比度 
     filter('contrast'); 
     //灰度 
     filter('grayscale'); 
     //饱和度 
     filter('saturate'); 
     //透明度
      filter('opacity'); 
      //反相 
      filter('invert'); 
      //注册重置 
      reset(); 
      //注册文件选择 
      fileSelect(); 
    }

/*
    function preview(file){
      const img = document.getElementById('video-grid') 
      if(file.files && file.files[0]){
          const reader = new FileReader();
          reader.onload = function(evt) {
              img.src = evt.target.result;
          };
          reader.readAsDataURL(file.files[0]);
      }
      console.log(file.files , file.files[0]);
  }

  function changeImg(){
    const img = document.getElementById('video-grid') 
    let grayscale = document.getElementById("grayscale").value,
        brightness = document.getElementById("brightness").value,
        contrast = document.getElementById("contrast").value,
        saturate = document.getElementById("saturate").value;
    img.style.webkitFilter = "grayscale("+grayscale+"%) brightness("+brightness+"%) contrast("+contrast+"%) saturate("+saturate+"%)";
    img.style.filter = "grayscale("+grayscale+"%) brightness("+brightness+"%) contrast("+contrast+"%) saturate("+saturate+"%)";
}
//    数值调整
function changeValue(type){
    let valBlock,val;
    if(type === 1){
        valBlock =  document.getElementById("grayscaleText");
        val = document.getElementById("grayscale").value;
    }else if(type === 2){
        valBlock =  document.getElementById("brightnessText");
        val = document.getElementById("brightness").value;
    }else if(type === 3){
        valBlock =  document.getElementById("contrastText");
        val = document.getElementById("contrast").value;
    }else if(type === 4){
        valBlock =  document.getElementById("saturateText");
        val = document.getElementById("saturate").value;
    }
    valBlock.innerHTML = val + '%';
    changeImg();
}
*/
/*function Size(x){
  if(x=='big'){
    　document.getElementById('video-grid').width=500;
    　document.getElementById('video-grid').height=450;
  }else if(x=='small'){
    　document.getElementById('video-grid').width=260;
    　document.getElementById('video-grid').height=234;
  }}*/
