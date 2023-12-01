function initComments(
    commentList = dataJson.comments,
    parent = document.querySelector(".comments_box")
){
   parent.innerHTML = "";
   commentList.forEach(element => {
        var parentId = element.parent == 0 ? element.id : element.parent;
        const commentNode = makeCommentNode(element);
        if(element.replies && element.replies.length > 0){
            initComments(element.replies, commentNode.querySelector(".replies"));
        }
        appendComment(parent, commentNode, parentId);
    });
}

const dataJson = require('../data.json');
initComments();