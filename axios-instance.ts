import axios from 'axios'

export const GPClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true, // Send cookies to server in every request
})

export const GPServer = axios.create({
    baseURL: process.env.BACKEND_URL,
    withCredentials: true, // Send cookies to server in every request
})