/** @module lib/utils/responseHelper
    @description helper function for REST responses, error etc.
*/

exports.restErrorFormatter = function (requestErrorList, err){
	if("undefined" == typeof err){
		throw new Error('responseHelper.restErrorFormatter: called '
			+ 'with undefined err argument');
	}

	var msg = err.message;
	if(requestErrorList.hasOwnProperty(msg)){
		return {
			statusCode : requestErrorList[msg].statusCode,
			type : 'invalid_request_error',
			message: msg
		}
	}

	return {
			statusCode : 500,
			type : 'api_error',
			message: 'Something went wrong on ASQ\'s end'
		}

}