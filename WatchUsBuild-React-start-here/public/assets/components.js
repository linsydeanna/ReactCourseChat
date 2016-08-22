
/*This is my root/parent class. It holds the entire chat.*/

class CommentBox extends React.Component {

  constructor() {
    super();

{/*This is what sets the initial state of the array of comments*/}
{/*It sets up an empty array that we will add comments to using the addComments method.*/}
{/*This is what will become populated with the data that comes from the server*/}
    this.state = {
      comments: []
    };
  }
/*Must call fetchComments before the render is called so you don't have an infinite loop*/
  componentWillMount() {
    this._fetchComments();
  }

/*A variable is created to store the result of the getComments method.*/
  render() {
    const comments = this._getComments();
    return(
      <div className="row comments-container">
        <div className="cell">
          <h2>The Iron Yard Chat</h2>
          <div className="comment-box">

{/*This is what allows the values from the array to be displayed on the screen.*/}
          <div className="comment-list">
            {comments}
          </div>
{/*This is passing the addComment function as an argument to the addComment prop and binding it to CommentBox*/}
            <CommentForm addComment={this._addComment.bind(this)} />

          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this._timer = setInterval(
      () => this._fetchComments(),
      2000
    );
  }

  componentWillMount() {
    clearInterval(this._timer);
  }

/*This is a method that will return an array of JSX elements.*/
/*The map method here is mapping over each element and creating an array that makes each message a component.*/
/*The return area is passing each argument ran through map as a prop.*/
/*The key helps react know which element is which as they are being passed.*/
  _getComments() {
    return this.state.comments.map((comment) => {
      return <Comment
               id={comment.id}
               username={comment.username}
               text={comment.text}
               onDelete={this._deleteComment.bind(this)}
               key={comment.id} />
    });
  }

/*Here we have the addComment method that is creating a new comment object*/
/*The id is assigning a new id on the user side*/
  _addComment(commentUsername, commentText) {

    const comment = { username, text };
/*We use concat to add a new comment to end of the array.*/
/*Concat is awesome because it adds a new reference to the array instead of mutating the existing one*/
/*setState changes the state by adding to the array when a comment is added.*/
jQuery.post('https://fathomless-woodland-51903.herokuapp.com/messages', {comment})
  .success(newComment => {
    this.setState({
      comments: this.state.comments.concat([newComment]) });
    });
  }
/*The fetchComments method takes care of making ajax requests*/
/*We call setState with the new array of comments that we recieve from the server*/
/*The "this" before setState refers to the CommentBox class*/
  _fetchComments() {
    jQuery.ajax({
      method: 'GET',
      url: 'https://fathomless-woodland-51903.herokuapp.com/messages',
      headers: {
        "Authorization": "Token token=supadupasecret"
             },
      success: (comments) => {
        this.setState({ comments })
      }
    });
  }

  _deleteComment(commentID) {
    const comments = this.state.comments.filter(
      comment => comment.id !== commentID
    );

    this.setState({ comments });
  }
}

/*This class is what allows users to add new comments.*/
/*It is a child of the CommentBox parent*/

class CommentForm extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <form className="comment-form" onSubmit={this._handleSubmit.bind(this)}>
        <div className="comment-form-fields">
          <textarea placeholder="Type your message here:" ref={c => this._text = c} ></textarea>
        </div>
        <div className="comment-form-actions">
          <button type="submit">
            Post chat message
          </button>
        </div>
      </form>
    );
  }

  _handleSubmit(event) {
    event.preventDefault();

    this.props.addComment(this._username.value, this._text.value);

    this._username.value = '';
    this._text.value = '';
  }
}

/*The Comment class will render the markup for each message of the chat.*/
class Comment extends React.Component {
  constructor() {
    super();

    this.state = {
      isAbusive: false
    };
  }

  render() {

    let commentText;

    if (!this.state.isAbusive) {
      commentText = this.props.text;
    } else {
      commentText = <em>Content marked as abusive</em>;
    }

    return(
      <div className="comment">

        <p className="comment-header">{this.props.username}</p>
        <p className="comment-text">{commentText}</p>

        <div className="comment-actions">
          <CommentRemoveConfirmation onDelete={this._handleDelete.bind(this)} />
          <a href="#" onClick={this._toggleAbuse.bind(this)}>Report as Abuse</a>
        </div>
      </div>
    );
  }

  _toggleAbuse(event) {
    event.preventDefault();

    this.setState({
      isAbusive: !this.state.isAbusive
    });
  }

  _handleDelete() {
    this.props.onDelete(this.props.id);
  }
}

class CommentRemoveConfirmation extends React.Component {
  constructor() {
    super();

    this.state = {
      showConfirm: false
    };
  }

  render() {

    let confirmNode;

    if (this.state.showConfirm) {
      return (
        <span>
          <a href="" onClick={this._confirmDelete.bind(this)}>Yes </a> - or - <a href="" onClick={this._toggleConfirmMessage.bind(this)}> No</a>
        </span>
      );
    } else {
      confirmNode = <a href="" onClick={this._toggleConfirmMessage.bind(this)}>Delete comment?</a>;
    }

    return (
      <span>
        {confirmNode}
      </span>
    );
  }

  _toggleConfirmMessage(e) {
    e.preventDefault();

    this.setState({
      showConfirm: !this.state.showConfirm
    });

  }

  _confirmDelete(e) {
    e.preventDefault();
    this.props.onDelete();
  }
}

jQuery(function() {
  ReactDOM.render(
    <CommentBox />,
    document.getElementById('comment-box')
  );
})
