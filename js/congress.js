// API keys
var auth = {
  version: "v3",
  campaign_finance_api_key: "",
  congress_api_key: "",
  times_newswire_api_key: "",
  article_search_api_key: "",
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
    store.set("favorites", favs);    
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

  var favorites = store.get("favorites");


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
              $('#articleSection').empty().show().append("<div class='error'>Error occurred contacting the API. Please reload the page to see news information.</div>");
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
          $('#articleSection').empty().show().append("<div class='error'>Error occurred contacting the API. Please reload the page to see news information.</div>");
        },
    });
  }
}

function btnSearchOnClick() {
  store.set("state", $("#cboState").val());
  store.set("chamber", $("#cboChamber").val());
  store.set("district", $("#cboDistrict").val());
  store.set("senator", $("#cboSenator").val());
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
  var one = "";
  var two = "";

   if ($("#cboChamber").val().length > 0) {
    $("#cboSenator").find("option").remove();
    $("#cboSenator").append($("<option>", {
      value: "",
      text: ""
    }));
    
    switch ($("#cboState").val()) {
      case "AL": one = "Jeff Sessions"; two = "Richard Shelby"; break;
      case "AK": one = "Mark Begich"; two = "Lisa Murkowski";  break; break; 
      case "AZ": one = "Jeff Flake"; two = "John McCain"; break; 
      case "AR": one = "John Boozman"; two = "Mark Pryor"; break; 
      case "CA": one = "Barbara Boxer"; two = "Dianne Feinstein"; break; 
      case "CO": one = "Michael Bennet"; two = "Mark Udall"; break; 
      case "CT": one = "Richard Blumenthal"; two = "Christopher Murphy"; break; 
      case "DE": one = "Thomas Carper"; two = "Christopher Coons"; break; 
      case "FL": one = "Bill Nelson"; two = "Marco Rubio"; break; 
      case "GA": one = "Saxby Chambliss"; two = "Johnny Isakson"; break; 
      case "HI": one = "Mazie Hirono"; two = "Brian Schatz"; break; 
      case "ID": one = "Mike Crapo"; two = "James Risch"; break; 
      case "IL": one = "Richard Durbin"; two = "Mark Kirk"; break; 
      case "IN": one = "Daniel Coats"; two = "Joe Donnelly"; break; 
      case "IA": one = "Chuck Grassley"; two = "Tom Harkin"; break; 
      case "KS": one = "Jerry Moran"; two = "Pat Roberts"; break; 
      case "KY": one = "Mitch McConnell"; two = "Rand Paul"; break; 
      case "LA": one = "Mary Landrieu"; two = "David Vitter"; break; 
      case "ME": one = "Susan Collins"; two = "Angus King"; break; 
      case "MD": one = "Benjamin Cardin"; two = "Barbara Mikulski"; break; 
      case "MA": one = "Edward Markey"; two = "Elizabeth Warren"; break; 
      case "MI": one = "Carl Levin"; two = "Debbie Stabenow"; break; 
      case "MN": one = "Al Franken"; two = "Amy Klobuchar"; break; 
      case "MS": one = "Thad Cochran"; two = "Roger Wicker"; break; 
      case "MO": one = "Roy Blunt"; two = "Claire McCaskill"; break; 
      case "MT": one = "Jon Tester"; two = "John Walsh"; break; 
      case "NE": one = "Deb Fischer"; two = "Mike Johanns"; break;
      case "NV": one = "Dean Heller"; two = "Harry Reid"; break;
      case "NH": one = "Kelly Ayotte"; two = "Jeanne Shaheen"; break;
      case "NJ": one = "Cory Booker"; two = "Robert Menendez"; break;
      case "NM": one = "Martin Heinrich"; two = "Tom Udall"; break;
      case "NY": one = "Kirsten Gillibrand"; two = "Charles Schumer"; break;
      case "NC": one = "Richard Burr"; two = "Kay Hagan"; break;
      case "ND": one = "Heidi Heitkamp"; two = "John Hoeven"; break;
      case "OH": one = "Sherrod Brown"; two = "Rob Portman"; break;
      case "OK": one = "Tom Coburn"; two = "James Inhofe"; break;
      case "OR": one = "Jeff Merkley"; two = "Ron Wyden"; break;
      case "PA": one = "Robert Casey"; two = "Patrick Toomey"; break;
      case "RI": one = "Jack Reed"; two = "Sheldon Whitehouse"; break;
      case "SC": one = "Lindsey Graham"; two = "Tim Scott"; break;
      case "SD": one = "Tim Johnson"; two = "John Thune"; break;
      case "TN": one = "Lamar Alexander"; two = "Bob Corker"; break;
      case "TX": one = "John Cornyn"; two = "Ted Cruz"; break;
      case "UT": one = "Orrin Hatch"; two = "Mike Lee"; break;
      case "VT": one = "Patrick Leahy"; two = "Bernard Sanders"; break;
      case "VA": one = "Tim Kaine"; two = "Mark Warner"; break;
      case "WA": one = "Maria Cantwell"; two = "Patty Murray"; break;
      case "WV": one = "Joe Manchin"; two = "John Rockefeller"; break;
      case "WI": one = "Tammy Baldwin"; two = "Ron Johnson"; break;
      case "WY": one = "John Barrasso"; two = "Michael Enzi"; break;
    }
  }

  $('#cboSenator').append($("<option>", {
      value: one,
      text: one
    }));

  $('#cboSenator').append($("<option>", {
      value: two,
      text: two
    }));

  enableDisableFields();
}

function cboDistrictOnChange() {
  enableDisableFields();
}

function cboSenatorOnChange() {
  enableDisableFields();
}

function enableDisableFields() {
  if ($("#cboState").val().length > 0) {
    if ($("#cboChamber").val() != "Senate") {
      $("#cboDistrict").prop("disabled", false);

      $("#cboSenator").prop("disabled", true);
      $("#cboSenator").val("");
    } else {
      $("#cboSenator").prop("disabled", false);

      $("#cboDistrict").prop("disabled", true);
      $("#cboDistrict").val("");
    }
  } else {
    $("#cboSenator").prop("disabled", true);
    $("#cboSenator").val("");

    $("#cboDistrict").prop("disabled", true);
    $("#cboDistrict").val("");
  }
  
  $("#btnSearch").attr("disabled", true);
  
  if ($("#cboState").val().length > 0 && $("#cboChamber").val().length > 0) { 
    if ($("#cboChamber").val() == "House") {
      if ($("#cboDistrict").val().length > 0)
        $("#btnSearch").attr("disabled", false);
    } else if ($("#cboChamber").val() == "Senate") {
      if ($("#cboSenator").val().length > 0)
        $("#btnSearch").attr("disabled", false);
    } else
      $("#btnSearch").attr("disabled", false);
  }
}