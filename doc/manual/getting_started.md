## Table of Contents

[Installation](#installation)

[Creating an account](#creating-an-account)

[Installing and Activating question type plugins](#installing-and-activating-question-type-plugins)

[Your first presentation](#your-first-presentation)

##Installation
Make sure you have install ASQ following our [installation guide](../install/installation.md)

##Creating an account
1. Visit the root URL of your installation.
2. Click 'sign up for ASQ'.
3. Fill in the form and the then click 'Create account'.
You have successfully created your first user.

##Installing and activating question type plugins
By default the only enabled plugins are `asq-settings` and `asq-exercise`. Depending on the question types your users use in their presentations, you will need to install and enable one or more question type plugins.

### 1. Download a question type plugin.
The vast majority of question type plugins can be found under the [ASQ-USI-Elements](https://github.com/ASQ-USI-Elements/) Github organization. You can download a plugin either using the git clone command

```bash
git clone https://github.com/ASQ-USI-Elements/<repo-name>
```

or by using Github's `Download ZIP` button on the repository's page.

### 2. Move to the `plugins` directory.
Move the downloaded directory to the `plugins` directory of your ASQ installation

### 3. Install dependencies and activation
a. Go to `/<username>/settings/plugins` on your ASQ website. You should be able to see your new plugin under the plugins list.
b. Click `install` to install the plugin's dependencies and/or `activate` to activate it. 
__Pro tip__: You can click directly `activate` to install and activate a plugin at once.


## Your first presentation

### 1. Getting the presentation files
1. Download an example presentation that contains examples of various question types from [here](https://github.com/ASQ-USI-Elements/examples/tree/master/SamplePresentation)
2. Modify it to suit your needs
3. Install dependencies with
```bash
# change '/presentation/dir' with the path to your presentation
cd /presentation/dir
bower install
```

### 2. Upload your presentation
1. Compress your presentation into a zip file.
2. Log into ASQ.
3. Click `upload` and upload your presentation.

#### Uploading through curl
Sometimes, especially when testing a new presentation, uploading a presentation through the form can be tedious. We're working to make this a less painful process but for the time being you can also use curl. You can see the command to execute in the `/upload` page (you should be logged in).

### 3. Start your presentation
1. Go to your presentations, Click on the presentation you want to start and click on the 'start' button.
2. Users can connect on your presentation by going to `http(s)://<your_host>:<your_port>/<your_username>/live`
3. That's it!
