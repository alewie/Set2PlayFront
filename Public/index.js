var setlistTracks = [];
var setlistArtist;
var idArray = [];

//Initialise Deezer SDK
DZ.init({
  appId  : 444582,
  channelUrl : 'https://alewie.github.io/Set2PlayFront/channel.html'
});


document.getElementById("createBut").style.display = "none" ;



 document.querySelector(".RadioSetlist").addEventListener("click", function(){
    document.querySelector(".userInput").placeholder=document.querySelector(".RadioSetlist")[getRadiobuttonVal()].value ;
});

document.querySelector(".submit").addEventListener("click", function(){
  // need to do sanitization here
  var apiCall ;
  if(getRadiobuttonVal()==0){
    apiCall = "http://localhost:3000/api/setlist/from_artist/" ;
  }
  else if (getRadiobuttonVal() == 1){
    apiCall = "http://localhost:3000/api/setlist/from_id/";
  }

  axios.get(apiCall + document.querySelector(".userInput").value)
  .then(function(response){
    setlistTracks = [];
    setlistArtist = document.querySelector(".userInput").value; //TMP ONLY WILL CHANGE API TO RETURN ARTIST NAME TO BE SAFER
    resultsDisplay = document.querySelector(".results");
    resultsDisplay.innerHTML = "<br>";
    for(idx = 0; idx < response.data.length; idx++){
      resultsDisplay.innerHTML += response.data[idx].name + "<br>";
      setlistTracks[idx] = response.data[idx].name;
    }
    document.getElementById("createBut").style.display = "flex" ;
  })
});

function getRadiobuttonVal (){
  console.log(document.querySelector(".RadioSetlist").length)
    for (i=0; i< document.querySelector(".RadioSetlist").length; i++){
        if(document.querySelector(".RadioSetlist")[i].checked){
          return i;
        }
     }
};

async function getDeezerTrackId(artist, tracks, nb_tracks)
{
  idArray = [];
  var apiCallsDone = 0;
  for(i=0; i< nb_tracks; i++)
  {
    DZ.api("/search?q=artist:\"" +artist+ "\" track:\""+ tracks[i]+ "\"", function(response)
    {
      var results = response.data
      apiCallsDone ++;
      if (results.length)
      {
        console.log(results[0].title);
        idArray.push(results[0].id);
      }
      else{
        console.log("track not found");
        //Highlight in Red in List
      }
      if (apiCallsDone == nb_tracks)
      {
        console.log ("HI")
        DZ.api("playlist/8684741542/tracks", "POST", {songs : idArray } , function(response)
        {
          console.log(response);
        })
      }
    })
    while (apiCallsDone < nb_tracks)
    {
      //Do nothing 
    }
    console.log(idArray);
  }
};

document.querySelector("#createBut").addEventListener("click", function(){
  
    getDeezerTrackId(setlistArtist, setlistTracks, setlistTracks.length);

});

function login() {
  DZ.login(function (response) {
      if (response.authResponse) {
          console.log('Welcome!  Fetching your information.... ');
          DZ.api('/user/me', function (response) {
              console.log('Good to see you, ' + response.name + '.');
          });
          userToken = response.authResponse.accessToken;
      } else {
          console.log('User cancelled login or did not fully authorize.');
      }
  }, { perms: 'email, manage_library' });
};