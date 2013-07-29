var Ossuary = function(){
  this.collections = {};
  this.metadata = {};
};

Ossuary.prototype.add = function(options){
  this.collections[options.name] = options.collection;

  this.metadata[options.name] = {
    oneDeferreds: {}
  };
};

Ossuary.prototype.get = function(name, id){
  if (id) {
    return this.getOne(name, id);
  } else {
    return this.getAll(name);
  }
};

Ossuary.prototype.getOne = function(name, id){
  var indexDeferred = this.metadata[name].indexDeferred;

  if (this.collections[name]){
    var model = this.collections[name].get(id);

    if (model) {
      // there is a collection and the requested model is available
      var deferred = new $.Deferred();
      deferred.resolveWith(this, [ model ]);
      return deferred;
    }
  }

  if (!this.metadata[name].oneDeferreds[id]) {
    var fetcher = new Ossuary.OneFetcher(this, name, id);
    this.metadata[name].oneDeferreds[id] = fetcher.deferred;
  }

  return this.metadata[name].oneDeferreds[id]
};

Ossuary.prototype.getAll = function(name){
  if (!this.metadata[name].indexDeferred) {
    var fetcher = new Ossuary.AllFetcher(this, name);
    this.metadata[name].indexDeferred = fetcher.deferred;
  }

  return this.metadata[name].indexDeferred;
};

Ossuary.OneFetcher = function(ossuary, name, id){
  this.deferred = new $.Deferred();
  this.ossuary = ossuary;
  this.collection = ossuary.collections[name];
  this.name = name;
  this.id = id;

  this.model = new this.collection.model({
    collection: this.collection
  });

  this.model.set(this.model.idAttribute, id);

  this.model.fetch({
    success: _.bind(this.onSuccess, this),
    error: _.bind(this.onError, this)
  });
};

Ossuary.OneFetcher.prototype.onSuccess = function(){
  this.deferred.resolveWith(this, arguments);
};

Ossuary.OneFetcher.prototype.onError = function(){
  this.deferred.rejectWith(this, arguments);
};

Ossuary.AllFetcher = function(ossuary, name){
  this.deferred = new $.Deferred();
  this.ossuary = ossuary;
  this.collection = ossuary.collections[name];
  this.name = name;

  this.collection.fetch({
    success: _.bind(this.onSuccess, this),
    error: _.bind(this.onError, this)
  });
};

Ossuary.AllFetcher.prototype.onSuccess = function(){
  this.deferred.resolveWith(this, arguments);
};

Ossuary.AllFetcher.prototype.onError = function(){
  this.deferred.rejectWith(this, arguments);
};
