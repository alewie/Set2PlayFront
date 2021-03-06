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
    
    document.querySelector(".search-box").style.display = "none"

    var resultsDisplay = document.querySelector(".results-table");
    var nb_rows = resultsDisplay.rows.length
    for (jdx = 0; jdx <nb_rows-1 ; jdx++)
    {
      resultsDisplay.deleteRow(1);
    };
    for(idx = 0; idx < response.data.setlist.length; idx++)
    {
      var row = resultsDisplay.insertRow(idx+1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = idx+1;  
      cell2.innerHTML = response.data.setlist[idx].name;

      setlistTracks[idx] = response.data.setlist[idx].name;
      setlistArtist = response.data.artist;
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
  var date = new Date();
  DZ.api("/user/me/playlists", "POST", {title : artist + " Set2Play " + date.getMonth()+1 +"/"+ date.getFullYear() }, function(response)
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
            if (response == true)
            {
              document.querySelector(".successText").innerHTML = "<li>The name of your Playlist is <strong> " + setlistArtist + " Set2Play " + date.getMonth()+1 +"/"+ date.getFullYear() +"</strong></li> <li> You can find it at the following link: <strong> <a href=https://www.deezer.com/en/playlist/"+setlistID+">https://www.deezer.com/en/playlist/"+setlistID+"</a> </strong></li><li> You can edit the playlist name directly on the deezer website </li>"
              document.querySelector(".results").style.display = "none" ;
              document.querySelector(".success").style.display = "flex" ;

            }
          })
        }
      })
    }
  })
};

function createPlaylist(){
    
    if (DZ.api('/user/me'))
    {
      getDeezerTrackId(setlistArtist, setlistTracks, setlistTracks.length);
    }
    else
    {
      console.log("Please login"); 
      DZ.login(function (response) {
        if (response.authResponse)
        {
          getDeezerTrackId(setlistArtist, setlistTracks, setlistTracks.length);
        }
        else
        {
            console.log('Couldnt log in');
        }
      }, { perms: 'email, manage_library' });
    }
};

 function returnToSearch()
{
  document.querySelector(".results").style.display = "none" ;
  document.querySelector(".success").style.display = "none" ;
  document.querySelector(".search-box").style.display = "flex";

};