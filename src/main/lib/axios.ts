import axios from 'axios'

export const api = axios.create({
  baseURL: "http://redmine.atakone.com.br",
  withCredentials: true,
})