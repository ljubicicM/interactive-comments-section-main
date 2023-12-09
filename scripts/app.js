var data;

const fetchData = async () => {
  try {
    const response = await fetch("../data.json");
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.log(error);
  }
};

const main = async () => {
  data = await fetchData();
  initComments();
  const cmntInput = document.querySelector(".reply_input");
  cmntInput.querySelector(".post_comment_btn").addEventListener("click", () => {
  let commentBody = cmntInput.querySelector(".comment_input").value;
  if (commentBody.length == 0) return;
  addComment(commentBody, 0);
  cmntInput.querySelector(".comment_input").value = "";
});
};

const appendFrag = (frag, parent) => {
    var children = [].slice.call(frag.childNodes, 0);
    parent.appendChild(frag);
    return children[1];
}

const addComment = (commentBody, parentId, replyTo = undefined) => {
  let commentParent = parentId === 0 ? data.comments : data.comments.filter((comment) => 
  comment.id == parentId)[0].replies;
  let newComment = {
    parent: parentId,
    id: commentParent.length == 0 ? 1 : commentParent[commentParent.length - 1].id + 1,
    content: commentBody,
    createdAt: "Now",
    replyingTo: replyTo,
    score: 0,
    replies: parentId === 0 ? [] : undefined,
    user: data.currentUser,
  };
  commentParent.push(newComment);
  initComments();
};

const spawnReplyInput = (parentNode, parentId, replyTo = undefined) => {
  if (parentNode.querySelectorAll(".reply_input")) {
    parentNode.querySelectorAll(".reply_input").forEach((element) => {
      element.remove();
    });
  } 
  const replyInputTemplate = document.querySelector(".reply_template");
  const replyInputNode = replyInputTemplate.content.cloneNode(true);  
  const replyAdded = appendFrag(replyInputNode, parentNode);
  replyAdded.querySelector(".post_comment_btn").addEventListener("click", () => {
    let commentBody = replyAdded.querySelector(".comment_input").value;
    if(commentBody.length == 0) return;
    addComment(commentBody, parentId, replyTo);
  });
};

const createCommentNode = (commentObject) => {
    const commentTemplate = document.querySelector(".comment_template");
    var commentNode = commentTemplate.content.cloneNode(true);
    commentNode.querySelector(".user_name").textContent = commentObject.user.username;
    commentNode.querySelector(".user_img").src = commentObject.user.image.webp;
    commentNode.querySelector(".score_number").textContent = commentObject.score;
  commentNode.querySelector(".comment_ago").textContent = commentObject.createdAt;
  commentNode.querySelector(".c_body").textContent = commentObject.content;
  if(commentObject.replyingTo){
    commentNode.querySelector(".re_to").textContent = "@" + commentObject.replyingTo;
  }
  commentNode.querySelector(".score_plus").addEventListener("click", () => {
    commentObject.score++;
    initComments();
  });

  commentNode.querySelector(".score_minus").addEventListener("click", () => {
    commentObject.score--;
    if (commentObject.score < 0) commentObject.score = 0;
    initComments();
  });
  if (commentObject.user.username == data.currentUser.username) {
    commentNode.querySelector(".comment").classList.add("this-user");
    commentNode.querySelector(".del").addEventListener("click", () => {
      promptDel(commentObject);
    });
    commentNode.querySelector(".edit").addEventListener("click", (e) => {
      const path = e.composedPath()[3].querySelector(".c_body");

      if (
        path.getAttribute("contenteditable") == false ||
        path.getAttribute("contenteditable") == null
      ) {
        path.setAttribute("contenteditable", true);
        path.focus()
      } else {
        path.removeAttribute("contenteditable");
      }
      
    });
    return commentNode;
  }
  
  return commentNode;
}

const appendComment = (parentNode, commentNode, parentId) => {
  const replyBtn = commentNode.querySelector(".reply");
  const appendedComment = appendFrag(commentNode, parentNode);
  const replyTo = appendedComment.querySelector(".user_name").textContent;
  replyBtn.addEventListener("click", () => {
    if (parentNode.classList.contains("replies")) {
      spawnReplyInput(parentNode, parentId, replyTo);
    } else {
      spawnReplyInput(appendedComment.querySelector(".replies"), parentId, replyTo);
    }
  });
};

function initComments(
    commentList = data.comments,
    parent = document.querySelector(".comments_box")
){
   parent.innerHTML = "";
   commentList.forEach(element => {
        var parentId = element.parent == 0 ? element.id : element.parent;
        const commentNode = createCommentNode(element);
        if(element.replies && element.replies.length > 0){
            initComments(element.replies, commentNode.querySelector(".replies"));
        }
        appendComment(parent, commentNode, parentId);
    });
}

const promptDel = (commentObject) => {
  const modalWrp = document.querySelector(".del_wrp");
  modalWrp.classList.remove("invisible");
  modalWrp.querySelector(".del_yes").addEventListener("click", () => {
    deleteComment(commentObject);
    modalWrp.classList.add("invisible");
  });
  modalWrp.querySelector(".del_no").addEventListener("click", () => {
    modalWrp.classList.add("invisible");
  });
};

const deleteComment = (commentObject) => {
  if (commentObject.  parent == 0) {
    data.comments = data.comments.filter((e) => e != commentObject);
  } else {
    data.comments.filter((e) => e.id === commentObject.parent)[0].replies =
      data.comments
        .filter((e) => e.id === commentObject.parent)[0]
        .replies.filter((e) => e != commentObject);
  }
  initComments();
};
main();