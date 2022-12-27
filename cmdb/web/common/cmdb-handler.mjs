import {AUTHORIZATION, BEARER,JSON} from "../api/cmdb-api-constants.mjs";
import { RENDER,REDIRECTED } from "../site/cmdb-site-constants.mjs";
import toHttpResponse from "../cmdb-response-errors.mjs";

export default function handleRequest(handler,option,auth=true) {

    return async function (req, rsp, next) {
        if(auth){
        let tokenHeader = req.get(AUTHORIZATION) || req.user.token
        if (!(tokenHeader && tokenHeader.startsWith(BEARER) && tokenHeader.length > BEARER.length)) {
            rsp.status(401).json({
                error: {
                    message: "Invalid or missing token"
                }
            })
            return
        }
        req.token = tokenHeader.split(" ")[1]
        }
        else {
                if (req.user) req.token = req.user.token
        }
        try {
            let body = await handler(req, rsp)
            if(body || option === REDIRECTED) {
                switch(option) {
                    case RENDER:
                        rsp.render(body.name,body.data)
                        break;
                    case JSON:
                        rsp.json(body)
                        break;
                    case REDIRECTED:
                        break;
                    default:
                        throw 1
                }
            }
            else throw 1

        } catch(e) {
            const response = toHttpResponse(e)
            rsp.status(response.status).json({ error: response.body })
        }

    }
}