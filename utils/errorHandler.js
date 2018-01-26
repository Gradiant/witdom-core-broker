/*
 *   Copyright (C) 2017  Gradiant <https://www.gradiant.org/>
 *
 *   This file is part of WITDOM Core Broker
 *
 *   WITDOM Core Broker is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   WITDOM Core Broker is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
// global error handler
function globalHandler(error, request, response, next) {
    //console.log(error.message);
    if(error.name == 'BrokerError') {
        response.setHeader('Content-Type', 'application/json');
        var httpCode;
        var httpStatus;
        var err_message;
        switch (error.reason) {
            case 'INVALID_CERTIFICATE' : 
                httpCode = 401;
                httpStatus = "denied";
                //if (request.client.hasCert) { //TODO: change this by 'if (request.connection.getPeerCertificate().subject)'
                if (request.client.encrypted && request.connection.getPeerCertificate().subject) {
                    err_message = "Authorization failed: wrong certificate provided"; 
                } else {
                    err_message = "Authorization failed: a client certificate is needed";
                }
                break;
            case 'INVALID_CERTIFICATE_OR_TOKEN' :
                httpCode = 401;
                httpStatus = "denied";
                //if (request.client.hasCert) { //TODO: change this by 'if (request.connection.getPeerCertificate().subject)'
                if (request.client.encrypted && request.connection.getPeerCertificate().subject) {
                    if (request.swagger.params['X-Auth-Token'].value == undefined) {
                        err_message = "Authorization failed: wrong certificate provided";
                    } else {
                        err_message = "Authorization failed: wrong certificate and token provided";
                    }
                } else {
                    if (request.swagger.params['X-Auth-Token'].value == undefined) {
                        err_message = "Authorization failed: a client certificate or user token is needed";
                    } else {
                        err_message = "Authorization failed: no certificate provided and wrong user token";
                    }
                    
                }
                break;
            case 'COULDNT_VALIDATE_TOKEN' :
                httpCode = 401;
                httpStatus = "denied";
                err_message = "Couldn't contact the validation service to validate the user token."
                break;
            default:
                httpCode = 500;
                httpStatus = "unknown_error";
                err_message = "unknown_error";
                break;
        }
        response.writeHead(httpCode);
        response.end(JSON.stringify({
            message: [{
                code:httpCode,
                status:httpStatus,
                message:err_message,
                path:[request._parsedUrl.pathname]
            }]
        }));
    } else {
        if(error.failedValidation) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(400);
            response.end(JSON.stringify({
                message: [{
                    code:"400",
                    message: error.message,
                    path:[request._parsedUrl.pathname]
                }]
            }));
        } else if(error.status == 404) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(404);
            response.end(JSON.stringify({
                message: [{
                    code:"404",
                    message:"Cannot GET",
                    path:[request._parsedUrl.pathname]
                }]
            }));
        } else if (error.status == 400) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(400);
            response.end(JSON.stringify({
                message: [{
                    code:"400",
                    message:error.message,
                    path:[request._parsedUrl.pathname]
                }]
            }));
        } else {
            __logger.debug(error);
        }
    }
    next();
}

module.exports = globalHandler;