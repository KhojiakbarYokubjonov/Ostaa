
/**
 * author: Khojiakbar Yokubjonov
 *  date: 3/26/2023
 *  description: this file implements the client side of an online-marketplace app called Ostaa.
 *  Right now, it allows for adding new users and new items (for particular users) to the database.
 */
const hostname = 'localhost';
const port = 3000;


/**
 * takes the user inputs (username and password) and 
 * makes a POST request to the server to create a new user
 * Empty inputs are not allowed.
 */


//  CHANGE THIS FUNCTION TO LOGIN

function login(){
    displayLoginIssue(null);
    const xhr = new XMLHttpRequest();
    let url = 'http://' + hostname + ':' + port + '/account/login/'
    let u = document.getElementById('username').value;
    let ps = document.getElementById('password').value;
    console.log(u + " " +  ps);
    if(u !=="" && ps !== ""){
         url += u + '/' + ps + '/';
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if( xhr.status == 200){
                // console.log('Inside client: '+ xhr.responseText);
                if(xhr.responseText === "LOGIN FAILED"){
                    displayLoginIssue("Issue logging  in with that info");
                }else{
                    console.log("SUCCESS");
                    window.location.href = 'http://localhost:3000/home.html';
                }
            }else{
                console.log('smth went wrong');
            }
            
        }
    };
        
    }
}

function createAccount(){
    const xhr = new XMLHttpRequest();
    let url = 'http://' + hostname + ':' + port + '/account/create/'
    let u = document.getElementById('username').value;
    let ps = document.getElementById('password').value;
    console.log(u + " " +  ps);
    if(u !=="" && ps !== ""){
         url += u + '/' + ps + '/';
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if( xhr.status == 200){
                // console.log('Inside client: '+ xhr.responseText);
                if(xhr.responseText === "Account Created"){
                    alert(xhr.responseText);
                }else{
                    displayInvalidAccount();
                }
            }else{
                console.log('smth went wrong');
            }
            
        }
    };
        
    }
}
function displayLoginIssue(message){
    document.getElementById("login-res").innerText = message;
}

function displayInvalidAccount(message){
    document.getElementById("new-accoun-issue").innerText = message;
}



function addUser(){
    displayInvalidAccount(null);
    let u = document.getElementById('new-username').value;
    let ps = document.getElementById('new-password').value;
    let url = '/add/user/';

    if(u !=="" && ps !== ""){
        let data = {username: u, password: ps, listings: [], purchases: []};
    let p = fetch( url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    });
    p.then(response => {
        response.text().then(data => {
            if(data === "SAVED SUCCESFULLY"){
                alert('Account Created');
            }else{
                displayInvalidAccount("Username/password is unavailable");
            }
        });
      });
      p.catch(() => { 
        alert('something went wrong');
    });
    }
    
}

/**
 * takes the user inputs and creates an item for sale for the speficied user.
 * All inputs are required.
 * it makes a POST request to the server to add a new item to the listings of
 * the specified user.
 */

// CHANGE TO CREATE ACCOUNT
function addItem(){
    let t  = document.getElementById("title").value;
    let d = document.getElementById('desc').value;
    let img = document.getElementById('image').value;
    let p = document.getElementById('price').value;
    let s = document.getElementById('status').value;
    let user = document.getElementById('user').value;
    if(user !== "" && t !== "" && d !== "" && s !== "" ){
        let url = '/add/item/' + user;
        let item = {title: t, description: d, image: img, price: p, stat: s};
        let p1 = fetch((url), {
            method: 'POST',
            body: JSON.stringify(item),
            headers: {"Content-Type": "application/json"}
        });

        p1.then((response) => {
            console.log(response);
            console.log(response.text);
        });
        p1.catch(() => { 
            alert('something went wrong');
        });
    }
    

}