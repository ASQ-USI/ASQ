module.exports = {
  renameIdAndRemoveVersion : function(obj){
    if( obj.hasOwnProperty('_id')){
      obj.id = obj._id.toString();
      delete obj._id;
    }
    delete obj.__v;
    return obj;
  }
}