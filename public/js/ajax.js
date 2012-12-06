var usernameOk = false;
var emailOk = false;
var pwdOk = false;

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
                        document.getElementById('checkuser').innerHTML='Not available';
                        document.getElementById("groupUsername").setAttribute("class", "control-group error");
                        usernameOk = false;

                    } else {
                        document.getElementById('checkuser').innerHTML='<i class="icon-ok"></i>';
                        document.getElementById("groupUsername").setAttribute("class", "control-group");
                         usernameOk = true;

                    }
                }
            }
            checkAllOk();
            xhr.send(null);
            return false;
    } else {
        document.getElementById('checkuser').innerHTML="";
    }
    checkAllOk();
}

function validateMail() {
 
   var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
   var address = document.getElementById('inputEmail').value;
   if(reg.test(address) == false) {
 
       document.getElementById('checkmail').innerHTML='Not valid';
       document.getElementById("groupEmail").setAttribute("class", "control-group error");
       emailOk = false;
   }else{
   		document.getElementById('checkmail').innerHTML='<i class="icon-ok"></i>';
        document.getElementById("groupEmail").setAttribute("class", "control-group");
        emailOk = true;
   }
   checkAllOk();
}

function vaildatePassword(){
	
	var pwd1 = document.getElementById('inputPassword').value;
	var pwd2 = document.getElementById('inputRepeatPassword').value;
	
	if(pwd1 === pwd2){
		document.getElementById('checkpwd').innerHTML='<i class="icon-ok"></i>';
		document.getElementById('checkpwd2').innerHTML='<i class="icon-ok"></i>';
        document.getElementById("groupPassword1").setAttribute("class", "control-group");
        document.getElementById("groupPassword2").setAttribute("class", "control-group");
        pwdOk = true;
	}else{
		document.getElementById('checkpwd').innerHTML=" ";
		document.getElementById('checkpwd2').innerHTML="Mismatch!";
       document.getElementById("groupPassword1").setAttribute("class", "control-group error");
       document.getElementById("groupPassword2").setAttribute("class", "control-group error");
       pwdOk = false;
	}
	checkAllOk();
}

function checkAllOk(){
	if(pwdOk && emailOk && usernameOk ){
		
		$('#createAccount').removeClass("disabled");
		$('#createAccount').disabled = false;
	}else{
		$('#createAccount').addClass("disabled");
		$('#createAccount').disabled = true;
	}
}
