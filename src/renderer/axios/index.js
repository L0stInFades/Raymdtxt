import axios from 'axios'

// Use the default XHR adapter (browser-native).
// The old http adapter required nodeIntegration: true which is no longer supported.
const http = axios.create()

export default http
