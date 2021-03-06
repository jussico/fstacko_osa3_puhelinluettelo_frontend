import axios from 'axios'

// const baseUrl = 'http://localhost:3001/persons'
//const baseUrl = 'https://jussico-puhback.herokuapp.com/persons'
const baseUrl = process.env.REACT_APP_BACKEND_URL

console.log("using baseUrl:", baseUrl)

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const create = newObject => {
    const request = axios.post(baseUrl, newObject)
    return request.then(response => response.data)
}

const update = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}

const deletoi = (id) => {
    const request = axios.delete(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

export default {
    getAll: getAll,
    create: create,
    update: update,
    deletoi: deletoi
}
