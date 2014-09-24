##Installation
Make sure you have install ASQ following our [installation guide](doc/install/installation.md)

## Your first presentation
1. Download an example presentation that contains questions in the asq-microformat from [here](https://github.com/ASQ-USI/asq-microformat/tree/master/examples/SamplePresentation)
2. Modify it to suit your needs
3. Compress it in a zip file.  

## Create an account and upload your presentation
1. Create an account by visiting the root URL of your installation and clicking 'sign up'.
2. After the sign up process is complete, click `upload` and upload your presentation

### uploading through curl
Sometimes when you want to make tests uploading a presentation all the time can be tedious. We're working to make this a less painful process but for the time being you can also use curl. The general format is:

    curl -i --cookie "asq.sid=<your-cookie-value>"  -F upload=@<localfile> https://<host>/:username/presentations

For example:

    curl -i --cookie "asq.sid=0123456789abcdefghijklmnopqrstuvwxyz"  -F upload=@/home/vassilis/presentation.zip https://asq/vassilis/presentations

## Start your presentation
1. Go to your presentations, Click on the presentation you want to start and click on the 'start' button.
2. Users can connect on your presentation by going to http(s)://<your_host>:<your_port>/<your_username>/live
3. That's it!