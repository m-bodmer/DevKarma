//Create our new MongoDB collection of Developers
Developers = new Meteor.Collection("developers");
//Create our new MongoDB collection of Users
Users = new Meteor.Collection("users");
//Create our new MongoDB collection of Chatbox Messages
Messages = new Meteor.Collection('messages');
//Create our new MongoDB collection of Stories
Stories = new Meteor.Collection("stories");
//Create our new MongoDB collection of Todos
Todos = new Meteor.Collection("todos");


if (Meteor.is_client) {

  //Set the initial view to main
  Session.set('view', 'main')

  //Subsribe to our message record set
  Meteor.subscribe("messages");

  /******** Scrum Board System operations ********/
  Template.TaskList.stories = function(){
    return Stories.find({}, {sort: {title: -1}})
  };

  Template.NewTask.events = {
    'click button': function(){
      if($("input[name='title']").val() !== ""){
        Stories.insert({
          title: $("input[name='title']").val(),
        });
        return $("input").val("");
      }
    },
    'keydown': function(event){
      if (event.keyCode === 13 && $("input[name='title']").val() !== "") {
        event.preventDefault();
        Stories.insert({
          title: $("input[name='title']").val(),
        });
        return $("input").val("");
      }
    }
  };

  Template.new_todo.events = {
    'click button.create_todo_btn':function(){
      if($("textarea").val() !== ""){
        Todos.insert({
          text: $("textarea").val(),
          status: "todo",
          person: $("input[name='person']").val(),
          story_id: $("input[name='sotry_id']").val()
        });
        return $("textarea, input[name='person']").val(""), $("#new_todo").hide();
      };
    },
    'keydown': function(event){
      if (event.keyCode === 13 && $("input[name='text']").val() !== "") {
        event.preventDefault();
        Todos.insert({
          text: $("textarea").val(),
          status: "todo",
          person: $("input[name='person']").val(),
          story_id: $("input[name='sotry_id']").val()
        });
        return $("textarea, input[name='person']").val(""), $("#new_todo").hide();
      }
    }
  };

  Template.TodoList.todos = function(){
    return Todos.find({story_id:this._id, status:"todo"})
  };

  Template.WipList.todos = function(){
    return Todos.find({story_id:this._id, status:"wip"})
  };

  Template.VerifyList.todos = function(){
    return Todos.find({story_id:this._id, status:"verify"})
  };

  Template.DoneList.todos = function(){
    return Todos.find({story_id:this._id, status:"done"})
  };

  /******** Chat System operations ********/
  Meteor.autosubscribe(function() {
    return Messages.find().observe({
      added: function() {
        scrollToBottom();
        labelInside();
      }
    });
  });

  toggleTheme = function() {
    // method to toggle theme from day to night
    $('#night-theme')
      .bind('click', function() {
          $('body').addClass('night');
        })
    $('#day-theme')
      .bind('click', function() {
        $('body').removeClass('night');
      })
  };

  Template.ChatroomBox.events = {
    'click button, keyup input': function(evt) {
      var handle = $('#handle').val();
      // trim handle
      handle = handle.substring(0,32);
      var textbox = $('#message').val();
      // trim handle
      textbox = textbox.substring(0,200);
      // change color, based on handle text hash
      var hash = 0;
      var blah = 0;
      for(i = 0; i < handle.length; i++) {
        blah = handle.charCodeAt(i);
        hash = ((hash<<5)-hash)+blah;
        hash = hash & hash;
      }
      var hue = '#fd4694';
      if(handle !== '') {
        hue = Math.floor((Math.abs(Math.sin(hash) * 16777215)) % 16777215);
        hue = hue.toString(16);
        while(hue.length < 6) {
          hue = '0' + hue;
        }
      } else {
        hue = 'rgb('
        + (Math.floor(Math.random() * 256)) + ','
        + (Math.floor(Math.random() * 256)) + ','
        + (Math.floor(Math.random() * 256)) + ')';
      }
      var date = new Date();
      var date_str=('0'+date.getHours()).substr(-2,2)+':'+('0'+date.getMinutes()).substr(-2,2);

      // if we clicked the button or hit enter
      if (evt.type === 'click' || (evt.type === 'keyup' && evt.which === 13)) {
        var message_id = Messages.insert({handle: handle,
                                        room_id: 1,
                                        message: textbox,
                                        date_time: date_str,
                                        color: '#'+hue});
        Session.set('user_id', $("#handle").val(handle)); // session tracking TBI
        $("#handle").val(handle);
        $("#message").val('');
        $("#message").focus();
        $("#handle-counter").text(32 - $("#handle").val().length);
        $("#message-counter").text(200);
      }
      if (evt.type === 'change' || evt.type === 'keyup') {
        var remainingx = 32 - $("#handle").val().length;
        $("#handle-counter").text(remainingx);
        var remainingy = 200 - $("#message").val().length;
        $("#message-counter").text(remainingy);
      }
    }
  };
  //*Helper functions for chat system
  scrollToBottom = function() {
    return setTimeout(function () {
      return $("#chat").scrollTop(1e4)}, 200)
  };

  labelInside = function() {
    $('input')
      .bind('focus.labelFx', function() {
        $(this).prev().hide();
      })
      .bind('blur.labelFx', function() {
        $(this).prev()[!this.value ? 'show' : 'hide']();
      })
      .trigger('blur.labelFx');
  };

  //Allow users to post images
  Handlebars.registerHelper('linkify', function() {
    var val = this["message"];
    if(!val) return "";
    val = Handlebars._escape(val);

    return Meteor.ui.chunk(function() {
      var link, exp;
      exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      link = val.replace(exp, '<a href="$1" target="_blank">$1</a>');
      return link;
    });
  });

  Template.ChatroomBox.messages = function() {
    return Messages.find();
  };

  /******** Leaderboard System operations ********/
  Template.Navigation.username = function () {
    if (Session.get('user')) {
      return Session.get('user').username;
    } else {
      return undefined;
    }
  };

  //ViewHandler template events
  Template.ViewHandler.main = function () {
    if (Session.get('view')) {
      return Session.equals("view", 'main') ? "main" : '';
    } else {
      return undefined;
    }
  };

  Template.ViewHandler.scrum = function () {
    if (Session.get('view')) {
      return Session.equals("view", 'scrum') ? "scrum" : '';
    } else {
      return undefined;
    }
  };

  Template.ViewHandler.chat = function () {
    if (Session.get('view')) {
      return Session.equals("view", 'chat') ? "chat" : '';
    } else {
      return undefined;
    }
  };

  Template.Navigation.events = {
      'submit #login': function (evt) {
        var username = $("#login #username").val();
        evt.preventDefault();
        var user = Users.findOne({username: username});
        if (!user) {
          user = Users.insert({username: username});
        }
        Session.set('user', user);
      },

      'click #mainButton': function () {
        Session.set('view', 'main')
      },

      'click #chatButton': function () {
        Session.set('view', 'chat')
      },

      'click #scrumButton': function () {
        Session.set('view', 'scrum')
      }
  };

  //Leaderboard template events
  Template.Leaderboard.developers = function () {
    return Developers.find({}, {sort: {karma: -1, name: 1}});
  };

  Template.Leaderboard.selected_name = function () {
    var developer = Developers.findOne(Session.get("selected_developer"));
    return developer && developer.name;
  };

  Template.Leaderboard.events = {
    'click input.upvote': function () {
      Developers.update(Session.get("selected_developer"), {$inc: {karma: 1}});
    },

    'click input.downvote': function () {
      Developers.update(Session.get("selected_developer"), {$inc: {karma: -1}});
    }
  };

  //Developer template events
  Template.Developer.selected = function () {
    return Session.equals("selected_developer", this._id) ? "selected" : '';
  };

  Template.Developer.events = {
    'click': function () {
      Session.set("selected_developer", this._id);
    }
  };
}

if (Meteor.is_server) {

  /*Meteor.publish('messages', function() {
    return Messages.find({}, {fields: {}});
  });*/

  Meteor.startup(function () {
    // On server startup, initialize our database with some developers if it is empty
    if (Developers.find().count() === 0) {
      var names = ["DJ",
                   "Ganesh",
                   "Michelle",
                   "Jake",
                   "Andrew S.",
                   "Peter",
                   "Marc"];
      for (var i = 0; i < names.length; i++) {
        Developers.insert({name: names[i], karma: 0});
      }
    }

    Meteor.default_server.method_handlers['/messages/update'] = function(){};
    Meteor.default_server.method_handlers['/messages/remove'] = function(){};
  });
}