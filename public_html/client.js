
/**
 * author: Khojiakbar Yokubjonov
 *  date: 3/26/2023
 *  description: this file implements the client side of an online-marketplace app called Ostaa.
 *  Right now, it allows for adding new users and new items (for particular users) to the database.
 */
const hostname11 = '204.48.28.205';
const hostname = 'localhost'
const port = 3000;


/**
 * takes the user inputs (username and password) and 
 * makes a POST request to the server to create a new user
 * Empty inputs are not allowed.
 */

//  CHANGE THIS FUNCTION TO LOGIN
var userName;
function login(){
    displayLoginIssue(null);
    
    let url =  '/account/login/'
    userName = document.getElementById('username').value;
    let ps = document.getElementById('password').value;
    console.log(userName + " " +  ps);
    if(userName !=="" && ps !== ""){
         url += userName + '/' + ps + '/';
        try{
            const xhr = new XMLHttpRequest();
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
                        window.location.href = 'http://' + hostname +':3000/app/home.html'  ;
                        
                        
                    }
                }else{
                    console.log('smth went wrong');
                }
                
            }
        };
        }catch(e){
            console.log('catch', e);
        }
       
        
    }
}
// Adds the username to the Welcome message at the top of the web page
function updateWelcomeName(){
    
    document.getElementById('user-name-for-welcome').innerText = getCookieData().username;

}

// checks for the session time out
function isSessionOver(){
    if(document.cookie === ''){
        document.getElementsByClassName("time-out")[0].innerHTML = "Session timed out";
    }
}
setInterval(isSessionOver, 2000);


// extracts user data from the cookie
function getCookieData()
{

    // decode the cookie string
    const decodedCookie = decodeURIComponent(document.cookie);
    
    // extract the JSON string from the decoded cookie
    const jsonStartIndex = decodedCookie.indexOf('{');
    const jsonEndIndex = decodedCookie.lastIndexOf('}');
    const jsonString = decodedCookie.slice(jsonStartIndex, jsonEndIndex + 1);
    
    // parse the JSON string and extract the username and sid values
    const { username, sid } = JSON.parse(jsonString);
    
    // return an object with the extracted values
    return { username, sid };
    
}


// sends a request to the server to create an account
function createAccount(){
    const xhr = new XMLHttpRequest();
    let url = '/account/create/'
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

// display message for invalid login credentials
function displayLoginIssue(message){
    document.getElementById("login-res").innerText = message;
}
// display message for invalid login credentials - when they don't match existing credentials
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
    console.log('adding a new item');
    let t  = document.getElementById("title").value;
    let d = document.getElementById('description').value;
    let img = document.getElementById('file').value;
    let p = document.getElementById('price').value;
    let s = document.getElementById('status').value;
    var user = getCookieData().username;

    // let user = document.getElementById('user').value;
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
            // console.log(response.text);
            window.location.href = 'http://' + hostname +':3000/app/home.html';
        });
        p1.catch(() => { 
            alert('something went wrong');
        });
    }
    

}
// handles the search bar on the home web page.
function searchListing(){
    let s = document.getElementById('search').value;
    console.log(s);
    let url = '/search/items/' + s;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if( xhr.status == 200){
            console.log(xhr.responseText);
            let items = JSON.parse(xhr.responseText);
            document.getElementById('output-area').innerHTML = '';
            const outputArea = document.getElementById('output-area');
            outputArea.classList.add("container");
            items.forEach(item => {
                const div = document.createElement('div');
                div.classList.add("item");
                if(item.stat.toLowerCase() === 'sale'){
                    div.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <img id='itemImage' name='image'>
                    <p>$${item.price}</p>
                    <button id='buy-button' name='buyButton'>Buy Now!</button>
                    `;
                    // adds onclick function
                    const buyB = div.querySelector('button[name="buyButton"]');
                    buyB.addEventListener('click', function(){
                        this.remove(); 
                        buyItem(item);
                    })

                    const image = div.querySelector('img[name="image"]');
                    image.addEventListener('onchange', function(){
                        var fReader = new FileReader();
                        fReader.readAsDataURL(item.image);
                        fReader.onloadend = function(event){

                            image.src = event.target.result;
}
                    })
                }else{
                    div.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <img src = "${item.image}">
                    <p>$${item.price}</p>
                    <p>Sold</p>
                    `;
                }
                
                outputArea.appendChild(div);
            });
        }
        
    }
};
}

// manages user purchases
function buyItem(item){
    let cookieObj = getCookieData();
    let user = cookieObj.username;
    console.log(user+' buying an item');
    let url = '/purchase/item/' + user
    let p = fetch( url, {
        method: 'POST',
        body: JSON.stringify(item),
        headers: {"Content-Type": "application/json"}
    });

    p.then((response) => {

        console.log(response);
    });
}

// displays the purchase data for a user
function displayPurchases(){
    // document.getElementById('purchases').style.color = 'black';
    // document.getElementById('listings').style.color = 'white';
    // document.getElementById('new-listings').style.color = 'white';
    let cookieObj = getCookieData()
    let url = '/get/purchases-data/'+ cookieObj.username;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if( xhr.status == 200){
                let items = JSON.parse(xhr.responseText);
                document.getElementById('output-area').innerHTML = '';
                const outputArea = document.getElementById('output-area');
                outputArea.classList.add("container");
                items.forEach(item => {
                    const div = document.createElement('div');
                    div.classList.add("item");
                    div.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <img src = "${item.image}">
                    <p>$${item.price}</p>
                    <p>Sold</p>
                    `;
                   
                    outputArea.appendChild(div);
                });

            }
        }
    }
}
// displays the postings for a user
function displayListings(){
    let cookieObj = getCookieData()
    let url = '/get/listings-data/'+ cookieObj.username;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if( xhr.status == 200){
                let items = JSON.parse(xhr.responseText);
                document.getElementById('output-area').innerHTML = '';
                const outputArea = document.getElementById('output-area');
                outputArea.classList.add("container");
                items.forEach(item => {
                    const div = document.createElement('div');
                    div.classList.add("item");
                    div.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <img src = "${item.image}">
                    <p>$${item.price}</p>
                    <p>${item.stat}</p>
                    `;
                   
                    outputArea.appendChild(div);
                });

            }
        }
    }

}

// takes the user to another web page when he/she tries to create a new listing
function createListing(){
    window.location.href = 'http://' + hostname +':3000/app/new_listing.html' 
}