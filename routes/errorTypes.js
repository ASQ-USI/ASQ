/**
    @fileoverview routes/errorTypes.js
    @description Error types that can be displayed to clients
*/

var types =[];

exports.getTypes = function(){
  return types.slice(0);
}

exports.hasType = function(typeName){
  if('string' != typeof typeName){
    return false
  }
  return types.indexOf(typeName) >= 0 
    ? true 
    : false;
}

exports.add = function(typeName){
  if (types.indexOf(typeName)<0){
    types.push(typeName)
  }
}