// API keys
var auth = {
  version: "v3",
  campaign_finance_api_key: "693917afeaba58fde1552a6732852e9c:18:70213515",
  congress_api_key: "eab06b972a38a20d0e58eb3d8cdc7c58:7:70213515",
  times_newswire_api_key: "79e51b60c583682981c77388db8f55d9:10:70213515",
  article_search_api_key: "9e9d9f28b5f5b62d79968c128fdf7a66:9:70213515",
}


$(document).ready(function() {
  if (!store.enabled) {
    alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.')
    return
  }
  addFavs();
  displayArticles();
   
});

$(document).keydown(function(key) {
  if (key.altKey) {
    if ($("body").hasClass("modal-open")) {
      switch (key.keyCode) {
        case 83:
          if (!$("#btnSearch").attr("disabled"))
            $("#btnSearch").get(0).click();        
          break;
        case 67:
          $("#btnClose").trigger("click");
          $("#btnHelpClose").trigger("click");
          break;
      }
    }
    else {
      switch(key.keyCode) {    
        case 83:
          $("#btnSearchModal").trigger("click");          
          break;
        case 70:
          $("#dboFavorite").trigger("click");
          key.preventDefault();
          break;
        case 72:
          $("#btnHelpModal").get(0).click();
          break;
      }
    }
  }
  else {
    switch(key.keyCode) {    
      case 13:
        if ($("body").hasClass("modal-open")) {
          $("#btnSearch").get(0).click();
          key.preventDefault();
        }
        break;
        
      case 27:
        if ($("body").hasClass("modal-open")) {
          $("#btnClose").trigger("click");
          $("#btnHelpClose").trigger("click");
          key.preventDefault();
        }
        break;
    }
  }
});


function addFavs()
{
  var favs = store.get("favorites");

  if(!favs)
  {
    favs = {};    
  }
  var content = "";

  for(var f in favs)
  {
    if(favs.hasOwnProperty(f))
    {
      content += "<li><a href='person.html' onclick='favSelected(\"" + f + "\")'>" + f +"</a></li>"
    }
  }
  $('#dboFav').empty().append(content);

}
function favSelected(name)
{
  var favs = store.get("favorites");
  var member = favs[name];
  //Todo: set the store valuse used for search and reload the page.
  store.set("state", member.state);
  store.set("chamber", member.chamber);
  store.set("district", member.district);   
}

//Article display code --Connor
function displayArticles(){
  
  var count = 0;
  $('#articleSection').empty();

  var favorites = store.get(favorites);


  //Process of iterating through the list of favorites, displaying two relevant articles for each favorite.
  if(favorites)
  {
  	for(var name in favorites)
  	{
  		if(favorites.hasOwnProperty(name))
  		{
            $.ajax({
                url: "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + name + "&begin_date=20140101&api-key=" + auth.article_search_api_key,
      			type: "get",
      			dataType: "json",
      			cache: true,
      			success:function(json){
          			var articleArray = json.response.docs;
          		
          			for(var i = 0; i < 2; i++)
          			{
              		    var date_time = articleArray[i].pub_date.split(/Z/)[0].split(/T/);
              			var byline = "";
              			if (articleArray[i].byline.length != 0){
                		    byline = articleArray[i].byline.original + "<br>";
              		    }
              		    $('#articleSection').append("<div class=\"well\">" + "<h2><a href=\"" + articleArray[i].web_url + "\" target=\"_blank\">" 
                                          			+ articleArray[i].headline.main + "</a><h2><p class=\"articleDetail\">"
                                          			+ byline
                                          			+ date_time[0] + " at " + date_time[1] + "<br></p><p class=\"snippet\">" 
                                          			+ articleArray[i].snippet + "</p></div>");
              		    count++;
          			}
      			},
      			error:function(){
          			alert("Error")
      			},
    		});
        }
    }
  }  

  //If less than 10 articles are displayed after working throught the user's favorites, fill the rest of the 10 with congress articles
  if(count < 10)
  {
  	$.ajax({
        url: "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=congress&begin_date=20140101&api-key=" + auth.article_search_api_key,
        type: "get",
        dataType: "json",
        cache: true,
        success:function(json){
          var articleArray = json.response.docs;
          
          for(var i = 0; i < (10 - count); i++)
          {
            var date_time = articleArray[i].pub_date.split(/Z/)[0].split(/T/);
            var byline = "";
            if (articleArray[i].byline.length != 0) {
              byline = articleArray[i].byline.original + "<br>";
            }
            $('#articleSection').append("<div class=\"well\">" + "<h2><a href=\"" + articleArray[i].web_url + "\" target=\"_blank\">" 
                                        + articleArray[i].headline.main + "</a><h2><p class=\"articleDetail\">"
                                        + byline
                                        + date_time[0] + " at " + date_time[1] + "<br></p><p class=\"snippet\">" 
                                        + articleArray[i].snippet + "</p></div>");
          }
        },
        error:function(){
          alert("Error")
        },
    });
  }
}

function btnSearchOnClick() {
  store.set("state", $("#cboState").val());
  store.set("chamber", $("#cboChamber").val());
  store.set("district", $("#cboDistrict").val());   
}

function cboStateOnChange() {
  var count = 0;
  
  if ($("#cboState").val().length > 0) {
    $("#cboDistrict").find("option").remove();
    $("#cboDistrict").append($("<option>", {
      value: "",
      text: ""
    }));
    
    switch ($("#cboState").val()) {
      case "AL": count = 7; break;
      case "AK": count = 1; break; 
      case "AZ": count = 9; break; 
      case "AR": count = 4; break; 
      case "CA": count = 53; break; 
      case "CO": count = 7; break; 
      case "CT": count = 5; break; 
      case "DE": count = 1; break; 
      case "FL": count = 27; break; 
      case "GA": count = 14; break; 
      case "HI": count = 2; break; 
      case "ID": count = 2; break; 
      case "IL": count = 18; break; 
      case "IN": count = 9; break; 
      case "IA": count = 4; break; 
      case "KS": count = 4; break; 
      case "KY": count = 6; break; 
      case "LA": count = 6; break; 
      case "ME": count = 2; break; 
      case "MD": count = 8; break; 
      case "MA": count = 9; break; 
      case "MI": count = 14; break; 
      case "MN": count = 8; break; 
      case "MS": count = 4; break; 
      case "MO": count = 8; break; 
      case "MT": count = 1; break; 
      case "NE": count = 3; break;
      case "NV": count = 4; break;
      case "NH": count = 2; break;
      case "NJ": count = 12; break;
      case "NM": count = 3; break;
      case "NY": count = 27; break;
      case "NC": count = 13; break;
      case "ND": count = 1; break;
      case "OH": count = 16; break;
      case "OK": count = 5; break;
      case "OR": count = 5; break;
      case "PA": count = 18; break;
      case "RI": count = 2; break;
      case "SC": count = 7; break;
      case "SD": count = 1; break;
      case "TN": count = 9; break;
      case "TX": count = 36; break;
      case "UT": count = 4; break;
      case "VT": count = 1; break;
      case "VA": count = 11; break;
      case "WA": count = 10; break;
      case "WV": count = 3; break;
      case "WI": count = 8; break;
      case "WY": count = 1; break;
    }
  }
  
  for (var i = 1; i <= count; i ++) {    
    $('#cboDistrict').append($("<option>", {
      value: i,
      text: i
    }));
  }

  enableDisableFields();
}

function cboChamberOnChange() {
  enableDisableFields();
}

function cboDistrictOnChange() {
  enableDisableFields();
}

function enableDisableFields() {
  if ($("#cboState").val().length > 0 && $("#cboChamber").val() != "Senate")
    $("#cboDistrict").prop("disabled", false);
  else {
    $("#cboDistrict").prop("disabled", true);
    $("#cboDistrict").val("");
  }
  
  $("#btnSearch").attr("disabled", true);
  
  if ($("#cboState").val().length > 0 && $("#cboChamber").val().length > 0) { 
    if ($("#cboChamber").val() == "House") {
      if ($("#cboDistrict").val().length > 0)
        $("#btnSearch").attr("disabled", false);
    }
    else
      $("#btnSearch").attr("disabled", false);
  }
}