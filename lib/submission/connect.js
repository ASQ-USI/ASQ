var AnswerProgress = db.model('AnswerProgress');

function getCurrentProgresses(session) {
  var sid = session._id;
  var exercises = session.active
  return AnswerProgress.find({
    session  : session,
    exercise : { $in : exercises }
  }, { lean : true }).exec();
}