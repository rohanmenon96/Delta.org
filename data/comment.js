(
    function($) 
    {
        let commentForm = $("#commentBox");
        let comment = $("#userComment");
        let commentDiv = $("#comments");
	
        let eventIdField = $("#requestId");

        commentForm.submit(function(event)
        {
            event.preventDefault();
				
			console.log("+===============================" , comment);
			
            let commentValue = comment.val();
            const urlParams = new URLSearchParams(window.location.search);
            
            if(commentValue)
            {
                let requestConfig = {
                    method : "POST",
                    url : "/addComments",
                    content : "application/json",
                    data : {
                            "comment" : commentValue,
                            "requestId" : urlParams.get('id')
                        }
                };

                $.ajax(requestConfig).then(function(response)
                {                    
                    if(response.commentAdded === "true")
                    {
                        let div = document.createElement("div");
                        div.classList.add("card");
                        
                        let cardHeader = document.createElement("div");
                        cardHeader.classList.add("card-header");
                        cardHeader.style.fontWeight = "bold";
                        
                        let userName = document.createTextNode(response.username);
                        cardHeader.appendChild(userName);
                        
                        div.appendChild(cardHeader);

                        let cardBody = document.createElement("div");
                        cardBody.classList.add("card-body");                        
                        
                        let commentForBody = document.createElement("p");
                        commentForBody.classList.add("card-text");

                        let commentForBodyText = document.createTextNode(response.comment);
                        commentForBody.appendChild(commentForBodyText);

                        cardBody.appendChild(commentForBody);
                        div.appendChild(cardBody);

                        commentDiv.append(div);
                        commentDiv.append(document.createElement("br"));
                    }
                });
            }
        });
        
    }
)(window.jQuery);