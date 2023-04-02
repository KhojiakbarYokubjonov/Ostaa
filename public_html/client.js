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
function addUser(){
    let u = document.getElementById('username').value;
    let ps = document.getElementById('password').value;
    let url = '/add/user/';

    if(u !=="" && ps !== ""){
        let data = {username: u, password: ps, listings: [], purchases: []};
    let p = fetch( url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    });
    p.then(() => {
        console.log('User Created');
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

        p1.then(() => {
            console.log('Item added to the user');
        });
        p1.catch(() => { 
            alert('something went wrong');
        });
    }
    

}