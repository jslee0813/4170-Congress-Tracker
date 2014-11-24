// API keys
var auth = {
    version: "",
    community_api_key: "",
    article_search_api_key: "",
}

var comments = [];
var offset = -1;

$(document).ready(function() {
});

$(document).keydown(function(key) {
});


function btnSearchOnClick() {
  $("#divSearch").slideDown("slow");
}

function btnHideOnClick() {
  $("#divSearch").slideUp("slow");
}