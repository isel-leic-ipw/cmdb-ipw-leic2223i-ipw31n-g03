import fetch from 'node-fetch';

export default async function (method, uri, body) {
    let init = {
        method: method,
        headers: {'Content-Type': 'application/json'}
    }

    if (!body) init.body = JSON.stringify(body)

    const response = await fetch(uri, init)
    return await response.json()
}

