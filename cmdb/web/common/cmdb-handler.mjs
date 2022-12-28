import {AUTHORIZATION, BEARER,JSON} from "../api/cmdb-api-constants.mjs";
import { RENDER,REDIRECTED } from "../site/cmdb-site-constants.mjs";
import toHttpResponse from "../cmdb-response-errors.mjs";

export default function handleRequest(handler,option,auth=true) {

    return async function (req, rsp, next) {
        if(auth){
            if (option===JSON){
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
            else
                if(req.user) req.token = req.user.token
                else return rsp.redirect('/site/login')
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
                        throw toHttpResponse(1)
                }
            }
            else throw toHttpResponse(1)

        } catch(e) {
            const response = toHttpResponse(e)
            if (option===JSON) rsp.status(response.status).json({ error: response.body })
            else rsp.status(404).render('error404',{title:'404 Page not found'})
        }
    }
}
export function verifyAuth(req, rsp, next) {
    console.log("verifyAuthenticated", req.user)
    if(req.user) {
        console.log("$$$$$$$$$$$$$$$$$")
        return next()
    }
    console.log("#################")
    rsp.redirect('/site/login')
}
export function logout(req, rsp) {
    req.logout((err) => {
        rsp.redirect('/site/home')
    })
}