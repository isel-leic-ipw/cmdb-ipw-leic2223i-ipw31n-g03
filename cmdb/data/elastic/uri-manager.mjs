const ELASTIC = 'http://localhost:9200/'

export default function(idx){
    return {
        getAll:() => `${ELASTIC}${idx}/_search`,
        get:(id) => `${ELASTIC}${idx}/_doc/${id}`,
        create:() => `${ELASTIC}${idx}/_doc?refresh=wait_for`,
        update:(id) => `${ELASTIC}${idx}/_doc/${id}?refresh=wait_for`,
        delete:(id) => `${ELASTIC}${idx}/_doc/${id}?refresh=wait_for`,
    }
}