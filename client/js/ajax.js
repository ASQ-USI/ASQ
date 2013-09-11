var usernameOk = false;
var emailOk = false;
var pwdOk = false;

// var isValidUserName = function(candidateUser) {
//   // Match string between 3 and 12 chars starting with a letter, lower or upper case 
//   // and containing only letters (both cases, digits, dashes, underscores and dots.
//   var userRegex = /(?=[a-zA-Z])(?=^.{3,12}$)[a-zA-Z0-9_\-\.]*$/;
//   return userRegex.test(candidateUser);

// }

// var isValidPassword = function(candidatePass) {
//   // Match a string between 8 and 30 chars
//   // and containing only letters (both cases), digits and the following characters: ! @ # % : _ ( ) $ ^ & * - . ?
//   // It also must contain at least one upper case letter, one lower case and one digit and it cannot contain spaces.
//   var passwordRegex = /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z:!@#%_\(\)\$\^\&\*\-\.\?]*$/;
//   return passwordRegex.test(candidatePass);
// }

function checkUsername(input) {
    var username = input.value;
    if (username!="") {
        var xhr = new XMLHttpRequest();
            xhr.open('GET', '/checkusername/' + username + '/', true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status == 200) {
                    var html = [];
                    var reply = xhr.responseText;
                    if (reply==1) {
                        document.getElementById('checkuser').innerHTML='Not available';
                        document.getElementById("groupUsername").setAttribute("class", "control-group error");
                        usernameOk = false;

                    } else if (reply==2) {
                        document.getElementById('checkuser').innerHTML='Invalid name'
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
