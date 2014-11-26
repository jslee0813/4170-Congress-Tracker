// API keys
var auth = {
    version: "",
    community_api_key: "",
    article_search_api_key: "",
}

$(document).ready(function() {
  if (!store.enabled) {
    alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.')
    return
  }
});

$(document).keydown(function(key) {
});

function btnSearchOnClick() {
  store.set("state", $("#cboState").val());
  store.set("chamber", $("#cboChamber").val());
  store.set("district", $("#cboDistrict").val());   
}