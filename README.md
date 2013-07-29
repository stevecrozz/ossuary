OSSUARY: Your Backbone's final RESTing place
--------------------------------------------

Experimental ---
The Ossuary is experimental and under active development. Many features
are not implemented and the features that are implemented are probably
buggy.

create an Ossuary

An Ossuary is for backbone collection management. You can add as many
backbone collections as you'd like to an Ossuary. An Ossuary provides
one simple interface for accessing data whether or not it has already
been retrieved from a back end server.

One Ossuary is probably good enough for most apps, but you can make as
many as you want.

```javascript
var o = new Ossuary();
```


register a collection

Stores a collection in the Ossuary. The Ossuary will handle fetches for
you according to how often the collection expires.

If you add a collection with the same name as an existing collection,
the old one will be replaced and any pending deferreds will be rejected.

```javascript
o.add({
  name: "allAccounts",
  collection: new AccountCollection()
});
```


access the accounts index

Fetches the resource if it needs to be fetched and returns a jQuery
promise interface. If you ask for a collection that doesn't exist, the
Ossuary will throw an exception.

```javascript
o.get("allAccounts").done(function(accounts){
  accounts; // the accounts collection
});
```


Access an underlying collection without the magic auto-fetching stuff.
The collections property is just a hash of the collections registered
via Ossuary#add.  You can do anything you want with this, its your
collection!  But don't remove it from the Ossuary directly, use
Ossuary#remove instead.

```javascript
o.collections.allAccounts;
```


get a specific account

If the resource exists in the collection already and it is not stale,
Ossuary will not make any requests. If the resource needs to be fetched,
Ossuary will get the model class associated with the specified
collection and use that URL to fetch the resource and add it to the
collection. Either way, Ossuary will return a jQuery promise interface.

```javascript
o.get("allAccounts", "1234").done(function(account){
  account; // account model #1234
});
```


get a bunch of stuff

Done will fire only if the Ossuary is able to get all the stuff you
asked for.

```javascript
$.when(
  o.get("blogPost", "888"),
  o.get("commentsForBlogPost888")
).then(function(blogPost, comments){
  // a blog post model and a comments collection
});
```


remove a collection

if you don't want a collection in your ossuary any more, just take it
out

```javascript
o.remove("allAccounts");
```


example backbone app

```javascript
$(function(){
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
```
