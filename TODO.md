* loggers: have a look at the option of morgan. Currently just using dev.
* 


##Presentation Adapters
Serverside presentation adapters should be responsible for saving and retrieving the last known state of the presentation (Active slide, substeps etc), ioConnect (lib/socket/handlers) should use the presentation adapter (maybe through a hook) to retrieve the presentation info and send it back to the server

##Plugin
* Log error messages per plugin
* put shared code for plugins like `getBooleanValueOfBooleanAttribute` to a utilities package
* make all functions have a name
* presentations/presentation/handler: remove old `livePresentation`
* slideshow: remove `questionsPerSlide` if not used


##Socket
* REMOVE winston logger for sockets. They have their own now
* nomenclature for event names
* client handling of socket errors


- Process errors at different levels of the stack to make them more meaningful. For example a mongoose validation error in the upload is getting caught at presentation/handlers.js:uploadPresentation(). It's very hard to understand where the error came from. 
- simple-errors package or custom errors? decide
- user either config paths or ASQ paths
_ 'PROTECT' against this: https://thecodebarbarian.wordpress.com/2014/09/04/defending-against-query-selector-injection-attacks/
- rename `resubmit` in models/exercise.js to `allowResubmit`
- create a mongoose function for the slideshow model to return the paths for the files and remove path calls from the rest of the codebase
- check what happens if the someone goes for a Url of a presentation that doesn't exist
- Make stats more customizable
- Reset stats.dust
- IO bug
- auth bug
- test sockets
- socket reconnect
- FIX: remember me
- ADD" delete presentations
- write mongo script to check consistency of database
- make sure that the parser maintains all the attributes of questions
- check parameters that are expected from request and response objects
- in getLivePresentations add the live url to the session not the slideshow
- make correct answers green
- cheerio 0.12.2 bug extra hyphens
- filter javascript in submissions
-Front end Tests
 - click start presentation button
 - Delete session
 - checkusername/ should be performed every 100ms delay
 - check email address the same way we do with check usename
 - FIX: when someone clicks upload with nothing we get an error
 - FIX: if public page doesn't exist do not show it. e.g. http://localhost:3000/register/ \
 - FIX: show a more helpful message if redis-server is not up
