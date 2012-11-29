function checkUsername(input) {
    var username = input.value;
    if (username!="") {
        var xhr = new XMLHttpRequest();
            xhr.open('GET', '/checkusername/' + username, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status == 200) {
                    var html = [];
                    var reply = xhr.responseText;
                    if (reply==1) {
                        document.getElementById('checkuser').innerHTML="not available";
                    } else {
                        document.getElementById('checkuser').innerHTML="available";
                    }
                }
            }
            xhr.send(null);
            return false;
    } else {
        document.getElementById('checkuser').innerHTML="";
    }
    
}
