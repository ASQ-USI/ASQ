exports.command = function(file) {
  var browser = this;

  browser
     .page.upload().navigate();
   browser
     .page.upload().presentationUpload(file)

  return browser;
};
