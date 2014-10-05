module.exports = {
  "src_folders" : ["./test/acceptance"],
  "output_folder" : "./test/acceptance-reports",
  "custom_commands_path" : "",
  "custom_assertions_path" : "",
  "globals_path" : "",
  
  "selenium" : {
    "start_process" : true,
    "server_path" : "/Users/vassilis/bin/selenium-server-standalone-2.43.1.jar",
    "log_path" : false,
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
    }
  }
}