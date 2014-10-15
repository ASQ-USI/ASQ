module.exports = (function() {
  var dust = require("dust");
  // ../views/shared/alEntry.dust
  (function() {
    dust.register("alEntry", body_0);

    function body_0(chk, ctx) {
      return chk.write("<li class=\"al-entry\" id=\"").reference(ctx._get(false, ["user", "id"]), ctx, "h").write("\" data-join-date=\"").reference(ctx._get(false, ["user", "joinDate"]), ctx, "h").write("\"><div class=\"al-nick\"><div class=\"al-nick-lbl\">").reference(ctx._get(false, ["user", "screenName"]), ctx, "h").write("</div><div class=\"al-score\">").reference(ctx._get(false, ["user", "score"]), ctx, "h").write("</div><div class=\"al-rank\">#").reference(ctx._get(false, ["user", "rank"]), ctx, "h").write("</div><div class=\"al-time\">").reference(ctx._get(false, ["user", "totalTime"]), ctx, "h").write("</div></div><!-- end div.cp-access-nick--><div class=\"al-timeline\">").section(ctx._get(false, ["userQuestions"]), ctx, {
        "block": body_1
      }, null).write("</div><!-- end div.cp-access-timeline--></li>");
    }

    function body_1(chk, ctx) {
      return chk.write("<div class=\"al-timeline-answers al-").reference(ctx._get(false, ["answered"]), ctx, "h").write("\" data-question-id='").reference(ctx._get(false, ["id"]), ctx, "h").write("' style=\"width:").reference(ctx._get(false, ["questionWidth"]), ctx, "h").write("%;\"><div class=\"al-timestamp al-start\">0s</div><div class=\"al-timestamp al-finish\">3m5s</div></div>");
    }
    return body_0;
  })();
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
  // ../views/shared/presentationThumb.dust
  (function() {
    dust.register("presentationThumb", body_0);

    function body_0(chk, ctx) {
      return chk.write("<div class=\"thumb-container\" id=\"").reference(ctx._get(false, ["_id"]), ctx, "h").write("\" data-sort-position=\"").reference(ctx._get(false, ["position"]), ctx, "h").write("\"><div class=\"flipbox\"><div class=\"thumb-info\" ><!--       <div class=\"bg\" style=\"background-image: url('/slides/thumbs/").reference(ctx._get(false, ["_id"]), ctx, "h").write("/0-thumb.png')\"> </div> --><div class=\"thumb-bg\" style=\"background-image: url('http://placehold.it/240x175')\"></div><h4>").reference(ctx._get(false, ["title"]), ctx, "h").write("</h4>").exists(ctx._get(false, ["live"]), ctx, {
        "block": body_1
      }, null).write("</div><div class=\"thumb-actions\"><a href=\"#remove\" class=\"remove\">&times;</a><div class=\"thumb-buttons-container\"><div class=\"thumb-buttons\">").exists(ctx._get(false, ["live"]), ctx, {
        "else": body_2,
        "block": body_3
      }, null).write("<a href=\"/").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("/presentations/").reference(ctx._get(false, ["_id"]), ctx, "h").write("/stats\" class=\"btn btn-info\"><span class=\"glyphicon glyphicon-signal icon-white\"> </span> Show Statistics</a><a href=\"/").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("/presentations/").reference(ctx._get(false, ["_id"]), ctx, "h").write("/edit/\" class=\"btn btn-success\"><span class=\"glyphicon glyphicon-pencil icon-white\"> </span> Edit Presentation</a></div></div><div class=\"thumb-dates\"><p class=\"last-session\"><span class=\"glyphicon glyphicon-play\"></span> ").reference(ctx._get(false, ["lastSession"]), ctx, "h").write("</p><p class=\"last-edit\"><span class=\"glyphicon glyphicon-pencil\" ></span> ").reference(ctx._get(false, ["lastEdit"]), ctx, "h").write("</p></div></div></div></div>");
    }

    function body_1(chk, ctx) {
      return chk.write("<div class='thumb-live-container'><div class='thumb-live'>live</div></div>");
    }

    function body_2(chk, ctx) {
      return chk.write("<div class=\"btn-group\"><!-- boiler jQuery --><a href=\"#\" class=\"btn btn-primary start\" data-username=\"").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("\" data-id=\"").reference(ctx._get(false, ["_id"]), ctx, "h").write("\" data-authLevel=\"public\"><span class=\"glyphicon glyphicon-play icon-white\"> </span> Start</a><button class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"caret\"></span></button><ul class=\"dropdown-menu pull-right\"><li><!-- boiler jQuery --><a href=\"#\" class=\"start\" data-username=\"").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("\" data-id=\"").reference(ctx._get(false, ["_id"]), ctx, "h").write("\" data-authLevel=\"public\">Public Presentation</a></li><li><!-- boiler jQuery --><a href=\"#\" class=\"start\" data-username=\"").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("\" data-id=\"").reference(ctx._get(false, ["_id"]), ctx, "h").write("\" data-authLevel=\"anonymous\">Anonymous Presentation</a></li><li><!-- boiler jQuery --><a href=\"#\" class=\"start\" data-username=\"").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("\" data-id=\"").reference(ctx._get(false, ["_id"]), ctx, "h").write("\" data-authLevel=\"private\">Private Presentation</a></li><li class=\"divider\"></li><li><a href=\"#\" class=\"start\" data-username=\"").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("\" data-id=\"").reference(ctx._get(false, ["_id"]), ctx, "h").write("\" data-authLevel=\"public\" data-flow=\"self\">Self flow</a></li></ul></div>");
    }

    function body_3(chk, ctx) {
      return chk.write("<div class=\"btn-group\"><a href=\"#\" class=\"btn btn-danger btn-thumb-small stop\" data-username=\"").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("\" data-id=\"").reference(ctx._get(false, ["_id"]), ctx, "h").write("\" data-authLevel=\"public\"><span class=\"glyphicon glyphicon-stop icon-white\"> </span> Stop</a><div class=\"btn-group btn-thumb-small\"><a href=\"/").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("/presentations/").reference(ctx._get(false, ["_id"]), ctx, "h").write("/live/").reference(ctx._get(false, ["live"]), ctx, "h").write("/?role=presenter&view=presentation\" class=\"btn btn-primary\"><span class=\"glyphicon glyphicon-picture\"> </span> Join</a><button class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"caret\"></span></button><ul class=\"dropdown-menu pull-right\"><li><a href=\"/").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("/presentations/").reference(ctx._get(false, ["_id"]), ctx, "h").write("/live/").reference(ctx._get(false, ["live"]), ctx, "h").write("/?role=presenter&view=presentation\">Join (presenter)</a></li><li><a href=\"/").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("/presentations/").reference(ctx._get(false, ["_id"]), ctx, "h").write("/live/").reference(ctx._get(false, ["live"]), ctx, "h").write("/?role=viewer&view=presentation\">Join (viewer)</a></li><li><a href=\"/").reference(ctx._get(false, ["params", "username"]), ctx, "h").write("/presentations/").reference(ctx._get(false, ["_id"]), ctx, "h").write("/live/").reference(ctx._get(false, ["live"]), ctx, "h").write("/?role=presenter&view=ctrl\">Control panel</a></li></ul></div></div>");
    }
    return body_0;
  })();

})();