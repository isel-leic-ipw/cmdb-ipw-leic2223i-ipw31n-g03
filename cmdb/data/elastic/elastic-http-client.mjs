import fetch from 'node-fetch';

const SOURCE = "_source"
const ID = "_id"
const HITS = "hits"
const ELASTIC = 'http://localhost:9200/'
const GET = 'GET'
const POST = 'POST'
const PUT = 'PUT'
const DELETE = 'DELETE'

async function make(method, uri, body) {
    const init = {
        method: method,
        headers: {'Content-Type': 'application/json'}
    }

    if (body) init["body"] = JSON.stringify(body)

    const response = await fetch(uri, init)

    return await response.json()
}

export default function(idx) {
    return {
        async search(body) {
            const response = await make(POST,`${ELASTIC}${idx}/_search`, body)

            const hits = response[HITS][HITS]

            if (hits.length === 0) {
                return hits
            }

            return hits.map(hit => {
                    return {
                        id: hit[ID],
                        body: hit[SOURCE]
                    }
                }
            )
        },
        async get(id) {
            const response = await make(GET,`${ELASTIC}${idx}/_doc/${id}`)

            if (!response["found"]) {
                return undefined
            }

            return {
                id: response[ID],
                body: response[SOURCE]
            }
        },
        async create(body) {
            const response = await make(POST,`${ELASTIC}${idx}/_doc?refresh=wait_for`, body)
            return {
                id: response["_id"],
                result: response["result"] === "created"
            }
        },
        async update(id, body) {
            const response = await make(PUT,`${ELASTIC}${idx}/_doc/${id}?refresh=wait_for`, body)
            return {
                result: response["result"] === "updated"
            }
        },
        async delete(id) {
            const response = await make(DELETE,`${ELASTIC}${idx}/_doc/${id}?refresh=wait_for`)
            return {
                result: response["result"] === "deleted"
            }
        }
    }
}

