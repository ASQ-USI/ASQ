const SessionEvent = db.model('SessionEvent');
const Answer = db.model('Answer');
const Session = db.model('Session');
const Question = db.model('Question');
module.exports = {
  handleSliderChange: function(socket, evt) {
      evt.data = evt.data || {};
      evt.data.user = socket.user._id;
      SessionEvent.create({
          session: socket.request.sessionId ,
          type: evt.type,
          data: evt.data
      });
  },
  handleQuestionSubmitted: function (socket, evt) {
    evt.data = evt.data || {};
    // Retrieving the current session so I can retrieve the presenter ID for retrieving the question ID
    const sessionId = socket.request.sessionId;
    // FIXME: Find a better way to do those things
    const currentSession = Session.findById(sessionId, function onSession(err, session) {
      if (err) return err;
      if (!session) return undefined;
      const presenterId = session.presenter;
      const questionData = {
        author: presenterId, 
        type: 'asq-text-input-q',
        'data.type': 'implicit-student-question'};
      Question.findOne(questionData, function onQuestion(err, question){
        if (err) return err;
        const questionId = question._id;
        // TODO: Save the answer
        // console.log(questionId);
      });
    });
  },

};