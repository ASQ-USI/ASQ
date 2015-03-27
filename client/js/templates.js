module.exports = (function() {
  var dust = require("dust");
  // ../views/shared/alEntry.dust
  (function() {
    dust.register("alEntry", body_0);

    function body_0(chk, ctx) {
      return chk.w("<li class=\"al-entry").x(ctx.getPath(false, ["user", "completed"]), ctx, {
        "block": body_1
      }, {}).w("\" id=\"").f(ctx.getPath(false, ["user", "id"]), ctx, "h").w("\" data-join-date=\"").f(ctx.getPath(false, ["user", "joinDate"]), ctx, "h").w("\"><div class=\"al-nick\"><div class=\"al-nick-lbl\">").f(ctx.getPath(false, ["user", "screenName"]), ctx, "h").w("</div><div class=\"al-score\">").f(ctx.getPath(false, ["user", "score"]), ctx, "h").w("</div><div class=\"al-rank\">#").f(ctx.getPath(false, ["user", "rank"]), ctx, "h").w("</div><div class=\"al-time\" data-raw-total-time=\"").f(ctx.getPath(false, ["user", "rawTotalTime"]), ctx, "h").w("\">").f(ctx.getPath(false, ["user", "totalTime"]), ctx, "h").w("</div></div><!-- end div.cp-access-nick--><div class=\"al-timeline\">").s(ctx.get(["userQuestions"], false), ctx, {
        "block": body_2
      }, {}).w("</div><!-- end div.cp-access-timeline--></li>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("completed");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("<div class=\"al-timeline-answers al-").f(ctx.get(["answered"], false), ctx, "h").w("\" data-question-id='").f(ctx.get(["id"], false), ctx, "h").w("' style=\"width:").f(ctx.get(["questionWidth"], false), ctx, "h").w("%;\"></div>");
    }
    body_2.__dustBody = !0;
    return body_0;
  })();
  // ../views/shared/alert.dust
  (function() {
    dust.register("alert", body_0);

    function body_0(chk, ctx) {
      return chk.s(ctx.get(["alerts"], false), ctx, {
        "block": body_1
      }, {});
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class=\"alert alert-").f(ctx.get(["type"], false), ctx, "h").w(" ").x(ctx.get(["dismissible"], false), ctx, {
        "block": body_2
      }, {}).w("\">").x(ctx.get(["dismissible"], false), ctx, {
        "block": body_3
      }, {}).f(ctx.get(["message"], false), ctx, "h").w("<div>");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("alert-dismissible");
    }
    body_2.__dustBody = !0;

    function body_3(chk, ctx) {
      return chk.w("<button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>");
    }
    body_3.__dustBody = !0;
    return body_0;
  })();
  // ../views/shared/presentationThumb.dust
  (function() {
    dust.register("presentationThumb", body_0);

    function body_0(chk, ctx) {
      return chk.w("<div class=\"thumb\" id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" data-sort-position=\"").f(ctx.get(["position"], false), ctx, "h").w("\"><a href=\"#remove\" class=\"remove show-on-thumb-hover\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Delete presentation\">&times;</a>").x(ctx.get(["live"], false), ctx, {
        "block": body_1
      }, {}).w("<div class=\"thumb-img\" style=\"background-image: url('http://placehold.it/260x175')\"></div><div class=\"thumb-controls layout horizontal center\">").x(ctx.get(["live"], false), ctx, {
        "else": body_2,
        "block": body_3
      }, {}).w("<div class=\"flex layout horizontal justified\"><a class=\"btn-thumb show-on-thumb-hover\" href=\"/").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("/presentations/").f(ctx.get(["_id"], false), ctx, "h").w("/settings\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Settings\"><i class=\"fa fa-cog\"></i></a><a class=\"btn-thumb show-on-thumb-hover\" href=\"/").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("/presentations/").f(ctx.get(["_id"], false), ctx, "h").w("/edit/\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Edit presentation\"><i class=\"fa fa-pencil\"></i></a><a class=\"btn-thumb show-on-thumb-hover\" href=\"/").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("/presentations/").f(ctx.get(["_id"], false), ctx, "h").w("/stats\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Show statistics\"><i class=\"fa fa-signal\"> </i></a></div></div><div class=\"thumb-text\"><span class=\"thumb-title\">").f(ctx.get(["title"], false), ctx, "h").w("</span></div><div class=\"thumb-dates layout horizontal justify\"><p class=\"last-session flex\"><span class=\"glyphicon glyphicon-play\"></span> ").x(ctx.get(["lastSession"], false), ctx, {
        "else": body_4,
        "block": body_5
      }, {}).w("</p><p class=\"last-edit flex\"><span class=\"glyphicon glyphicon-pencil\" ></span> ").f(ctx.get(["lastEdit"], false), ctx, "h").w("</p></div>  </div>");
    }
    body_0.__dustBody = !0;

    function body_1(chk, ctx) {
      return chk.w("<div class='thumb-live-container hide-on-thumb-hover'><div class='thumb-live'>live</div></div>");
    }
    body_1.__dustBody = !0;

    function body_2(chk, ctx) {
      return chk.w("<div class=\"flex layout horizontal justified\"><a class=\"btn-thumb show-on-thumb-hover\" href=\"#\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Public Presentation\" data-username=\"").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("\" data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" data-authLevel=\"public\"><i class=\"fa fa-group\"></i></a><a class=\"btn-thumb show-on-thumb-hover\" href=\"#\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Anonymous Presentation\" data-username=\"").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("\" data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" data-authLevel=\"anonymous\"><i class=\"fa fa-user\"></i></a><a class=\"btn-thumb show-on-thumb-hover\" href=\"#\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Private Presentation\" data-username=\"").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("\" data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" data-authLevel=\"private\"><i class=\"fa fa-user-secret\"></i></a></div><a class=\"btn-thumb btn-start btn-thumb-playback\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Start presentation\" href=\"#\" data-username=\"").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("\" data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" data-authLevel=\"public\"><i class=\"fa fa-play\"></i></a>");
    }
    body_2.__dustBody = !0;

    function body_3(chk, ctx) {
      return chk.w("<div class=\"flex\"><a class=\"btn-thumb show-on-thumb-hover\" href=\"/").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("/presentations/").f(ctx.get(["_id"], false), ctx, "h").w("/live/").f(ctx.get(["live"], false), ctx, "h").w("/?role=presenter&view=ctrl\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"go to presenter control\"><i class=\"fa fa-dashboard\"></i></a><a class=\"btn-thumb show-on-thumb-hover\" href=\"/").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("/presentations/").f(ctx.get(["_id"], false), ctx, "h").w("/live/").f(ctx.get(["live"], false), ctx, "h").w("/?role=presenter&view=presentation\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Join as presenter\"><i class=\"fa fa-graduation-cap\"></i></a><a class=\"btn-thumb show-on-thumb-hover\" href=\"/").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("/presentations/").f(ctx.get(["_id"], false), ctx, "h").w("/live/").f(ctx.get(["live"], false), ctx, "h").w("/?role=viewer&view=presentation\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Join as viewer\"><i class=\"fa fa-group\"></i></a></div><a class=\"btn-thumb btn-stop btn-thumb-playback\"  data-toggle=\"tooltip\" data-placement=\"top\" title=\"Stop presentation\" href=\"#\" data-username=\"").f(ctx.getPath(false, ["params", "username"]), ctx, "h").w("\" data-id=\"").f(ctx.get(["_id"], false), ctx, "h").w("\" data-authLevel=\"public\"><i class=\"fa fa-stop\"></i></a>");
    }
    body_3.__dustBody = !0;

    function body_4(chk, ctx) {
      return chk.w("No sessions yet");
    }
    body_4.__dustBody = !0;

    function body_5(chk, ctx) {
      return chk.f(ctx.get(["lastSession"], false), ctx, "h");
    }
    body_5.__dustBody = !0;
    return body_0;
  })();

})();