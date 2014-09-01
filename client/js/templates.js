module.exports = (function() {
  var dust = require("dust");
  // ../views/shared/alert.dust
  (function() {
    dust.register("alert", body_0);

    function body_0(chk, ctx) {
      return chk.section(ctx._get(false, ["alerts"]), ctx, {
        "block": body_1
      }, null);
    }

    function body_1(chk, ctx) {
      return chk.write("<div class=\"alert alert-").reference(ctx._get(false, ["type"]), ctx, "h").write(" ").exists(ctx._get(false, ["dismissible"]), ctx, {
        "block": body_2
      }, null).write("\">").exists(ctx._get(false, ["dismissible"]), ctx, {
        "block": body_3
      }, null).reference(ctx._get(false, ["message"]), ctx, "h").write("<div>");
    }

    function body_2(chk, ctx) {
      return chk.write("alert-dismissible");
    }

    function body_3(chk, ctx) {
      return chk.write("<button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>");
    }
    return body_0;
  })();

})();