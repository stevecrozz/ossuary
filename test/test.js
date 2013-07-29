$(function(){
  var fakeServer = server = sinon.fakeServer.create();
  fakeServer.autoRespondAfter = 500;
  fakeServer.autoRespond = true;
  fakeServer.respondWith("GET", "/stories", [
    200,
    { "Content-Type": "application/json" },
    JSON.stringify([
      {
        id: 1,
        name: "Some Story"
      },
      {
        id: 2,
        name: "Some Other Story"
      }
    ])
  ]);
  fakeServer.respondWith("GET", "/stories/1", [
    200,
    { "Content-Type": "application/json" },
    JSON.stringify({
      id: 1,
      name: "Some Story"
    })
  ]);

  var StoryModel = Backbone.Model.extend({
    urlRoot: "/stories"
  });

  var StoryCollection = Backbone.Collection.extend({
    model: StoryModel,
    url: "/stories"
  });

  var o = new Ossuary();

  o.add({
    name: "story",
    collection: new StoryCollection()
  });

  var IndexView = Backbone.View.extend({
    el: "body",

    initialize: function(promise){
      promise.done(_.bind(this.dataReady, this));
      this.render(); // no collection yet
    },

    dataReady: function(stories){
      this.collection = stories;
      this.render(); // collection is ready
    },

    render: function(){
      if (this.collection){
        var ul = $("<ul>");
        this.collection.forEach(function(story){
          $("<li>", { text: story.get("name") }).appendTo(ul);
        });
        this.$el.html(ul);
      } else {
        this.$el.text("Loading...");
      }
    }
  });

  var ShowView = Backbone.View.extend({
    el: "body",

    initialize: function(promise){
      promise.done(_.bind(this.dataReady, this));
      this.render(); // no collection yet
    },

    dataReady: function(story){
      this.model = story;
      this.render(); // collection is ready
    },

    render: function(){
      if (this.model) {
        this.$el.text(this.model.get("name"));
      } else {
        this.$el.text("Loading...");
      }
    }
  });

  var MyRouter = Backbone.Router.extend({
    routes: {
      "stories": "index",
      "stories/:id": "show"
    },

    index: function(){
      new IndexView(o.get("story"));
    },

    show: function(id){
      new ShowView(o.get("story", id));
    }
  });

  new MyRouter();
  Backbone.history.start();
});
