// require('dotenv').config();

module.exports = {
  "src_folders" : ["./test/acceptance"],
  "output_folder" : "./test/acceptance-reports",
  "custom_commands_path" : "./test/acceptance/custom-commands",
  "custom_assertions_path" : "",
  "globals_path" : "./test/acceptance/globals.js",
  "page_objects_path" : "./test/acceptance/pages",
  
  "selenium" : {
    "start_process" : true,
    "server_path" : "xvfb-run start-selenium",
    "start_session" : true,
    "log_path" : "./test/acceptance-reports",
    "cli_args" : {
      "webdriver.chrome.driver" : "node_modules/chromedriver/lib/chromedriver/chromedriver"
    }  
  },
  
  "test_settings" : {
    "default" : {
      "launch_url" : require('./config').rootUrl,
      "silent": true,
      "screenshots" : {
        "enabled" : false,
        "path" : ""
      },
      "exclude" : ["custom-commands/*.js","edit/*.js"],
      "desiredCapabilities": {
        "browserName": "chrome",
        // See http://stackoverflow.com/questions/29540320/unable-to-execute-nightwatch-tests-on-chrome-using-linux
        "chromeOptions" : { "args" : ["--no-sandbox"] },
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    },
    
    "firefox" : {
      "desiredCapabilities": {
        "browserName": "firefox",
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    },

    "safari" : {
      "desiredCapabilities" : {
        "browserName" : "safari",
        "javascriptEnabled" : true,
        "acceptSslCerts" : true
      }
    }
  }
}
