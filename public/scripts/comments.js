const loadCommentsBtnElement = document.getElementById('load-comments-btn');
const commentsSection = document.getElementById('comments');

const commentFormElement = document.querySelector('#comments-form>form');
const commentTitleElement = document.getElementById('title');
const commentTextElement = document.getElementById('text');

const createCommentsList = (comments) => {
    const commentsListElement = document.createElement('ol');
    for(const comment of comments){
        const commentElement = document.createElement('li');
        const commentContent = 
        `<article class="comment-item">
        <h2>${comment.title}</h2>
        <p>${comment.text}</p>
        </article>`
        commentElement.innerHTML = commentContent;
        commentsListElement.appendChild(commentElement);
    }
    return commentsListElement;
}

const fetchComments = async () => {
    const postId = loadCommentsBtnElement.dataset.postid; // 'dataset'- access to all 'data' attributes we added. 'postId' - the identifier.
    //-> another option access to the button: 'event.target'.
    try {
        const response = await fetch(`/posts/${postId}/comments`);
        if(!response.ok){  //handel server error
            alert('Server error occur, try again later');
            return;
        }
        const commentsData = await response.json();  /*.json() - build in method in the browser. parse the response data as 
        a regular java script object. decode data which is encoded in JSON by the server side to use it in this 
        js code. It yield a promise, because this parsing can also take a bit longer, therefore is as asynchronous task.
        */
        if(commentsData.length === 0 || !commentsData){
            commentsSection.children[0].innerHTML = 'Sorry, but no comments found.';
            return;
            }
        const commentsList = createCommentsList(commentsData);
        commentsSection.innerHTML = ''; //delete the default content.
        commentsSection.appendChild(commentsList);
        

        
    } catch (error) {      //Handel technical error         
        alert('error, please check your network');
    }
}

loadCommentsBtnElement.addEventListener('click', fetchComments)



commentFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    const postId = loadCommentsBtnElement.dataset.postid;
    const commentTitle = commentTitleElement.value;
    const commentContent = commentTextElement.value;
    const commentData = {title: commentTitle, text: commentContent};
    try {
        const response = await fetch(`/posts/${postId}/comments`,
            {method: 'POST',
             headers: { // 'Content-Type' - put it between single quotes, because it contains a dash.
                'Content-Type': 'application/json'
                }, //the 'Content-Type' header indicating JSON data.
                // In default request the browser send the type, but here we set it since we send own request.
            body: JSON.stringify(commentData) // Convert the data to JSON format
            });
        
        if(response.ok)  //handel server error.
            fetchComments();  //display the updated comments.
        else
            alert('Error occur');
    //Handel front side error(such us the network offline and the fetch didn't execute):         
    } catch (error) {
        alert("The comment didn't send");
    }


})  

/*
JSON.parse() vs .json()
In summary, JSON.parse() is used to convert a JSON string into a JavaScript object,It's typically used when you receive
JSON data from an API or server and you need to work with that data as a JavaScript object in your client-side code. Typically when you already have a JSON string:

    const jsonString = '{"key": "value"}';
    const parsedData = JSON.parse(jsonString);

On the other hand, .json() is used with the fetch() function to handle the response of a network request,
parsing the JSON response body into a JavaScript object for easier manipulation:

    fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => {
        // 'data' here is a JavaScript object parsed from the JSON response
    });

They serve different purposes but both are essential tools in working with JSON data on the client side.
*/








