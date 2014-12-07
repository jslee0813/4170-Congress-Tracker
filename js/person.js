// API keys
var auth = {
  version: "v3",
  campaign_finance_api_key: "69769739adad5ec9e5044090d867a62e:14:70154539",
  congress_api_key: "96625a843db6b50dcdb259b94e281246:8:70154539",
  times_newswire_api_key: "4f54e9027e2dfda5b275fdb8ddd93ba4:18:70154539",
  article_search_api_key: "1e94e0ac552a0041906f50590784f934:9:70154539",
}

var members = [];
var member_roles = [];
var bill_api_call = 0;

$(document).ready(function() {
  addFavs();
  getMemberBio();
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

// Campaign Finance - Jen 
// convert integer value into $xxx,xxx,xxx.xx format
function intToDollar(num) {
    return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
// get campaign finance details by member 
function getCampaignFinance(i) {
  name = members[i].name
  temp_name = name.split(" ")
  first_name = temp_name[0].toUpperCase()
  last_name = temp_name[temp_name.length -1].toUpperCase()

  // to calculate the year that the member was elected, find the next election year possible and subtract 6 for Senate
  // if House, leave as 2014, all House members were elected/re-elected in 2014
  year = members[i].next_election

  // set district for senate to 1, NYT API has bug that requires district for some Senate members 
  if (members[i].chamber == "senate") 
  {
    members[i].district = 1
    year = year - 6
  }
  else
  {
    year = 2014
  }
  members[i].financial_campaign_cycle = year
  $.ajax
  ({
    url: "http://api.nytimes.com/svc/elections/us/v3/finances/" + members[i].financial_campaign_cycle + "/seats/" + members[i].state + "/" + members[i].chamber + "/" + members[i].district + ".json?api-key=" + auth.campaign_finance_api_key,
    type: "GET", 
    dataType: "jsonp", 
    cache: true, 
    success: function(data)
    {
      $.each(data["results"], function(j, result) 
      {
        candidate_name = result['candidate']['name'].split(", ")
        if (candidate_name.length > 1)
        {
          candidate_last_name = candidate_name[0].toUpperCase()
          candidate_first_name = candidate_name[1].split(" ")[0].toUpperCase()
        }
        else
        {
          candidate_last_name = candidate_name[0].toUpperCase()
          candidate_first_name = ""
        }
        if (candidate_last_name == last_name && candidate_first_name == first_name)
        {
          members[i].fec_id = result['candidate']['id']
          $.ajax
          ({
            url: "http://api.nytimes.com/svc/elections/us/v3/finances/" + members[i].financial_campaign_cycle + "/candidates/" + members[i].fec_id + ".json?api-key=" + auth.campaign_finance_api_key, 
            type: "GET", 
            dataType: "jsonp",
            cache: true, 
            success: function(data)
            {
              response = data['results'][0]
              members[i].fec_url = response['fec_uri']
              members[i].total_contributions = intToDollar(response['total_contributions'])
              members[i].total_disbursements = intToDollar(response['total_disbursements'])
              members[i].total_from_individuals = intToDollar(response['total_from_individuals'])
              members[i].total_from_pacs = intToDollar(response['total_from_pacs'])
              members[i].total_receipts = intToDollar(response['total_receipts'])
              members[i].total_refunds = intToDollar(response['total_refunds'])
            },
            error: function(error){
              console.log(error)
            }
          })
        }
      })
    }, 
    error: function(error)
    {
      $('#').empty().append("<div class='error'>Error occurred contacting the API. Please reload the page to see financial information.</div>");

      console.log(error)
    }
  })
}

// Bill display code - Lindsay
function displayBills(member_id) {
  $('#billSection').empty();
  $.ajax({
    url: "http://api.nytimes.com/svc/politics/v3/us/legislative/congress/members/" + member_id + "/bills/introduced.json?api-key=" + auth.congress_api_key,
    type: "GET", 
    dataType: "json", 
    cache: true, 
    success: function(data) {
      var bills = data.results[0]["bills"];
      for (var i = 0; i < bills.length; i++) {
        var bill = bills[i];

        var content = "<div class=\"well\"><h4>";
        if (bill.number != undefined && bill.number.length > 0) {
          content += bill.number + ": ";
        }
        if (bill.title != undefined && bill.title.length > 0) {
           content += bill.title;
        }
        content += "</h4>";

        if (bill.introduced_date != undefined && bill.introduced_date.length > 0) {
          content += "<label>Introduced:&nbsp;&nbsp;&nbsp;</label>" + bill.introduced_date;
        }
        if (bill.congress != undefined && bill.congress.length > 0) {
           content += " (Congress "+ bill.congress + ")";
        }
        content += "<br>";

        if (bill.latest_major_action_date != undefined && bill.latest_major_action_date.length > 0) {
          content += "<label>Latest Action:&nbsp;&nbsp;&nbsp;</label>"+ bill.latest_major_action_date +"<br>"
        }

        if (bill.committees != undefined && bill.committees.length > 0) {
           content += "<label>Committee(s):&nbsp;&nbsp;&nbsp;</label>" + bill.committees + "<br>"
        }
        
        if (bill.cosponsors != undefined && bill.cosponsors.length > 0) {
           content += "<label>Number of Co-sponsors:&nbsp;&nbsp;&nbsp;</label>" + bill.cosponsors + "<br>"
        }
        
        if (bill.latest_major_action != undefined && bill.latest_major_action.length > 0) {
          content += "<label>Recent Major Action:&nbsp;&nbsp;&nbsp;</label>" + bill.latest_major_action + "<br>";
        }
        content += "</p></div>";

        $('#billSection').append(content);
      }
    },
    error: function() {
      $('#billSection').empty().append("<div class='error'>Error occurred contacting the API. Please reload the page to see bills information.</div>");
    }
  });

}

//Article display code --Connor
function displayArticles(){
  
  $('#articleSection').empty();

  var url1;
  var url2;
  var articleArray1;
  var articleArray2;
  var senatePage;
  var alternate;
  var memberName = members[0].name;
  var pos = memberName.search(" ");
  var fName = memberName.slice(0, pos);
  var lName = memberName.slice(pos + 1, memberName.length);
  
  url1 = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + fName + "+" + lName + "&begin_date=20140101&api-key=" + auth.article_search_api_key;
  if(members.length > 1)
  {
      memberName = members[1].name;
      pos = memberName.search(" ");
      fName = memberName.slice(0, pos);
      lName = memberName.slice(pos + 1, memberName.length);
      
      url2 = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + fName + "+" + lName + "&begin_date20140101&api-key=" + auth.article_search_api_key;
      senatePage = true;
  }
  
  //first article search, done whether there are two members on page or not.
  $.ajax({
      url: url1,
      type: "get",
      dataType: "json",
      cache: true,
      success:function(json){
        articleArray = json.response.docs;

        //If the page has two members, then only 3 articles for the first member will be displayed in this ajax call
        var end = 5;
        if(senatePage) {
          end = 3;
        }
        for(var i = 0; i < end; i++)
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
          $('#articleSection').empty().append("<div class='error'>Error occurred contacting the API. Please reload the page to see news information.</div>");
      },
  });

  //If it is a senate page then another search for articles will be done for the other senator on the page
  //The articles are appended to the bottom of the list of articles on screen. This functionality can be
  //changed, but I did it this way because of the asynchronous behavior of the ajax calls
  if(senatePage)
  {
      $.ajax({
          url: url2,
          type: "get",
          dataType: "json",
          cache: true,
          success:function(json){

              json;
              articleArray2 = json.response.docs;
   
              for(var i = 0; i < 3; i++)
              {
                  $('#articleSection').append("<div class=\"well\">" + "<h2><a href=\"" + articleArray2[i].web_url + "\" target=\"_blank\">" 
                                              + articleArray2[i].headline.main + "</a><h2><p class=\"articleDetail\">"
                                              + articleArray2[i].byline.original + "<br>" 
                                              + articleArray2[i].pub_date + "<br></p><p class=\"snippet\">" 
                                              + articleArray2[i].snippet + "</p></div>");
              }
          
          },
          error:function(){
            $('#articleSection').empty().append("<div class='error'>Error occurred contacting the API. Please reload the page to see news information.</div>");
          },
      });
  }
}

function btnShowSearchOnClick() {
  $("#divSearch").slideDown("slow");
}

function btnHideOnClick() {
  $("#divSearch").slideUp("slow");
}

function getMemberBio() {
  var state = store.get("state").toUpperCase();
  var chamber = store.get("chamber").toLowerCase();
  var district = store.get("district").toLowerCase();
  var senator = store.get("senator").toLowerCase();

  var url;
      
  if (chamber == "house")
  {
    district = store.get("district").toLowerCase();
    url = "http://api.nytimes.com/svc/politics/" + auth.version + "/us/legislative/congress/members/" + chamber + "/" + state + "/" + district + "/current.json?api-key=" + auth.congress_api_key;
  }
  else
  {
    //district = "1";
    url = "http://api.nytimes.com/svc/politics/" + auth.version + "/us/legislative/congress/members/" + chamber + "/" + state + "/current.json?api-key=" + auth.congress_api_key;
  }

  $.ajax({
    url: url,
		type: "get",
		dataType: "json",
		cache: true,
    success: function(data) {
      console.log(data);
      $("#bio_name").empty();

      $.each(data["results"], function(i, result) {
        var full_name = result["name"].split(' ');
        member = {
          id: result["id"],
          name: full_name[0] + " " + full_name[full_name.length-1],
          role: result["role"],
          gender: result["gender"],
          party: result["party"],
          state: state, 
          chamber: chamber,
          district: result["district"],
          next_election: result["next_election"],
          expanded: false,
          loaded: false,
          favorite: false,
          fec_id: "",
          total_contributions: "$872,001",
          total_disbursements: "$20,638",
          total_from_individuals: "$459,024",
          total_from_pacs: "$201,377",
          total_receipts: "$680,992",
          total_refunds: "$458,882"
        };
        
        if (chamber == 'senate') {
          if (member.name.toLowerCase() == senator) {
            members[0] = member;
            $("#bio_name").text(member.name);
            showFavButton();
          }
        } else {
          members[0] = member;
          $("#bio_name").text(member.name);
          showFavButton();
        }
      });

      getCampaignFinance(0)
      getMemberInfo(members[0].id);
      displayArticles();
    },
    error: function() {
      $('#divBody').empty().append("<div class='error'>Error occurred contacting the API. Please reload the page to see information.</div>");
    },
  });
}

function btnFavoriteOnClick(i)
{
  var favs = store.get('favorites');

  if(!favs)
    favs = {};
  if(favs[members[0].name])
  {
    $("#spnFav" + i).attr('class', "glyphicon glyphicon-star-empty star");
    $("#spnFav" + i).attr('title', "Add to Favorites");
    delete favs[members[i].name];
  }
  else
  {
    favs[members[i].name] = members[i];
    $("#spnFav" + i).attr('class', "glyphicon glyphicon-star star");
    $("#spnFav" + i).attr('title', "Remove from Favorites");
  }

  store.set('favorites', favs);
  addFavs();
}

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

  // Add help information if no favorites
  if (content == "") {
    content = "<li class='info'>To add a Member of Congress to Favorites, click on the star next to their name on their personal page. \
              See Help for more details</li>"
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
  if(member.district)
    store.set("district", member.district.toString()); 
  else
    store.set("district", "1");
  store.set("senator", name);  
}

function showFavButton()
{

    var favs = store.get("favorites");
    var tooltip;
    var glyph;
    if(!favs)
    {
      favs = {};
    }
    
    var i = 0;

    if(favs[members[i].name])
    {
      tooltip = "Remove from Favorites";
      glyph = "glyphicon-star";
    }
    else
    {
      tooltip = "Add to Favorites"
      glyph = "glyphicon-star-empty";
    }
    $("#bio_name").append("<button id='btnFavorite" + i + "' title='" + tooltip + "' style='outline:0' class = 'btn btn-link btn-xs' onclick='btnFavoriteOnClick(" + i + ")'> \
                <span id='spnFav" + i + "' class='glyphicon " + glyph + " star' style='font-size:40px'></span></button></p>");
}

function renderMembers() {
  //for (var i = 0; i < members.length; i++) {
    var i = 0;
    var content = "<p><button id='btnMember" + i + "' style='outline:0' class='btn btn-link btn-xs' onclick='btnMemberOnClick(" + i + ")'> \
        <span id='spnMember" + i + "' class='glyphicon glyphicon-";
  
    if (members[0].expanded) 
      content = content + "collapse-down";
    else
      content = content + "expand";
    
    content += "' aria-hidden='true' style='font-size:18px'></span></button>&nbsp;&nbsp;<span style='font-size:18px'>Bio</span>";
                
    content = content + "<div id='divMemberDetail0'";
      
    if (members[0].expanded) 
      content = content + ">";
    else
      content = content + " style='display:none'>";
   
    if (members[0].dob != undefined && members[0].dob.length > 0)
      content = content + "<label>Date of Birth:&nbsp;&nbsp;&nbsp;</label><text>" + formatDate(members[0].dob) + "</text></br>";
    
    if (members[0].gender != undefined && members[0].gender.length > 0) {
      content = content + "<label>Gender:&nbsp;&nbsp;&nbsp;</label><text>";
        
      if (members[0].gender == "M")
        content = content + "Male</text><br/>";
      else
        content = content + "Female</text><br/>";
    }
    
    if (members[0].party != undefined && members[0].party.length > 0) {
      content = content + "<label>Party:&nbsp;&nbsp;&nbsp;</label><text>";
      
      if (members[0].party == "D")
        content = content + "Democrat</text><br/>";
      else
        content = content + "Republican</text><br/>";
    }
    
    if (members[0].role != undefined && members[0].role.length > 0)
      content = content + "<label>Role:&nbsp;&nbsp;&nbsp;</label><text>" + members[0].role + "</text><br/>";
    
    content = content + "<label>State:&nbsp;&nbsp;&nbsp;</label><text>" + store.get("state") + "</text><br/>";
    
    if (members[0].district != undefined && members[0].district.length > 0)
      content = content + "<label>District:&nbsp;&nbsp;&nbsp;</label><text>" + members[0].district + "</text><br/>";
    
    //if (members[0].most_recent_vote != undefined && members[0].most_recent_vote.length > 0)
    //  content = content + "<label>Most Recent Vote:&nbsp;&nbsp;&nbsp;</label><text>" + formatDate(members[0].most_recent_vote) + "</text><br/>";
    
    if (members[0].next_election != undefined && members[0].next_election.length > 0)
      content = content + "<label>Next Election Year:&nbsp;&nbsp;&nbsp;</label><text>" + members[0].next_election + "</text><br/>";
    
   if (members[0].total_contributions != undefined && members[0].total_contributions.length > 0)
      content = content + "<label>Total Contributions:&nbsp;&nbsp;&nbsp;</label><text>" + members[0].total_contributions + "</text><br/>";

    if (members[0].total_disbursements != undefined && members[0].total_disbursements.length > 0)
      content = content + "<text>&nbsp;&nbsp;&nbsp;From Individuals:&nbsp;&nbsp;&nbsp;</text>" + members[0].total_disbursements + "<br/>";

    if (members[0].total_from_pacs != undefined && members[0].total_from_pacs.length > 0)
      content = content + "<text>&nbsp;&nbsp;&nbsp;From PACS:&nbsp;&nbsp;&nbsp;</text>" + members[0].total_from_pacs + "<br/>";

    if (members[0].total_from_individuals != undefined && members[0].total_from_individuals.length > 0)
      content = content + "<text>&nbsp;&nbsp;&nbsp;Disbursements:&nbsp;&nbsp;&nbsp;</text>" + members[0].total_from_individuals + "<br/>";

    if (members[0].total_receipts != undefined && members[0].total_receipts.length > 0)
      content = content + "<text>&nbsp;&nbsp;&nbsp;Receipts:&nbsp;&nbsp;&nbsp;</text>" + members[0].total_receipts + "<br/>";

    if (members[0].total_refunds != undefined && members[0].total_refunds.length > 0)
      content = content + "<text>&nbsp;&nbsp;&nbsp;Refunds:&nbsp;&nbsp;&nbsp;</text>" + members[0].total_refunds + "<br/>";
    
    content = content + "<br/>";
    
    if (members[0].url != undefined && members[0].url.length > 0)
      content = content + "<a target='_blank' href='" + members[0].url + "'><span class='glyphicon glyphicon-home'></span></a>&nbsp;&nbsp;";
    
    if (members[0].twitter != undefined && members[0].twitter.length > 0)
      content = content + "<a target='_blank' href='https://twitter.com/" + members[0].twitter + "'><img src='img/twitter.png' style='height:24px; width:24px; padding-bottom:2px'></span></a>&nbsp;&nbsp;";
    
    if (members[0].facebook != undefined && members[0].facebook.length > 0)
      content = content + "<a target='_blank' href='https://facebook.com/" + members[0].facebook + "'><img src='img/facebook.png' style='height:24px; width:24px; padding-bottom:2px'></span></a>&nbsp;&nbsp;";
    
    if (members[0].youtube != undefined && members[0].youtube.length > 0)
      content = content + "<a target='_blank' href='https://youtube.com/" + members[0].youtube + "'><img src='img/youtube.png' style='height:24px; width:24px; padding-bottom:2px'></span></a>&nbsp;&nbsp;";
    
    content = content + "</div>";
    
    $("#divMember0").empty().append(content);
    
    if (members[0].party == "D")
      $("#divMember0").attr("class", "col-md-5 democrat");
    else if (members[0].party == "R")  
      $("#divMember0").attr("class", "col-md-5 republican");
    else
      $("#divMember0").attr("class", "col-md-5 default");
}

// Voting record and extra bio information
function getMemberInfo(member_id) {
  console.log(member_id);
  $.ajax({
    url: "http://api.nytimes.com/svc/politics/v3/us/legislative/congress/members/" + member_id + ".json?api-key=" + auth.congress_api_key,
    type: "GET", 
    dataType: "jsonp", 
    cache: true, 
    success: function(data) {
      var member = data.results[0];

      members[0].dob = member["date_of_birth"];
      members[0].url = member["url"];
      members[0].twitter = member["twitter_account"];
      members[0].facebook = member["facebook_account"];
      members[0].youtube = member["youtube_account"];
      members[0].most_recent_vote = member["most_recent_vote"];
      members[0].loaded = true;

      var roles = [];
      $.each(member["roles"], function(i, role) {
        member_role = {
          congress: role["congress"],
          chamber: role["chamber"],
          bills_sponsored: role["bills_sponsored"],
          bills_cosponsored: role["bills_cosponsored"],
          missed_votes_pct: role["missed_votes_pct"],
          votes_with_party_pct: role["votes_with_party_pct"]
        };
        roles[i] = member_role;
      });

      member_roles = {
        expanded: false,
        most_recent_vote: member.most_recent_vote,
        roles: roles
      };
         
      // getCampaignFinance(members[i]);   
        // renderMembers(i);
        // uncomment the console.log(members[i]) to see campaign finance being logged to console
        // will update it to index.html tomorrow
        //console.log(members[i])
        
      $("#spnMember0").attr("class", 'glyphicon glyphicon-collapse-down');
      $("#divMemberDetail0").slideDown("slow");
      
      renderMembers();      
      renderMemberVotes(member_roles);
    },
    error: function() {
      $('#divMember1').empty().show().append("<div class='error'>Error occurred contacting the API. Please reload the page to see voting record information.</div>");
    }
  });
}

function renderMemberVotes(member_roles){
  var exp_or_col = "expand";
  var show_content = " style='display:none'>";
  if (member_roles.expanded) {
    show_content = ">";
    exp_or_col = "collapse-down"
  }

  var content = "<p><button id='btnVote' style='outline:0' class='btn btn-link btn-xs' onclick='btnVoteOnClick()'> \
                <span id='spnVote' class='glyphicon glyphicon-"+ exp_or_col + "' aria-hidden='true' style='font-size:18px'></span> \
                </button>&nbsp;&nbsp;<span style='font-size:18px'>Voting Record</span></p>\
                <div id='divVoteDetail'" + show_content;

    if (member_roles.most_recent_vote != undefined && member_roles.most_recent_vote.length > 0) {
      content += "<label>Most Recent Vote:&nbsp;&nbsp;&nbsp;</label><text>&nbsp;&nbsp;&nbsp;" + formatDate(member_roles.most_recent_vote) + "</text></br>";
    }

  $.each(member_roles.roles, function(i, role) {

    content += "<label>";
    if (role.congress != undefined && role.congress.length > 0) {
      content += role.congress + "  ";
    } 

    if (role.chamber != undefined && role.chamber.length > 0) {
      content += role.chamber 
    } else {
      content += " Session ";
    }
    content += "&nbsp;&nbsp;&nbsp;</label></br>";

    var info_exists = false;
    if (role.bills_sponsored != undefined && role.bills_sponsored.length > 0) {
      content += "<text>&nbsp;&nbsp;&nbsp;Bills Sponsored:&nbsp;&nbsp;&nbsp;</text>" + role.bills_sponsored + "</br>";
      info_exists = true;
    }

    if (role.bills_cosponsored != undefined && role.bills_cosponsored.length > 0) {
      content += "<text>&nbsp;&nbsp;&nbsp;Bills Co-sponsored:&nbsp;&nbsp;&nbsp;</text>" + role.bills_cosponsored + "</br>";
      info_exists = true;
    }

    if (role.missed_votes_pct != undefined && role.missed_votes_pct.length > 0) {
      content += "<text>&nbsp;&nbsp;&nbsp;Missed Votes:&nbsp;&nbsp;&nbsp;</text>" + role.missed_votes_pct + "%</br>";
      info_exists = true;
    }

    if (role.votes_with_party_pct != undefined && role.votes_with_party_pct.length > 0) {
      content += "<text>&nbsp;&nbsp;&nbsp;Votes with Party:&nbsp;&nbsp;&nbsp;</text>" + role.votes_with_party_pct + "%</br>";
      info_exists = true;
    }

    if (info_exists == false) {
      content += "&nbsp;&nbsp;&nbsp;No Data Available</br>";
    }
  });

  $("#divMember1").append(content);
  if (members[0].party == "D")
    $("#divMember1").attr("class", "col-md-5 democrat");
  else if (members[0].party == "R")  
    $("#divMember1").attr("class", "col-md-5 republican");
  else
    $("#divMember1").attr("class", "col-md-5 default");
}

//collapsing function for the news articles section
function btnArticleOnClick(){
  if(document.getElementById("spnArticle").getAttribute("class") == "glyphicon glyphicon-expand")
  {
      $("#spnArticle").attr("class", "glyphicon glyphicon-collapse-down");
      $("#articleSection").slideDown("slow");
  }
  else
  {
      $("#spnArticle").attr("class", "glyphicon glyphicon-expand");
      $("#articleSection").slideUp("slow");
  }
}

// collapsing function for the bills section
function btnBillOnClick(){
  if(document.getElementById("spnBill").getAttribute("class") == "glyphicon glyphicon-expand") {
      $("#spnBill").attr("class", "glyphicon glyphicon-collapse-down");
      $("#billSection").slideDown("medium");

      if (bill_api_call == 0) {
        bill_api_call = 1;
        displayBills(members[0].id);
      }
  }
  else {
      $("#spnBill").attr("class", "glyphicon glyphicon-expand");
      $("#billSection").slideUp("fast");
  }
}

function btnVoteOnClick() {
  if (!member_roles.expanded) {
    member_roles.expanded = true;
    $("#spnVote").attr("class", 'glyphicon glyphicon-collapse-down');
    $("#divVoteDetail").slideDown("slow");
  }
  else {
    member_roles.expanded = false;
    $("#spnVote").attr("class", 'glyphicon glyphicon-expand');
    $("#divVoteDetail").slideUp("slow");
  }
}
 
function btnMemberOnClick() {
  if (members[0].expanded) {
    members[0].expanded = false;
    $("#spnMember0").attr("class", 'glyphicon glyphicon-expand');
    $("#divMemberDetail0").slideUp("slow");
  }
  else {
    members[0].expanded = true;
    $("#spnMember0").attr("class", 'glyphicon glyphicon-collapse-down');
    $("#divMemberDetail0").slideDown("slow");
  }
}

function btnSearchOnClick() {
  store.set("state", $("#cboState").val());
  store.set("chamber", $("#cboChamber").val());
  store.set("district", $("#cboDistrict").val());
  store.set("senator", $("#cboSenator").val());
}

function formatDate(date) {
  var arrDate = date.split("-");
  return arrDate[1] + "/" + arrDate[2] + "/" + arrDate[0];
}

function cboStateOnChange() {
  loadHouse();
  loadSenate();

  enableDisableFields();
}

function cboChamberOnChange() {
  loadHouse();
  loadSenate();

  if ($("#cboChamber").val().toLowerCase() == 'house') {
    $("#divSenator").hide();
    $("#cboSenator").hide();

    $("#divDistrict").show();
    $("#cboDistrict").show();
  } else if ($("#cboChamber").val().toLowerCase() == 'senate') {
    $("#divDistrict").hide();
    $("#cboDistrict").hide();

    $("#divSenator").show();
    $("#cboSenator").show();
  } else {
    $("#divDistrict").hide();
    $("#divSenator").hide();
    $("#cboDistrict").hide();
    $("#cboSenator").hide();
  }

  enableDisableFields();
}

function loadHouse() {
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
    $("#cboDistrict").append($("<option>", {
      value: i,
      text: i
    }));
  }
}

function loadSenate() {
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
