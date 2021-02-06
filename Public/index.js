var setlistTracks = [];
var setlistArtist;
var idArray = [];

//Initialise Deezer SDK
DZ.init({
  appId  : 444582,
  channelUrl : 'https://alewie.github.io/Set2PlayFront/channel.html'
});


document.querySelector(".results").style.display = "none" ;

document.querySelector(".RadioSetlist").addEventListener("click", function()
{
    document.querySelector(".userInput").placeholder=document.querySelector(".RadioSetlist")[getRadiobuttonVal()].value ;
});

document.querySelector(".submit").addEventListener("click", function()
{
  // need to do sanitization here
  var apiCall ;
  if(getRadiobuttonVal()==0)
  {
    apiCall = "https://set2play.herokuapp.com/api/setlist/from_artist/" ;
  }
  else if (getRadiobuttonVal() == 1)
  {
    apiCall = "https://set2play.herokuapp.com/api/setlist/from_id/";
  }

  axios.get(apiCall + document.querySelector(".userInput").value)
  .then(function(response)
  {
    //NEED error Management
    setlistTracks = [];
    setlistArtist = document.querySelector(".userInput").value; //TMP ONLY WILL CHANGE API TO RETURN ARTIST NAME TO BE SAFER
    
    document.querySelector(".search-box").style.display = "none"

    var resultsDisplay = document.querySelector(".results");
    resultsDisplay.innerHTML = "";
    for(idx = 0; idx < response.data.length; idx++){
      resultsDisplay.innerHTML += "<tr><td>"+idx +"</td> <td> "+ response.data[idx].name +"</td> </tr>";
      setlistTracks[idx] = response.data[idx].name;
    }
    document.querySelector(".results").style.display = "flex" ;
  })
});

function getRadiobuttonVal ()
{
    for (i=0; i< document.querySelector(".RadioSetlist").length; i++)
    {
        if(document.querySelector(".RadioSetlist")[i].checked)
        {
          return i;
        }
     }
};

async function getDeezerTrackId(artist, tracks, nb_tracks)
{
  idArray = [];
  var apiCallsDone = 0;
  DZ.api("/user/me/playlists", "POST", {title : artist + "Set2Play + need to add date"}, function(response)
  {
    //ADD error management
    var setlistID = response.id;
    for(i=0; i< nb_tracks; i++)
    {
      DZ.api("/search?q=artist:\"" +artist+ "\" track:\""+ tracks[i]+ "\"", function(response)
      {
        var results = response.data
        apiCallsDone ++;
        if (results.length)
        {
          if (idArray.indexOf(results[0].id) == -1) //Only add if not already in array, causes deezer errors otherwise
          { 
            idArray.push(results[0].id);
          }
        }
        else{
          console.log("track not found");
          //Highlight in Red in List
        }
        if (apiCallsDone == nb_tracks)
        {
          DZ.api("playlist/"+ setlistID +"/tracks", "POST", {songs : idArray } , function(response)
          {
            //Add error management
            console.log(response);
          })
        }
      })
    }
  })
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

document.querySelector(".searchbut").addEventListener("click", function()
{
  document.querySelector(".results").style.display = "none" ;
  document.querySelector(".search-box").style.display = "flex";

});