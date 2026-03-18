import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 8000
})

export const getDomainsFull = () => http.get('/domains/full')
export const getDomains     = () => http.get('/domains')
export const getDimension   = (id) => http.get(`/dimensions/${id}`)
export const getStats       = () => http.get('/dimensions/stats/summary')
export const getPblProjects = (params) => http.get('/pbl', { params })
export const getPblProject  = (id) => http.get(`/pbl/${id}`)
export const getPblStats    = () => http.get('/pbl/stats/overview')
