// API keys
var auth = {
  version: "v3",
  article_search_api_key: "7089b4dbf0dbfe27a732e031b0d1c4db:2:70134955",
  campaign_finance_api_key: "a0010dc488c36308d3fef83ccfa40e0e:11:70134955",
  congress_api_key: "8572e441d94d60fe07cab9d6baad0af8:16:70134955",
  times_newswire_api_key: "2aec92c5eb73d8c60d8b594c39a4867e:1:70134955",
}

var members = [];

$(document).ready(function() {
  getMemberBio();
});

$(document).keydown(function(key) {
});

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
  var url;
      
  if (chamber == "house")
    url = "http://api.nytimes.com/svc/politics/" + auth.version + "/us/legislative/congress/members/" + chamber + "/" + state + "/" + district + "/current.json?api-key=" + auth.congress_api_key;
  else
    url = "http://api.nytimes.com/svc/politics/" + auth.version + "/us/legislative/congress/members/" + chamber + "/" + state + "/current.json?api-key=" + auth.congress_api_key;

  $.ajax({
    url: url,
		type: "get",
		dataType: "json",
		cache: true,
    success: function(data) {
      $.each(data["results"], function(i, result) {
        member = {
          id: result["id"],
          name: result["name"],
          role: result["role"],
          gender: result["gender"],
          party: result["party"],
          district: result["district"],
          expanded: false,
          loaded: false,
          favorite: false,
        };
        
        members[i] = member;        
      });
      
      renderMembers(-1);      
    },
    error: function() {
      $("#divBody").empty().append("2 A problem occurred during loads. Please try again a few seconds later.");
    },
  });
}

function renderMembers(index) {
  for (var i = 0; i < members.length; i++) {
    var content = "<p><button id='btnMember" + i + "' style='outline:0' class='btn btn-link btn-xs' onclick='btnMemberOnClick(" + i + ")'> \
        <span id='spnMember" + i + "' class='glyphicon glyphicon-";
  
    if (index != i && members[i].expanded) 
      content = content + "collapse-down";
    else
      content = content + "expand";
    
    content = content + "' aria-hidden='true' style='font-size:18px'></span></button>&nbsp;&nbsp;<span style='font-size:18px'>" + members[i].name + "</span></p>";
    content = content + "<div id='divMemberDetail" + i + "'";
      
    if (index != i && members[i].expanded) 
      content = content + ">";
    else
      content = content + " style='display:none'>";
   
    if (members[i].dob != undefined && members[i].dob.length > 0)
      content = content + "<label>Date of Birth:&nbsp;&nbsp;&nbsp;</label><text>" + formatDate(members[i].dob) + "</text></br>";
    
    if (members[i].gender != undefined && members[i].gender.length > 0) {
      content = content + "<label>Gender:&nbsp;&nbsp;&nbsp;</label><text>";
        
      if (members[i].gender == "M")
        content = content + "Male</text><br/>";
      else
        content = content + "Female</text><br/>";
    }
    
    if (members[i].party != undefined && members[i].party.length > 0) {
      content = content + "<label>Party:&nbsp;&nbsp;&nbsp;</label><text>";
      
      if (members[i].party == "D")
        content = content + "Democrat</text><br/>";
      else
        content = content + "Republican</text><br/>";
    }
    
    if (members[i].role != undefined && members[i].role.length > 0)
      content = content + "<label>Role:&nbsp;&nbsp;&nbsp;</label><text>" + members[i].role + "</text><br/>";
    
    content = content + "<label>State:&nbsp;&nbsp;&nbsp;</label><text>" + store.get("state") + "</text><br/>";
    
    if (members[i].district != undefined && members[i].district.length > 0)
      content = content + "<label>District:&nbsp;&nbsp;&nbsp;</label><text>" + members[i].district + "</text><br/>";
    
    if (members[i].most_recent_vote != undefined && members[i].most_recent_vote.length > 0)
      content = content + "<label>Most Recent Vote:&nbsp;&nbsp;&nbsp;</label><text>" + formatDate(members[i].most_recent_vote) + "</text><br/>";
    
    content = content + "<br/>";
    
    if (members[i].url != undefined && members[i].url.length > 0)
      content = content + "<a target='_blank' href='" + members[i].url + "'><span class='glyphicon glyphicon-home'></span></a>&nbsp;&nbsp;";
    
    if (members[i].twitter != undefined && members[i].twitter.length > 0)
      content = content + "<a target='_blank' href='https://twitter.com/" + members[i].twitter + "'><img src='img/twitter.png' style='height:24px; width:24px; padding-bottom:2px'></span></a>&nbsp;&nbsp;";
    
    if (members[i].facebook != undefined && members[i].facebook.length > 0)
      content = content + "<a target='_blank' href='https://facebook.com/" + members[i].facebook + "'><img src='img/facebook.png' style='height:24px; width:24px; padding-bottom:2px'></span></a>&nbsp;&nbsp;";
    
    if (members[i].youtube != undefined && members[i].youtube.length > 0)
      content = content + "<a target='_blank' href='https://youtube.com/" + members[i].youtube + "'><img src='img/youtube.png' style='height:24px; width:24px; padding-bottom:2px'></span></a>&nbsp;&nbsp;";
    
    content = content + "</div>";
    
    $("#divMember" + i).empty().append(content);
    
    if (members[i].party == "D")
      $("#divMember" + i).attr("class", "col-md-5 democrat");
    else if (members[i].party == "R")  
      $("#divMember" + i).attr("class", "col-md-5 republican");
    else
      $("#divMember" + i).attr("class", "col-md-5 default");
  }  
}

function btnMemberOnClick(i) {
  if (!members[i].loaded) {
    $.ajax({          
      url: "http://api.nytimes.com/svc/politics/" + auth.version + "/us/legislative/congress/members/" + members[i].id + ".json?api-key=" + auth.congress_api_key,
      type: "get",
      dataType: "json",
      cache: true,
      success: function(data) {
        members[i].dob = data["results"][0]["date_of_birth"];
        members[i].url = data["results"][0]["url"];
        members[i].twitter = data["results"][0]["twitter_account"];
        members[i].facebook = data["results"][0]["facebook_account"];
        members[i].youtube = data["results"][0]["youtube_account"];
        members[i].most_recent_vote = data["results"][0]["most_recent_vote"];
        members[i].loaded = true;
        
        if (members[i].expanded)
          members[i].expanded = false;
        else
          members[i].expanded = true;
          
        renderMembers(i);
        
        $("#spnMember" + i).attr("class", 'glyphicon glyphicon-collapse-down');
        $("#divMemberDetail" + i).slideDown("slow");
      },   
      error: function() {
        $("#divBody").empty().append("1 A problem occurred during loads. Please try again a few seconds later.");
      },
    });
  }
  else {
    if (members[i].expanded) {
      members[i].expanded = false;
      $("#spnMember" + i).attr("class", 'glyphicon glyphicon-expand');
      $("#divMemberDetail" + i).slideUp("slow");
    }
    else {
      members[i].expanded = true;
      $("#spnMember" + i).attr("class", 'glyphicon glyphicon-collapse-down');
      $("#divMemberDetail" + i).slideDown("slow");
    }
  }
}

function btnSearchOnClick() {
  store.set("state", $("#cboState").val());
  store.set("chamber", $("#cboChamber").val());
  store.set("district", $("#cboDistrict").val());   
}

function formatDate(date) {
  var arrDate = date.split("-");
  return arrDate[1] + "/" + arrDate[2] + "/" + arrDate[0];
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
    $("#cboDistrict").append($("<option>", {
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