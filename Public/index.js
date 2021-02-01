var setlistTracks = [];
var setlistArtist;
var idArray = [];
var userToken;

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
  var playlistId = 0;
  idArray = [];
  await DZ.api('user/me/playlists', 'POST', {title : "test"}, function(response){
    playlistId = response.id;
  });
  for(i=0; i< nb_tracks; i++)
  {
    //ID array doesn't work!!!!
   await DZ.api("/search?q=artist:\"" +artist+ "\" track:\""+ tracks[i]+ "\"", function(response)
    {
      var results = response.data
      if (results.length)
      {
        console.log(results[0].title);
        idArray[i]=results[0].id;
        //Add to Playlist Here
        DZ.api("playlist/8684788082/tracks", {songs : results[0].id } , function(response)
        {
          console.log(response);
        })
      }
      else{
        console.log("track not found");
        idArray[i]=0;
        //Highlight in Red in List
      }
      console.log(idArray);
    })
  }
};

document.querySelector("#createBut").addEventListener("click", function(){
  
    getDeezerTrackId(setlistArtist, setlistTracks, setlistTracks.length);

});

//Change stuff here before release
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