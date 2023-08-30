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
    const postId = loadCommentsBtnElement.dataset.postid; // 'dataset'- access to all 'data' attributes we added. 'postId' - my identifier.
    //another option access to the button: 'event.target'.
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
             headers: {
                // 'Content-Type' - put it between single quotes, because it contains a dash.
                'Content-Type': 'application/json'}, //the 'Content-Type' header indicating JSON data.
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











