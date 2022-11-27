import fetch from 'node-fetch'

const Top250Movies = './data/top250movies.json'

const Top250_URL = 'https://imdb-api.com/en/API/Top250Movies/k_awsfxf9a'
const Search_URL = 'https://imdb-api.com/en/API/SearchMovie/k_awsfxf9a/'
const Title_details_URL = 'https://imdb-api.com/en/API/Title/k_awsfxf9a/'

export async function getMovie(movieId){
    let URL = Title_details_URL+movieId
    let rsp = await  fetch(URL)
    let obj = await rsp.json()
    if(obj['errorMessage']!==null){
        return
    }
    return {
        id:obj['id'],
        title:obj['title'],
        year:Number(obj['year']),
        duration:Number(obj['runtimeMins']),
        rating:Number(obj['imDbRating'])
    }
}

export async function getMoviesTop(limit){
    // let file = await readFile(Top250Movies)
    // file = JSON.parse(file)
    // let result = file.items.filter((_,index) => index+1 <= limit  )
    // return result
    let rsp = await  fetch(Top250_URL)
    let obj = await rsp.json()
    if(obj['errorMessage']!==""){
        return
    }
    let results = obj['items'].map(movie =>{
        return {
            id: movie['id'],
            rank:Number(movie['rank']),
            title: movie['title'],
            year: Number(movie['year']),
            rating: Number(movie['imDbRating']),
            ratingCount: Number(movie['imDbRatingCount'])
        }
    })
    return results.filter((_,index) => index+1 <= limit)
}

export async function getMovies(title,limit){
    let URL = Search_URL+title
    let rsp = await  fetch(URL)
    let obj = await rsp.json()
    if(obj['errorMessage']!==""){
        return
    }
    let results = obj['results'].map(movie =>{
        return {
            id: movie['id'],
            title: movie['title']
        }
    })
    return results.filter((_,index) => index+1 <= limit)
}