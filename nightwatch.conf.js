require('dotenv').config();

module.exports = {
  "src_folders" : ["./test/acceptance"],
  "output_folder" : "./test/acceptance-reports",
  "custom_commands_path" : "./test/acceptance/custom-commands",
  "custom_assertions_path" : "",
  "globals_path" : "./test/acceptance/globals.js",
  "page_objects_path" : "./test/acceptance/pages",
  
  "selenium" : {
    "start_process" : true,
    "server_path" : "/Users/vassilis/bin/selenium-server-standalone-2.53.0.jar",
    "log_path" : "",
    "host" : "127.0.0.1",
    "port" : 4444,
    "cli_args" : {
      "webdriver.chrome.driver" : "/Users/vassilis/bin/chromedriver"
    }  
  },
  
  "test_settings" : {
    "default" : {
      "launch_url" : require('./config').rootUrl,
      "selenium_port"  : 4444,
      "selenium_host"  : "localhost",
      "silent": true,
      "screenshots" : {
        "enabled" : false,
        "path" : ""
      },
      "exclude" : ["custom-commands/*.js","edit/*.js"],
      "desiredCapabilities": {
        "browserName": "chrome",
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