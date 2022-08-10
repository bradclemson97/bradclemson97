/*
let's start with a 'words' Javascript object containing words.
Instead of creating this object as 'persistent' in our code,
we create and store any updates to our words.json file and instead
in the program we load this data from the words.json file
*/
//this imports the file system package...
var fs = require('fs');
//using sync makes sure that the file is read before doing anything else in our code which is what we want to do
//below reads the raw file data...
var data = fs.readFileSync('words.json');
//below reads the actual data within the file
var words = JSON.parse(data);
console.log(words);

console.log('server is starting');

//the way to access code from a node package is through the require() function
//this is like an import statement, 'import the class express'
var express = require('express');

//With a reference to express, you can then create an express "app"
var app = express();

/*
The app is now a variable that holds an express instance,
and allows you to implement functionality on that instance.
For example, you might listen to connections on a certain port.
All of our server and client functionality is on our local computer so we are listening at port 3000
 */
var server = app.listen(3000);

//Callback to show that we are listening
function listening() {
    console.log("listening...");
}

/*
You can also serve static files.
For example, if you have a p5.js sketch (with an index.html file)
and you place it in a folder called website, you can say:
 */
app.use(express.static('website'));
/*
Now anytime you enter the url to your server (if you are running it on your machine, this will be http://localhost:3000),
the contents of the public folder will be hosted.
(By the way, this is exactly what the p5.js editor is doing when you hit the run button.)
 */

//setting up a route for a user get request to localhost:3000/search and a call back (sendFlower) to the get request
//':flower' is a variable of what the user is wanting to search for
app.get('/search/:flower/:num', sendFlower);
//also based on whatever ':num' is passed in, we repeat that many times

function sendFlower(request, response){
    var data = request.params;
    var num = data.num;
    var reply = "";
    for (var i = 0; i < num; i++) {
        reply += "I love " + data.flower + " too";
    }
    response.send(reply);
}

//setting up a route for a user add request to localhost:3000/add and a call back (addFlower) to the add request
//':word' is an existing object containing what the user is wanting to search for/add to
//'?' after 'score' makes adding a score optional
app.get('/add/:word/:score?', addWord);
//also based on whatever ':num' is passed in, we repeat that many times

function addWord(request, response){
    var data = request.params;
    var word = data.word;
    var score = Number(data.score);
    var reply;
    if (!score) {
        var reply = {
            msg: "Score is required."
        };
        response.send(reply);
    } else {
        words[word] = score;
        //taking the data in from the user and adding it to the 'word' object with a key-value pair
        //word = the value, score = the key
        //write data back to the words.json file asynchronously
        var data = JSON.stringify(words, null, 2);
        fs.writeFile('words.json', data, finished);
        function finished(err){
            console.log('all set.')
            reply = {
                word: word,
                score: score,
                status: "success"
            }
            response.send(reply);
        }
    }
}

//setting up a route for the user to retrieve the word object and all its contents
//Using express, express will automatically
//format our javascript object ('words') as Json
app.get('/all', sendAll);

function sendAll(request, response) {
    response.send(words);
}

//setting up a search route for if the user wants to query a particular word and get the score back
app.get('/search/:word/?', searchWord);

function searchWord(request, response) {
    var word = request.params.word;
    var reply;
    //see if the word exists...
    if (words[word]) {
        reply = {
        status: "found",
            word: word,
            score: words[word]
    }
    } else {
        reply = {
            status: "not found",
            word: word
        }

    }
    response.send(reply);
}

