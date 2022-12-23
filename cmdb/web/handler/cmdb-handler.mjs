import {AUTHORIZATION, BEARER} from "../api/cmdb-api-constants.mjs";
import toHttpResponse from "../cmdb-response-errors.mjs";






export function handleRequest(handler,auth,result) {

    return async function (req, rsp) {
        if(auth===true){
        let tokenHeader = req.get(AUTHORIZATION)
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
        try {
            let body = await handler(req, rsp)
            result(body)
        } catch(e) {
            const response = toHttpResponse(e)
            rsp.status(response.status).json({ error: response.body })
        }
    }
}