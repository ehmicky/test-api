import { parse } from './parse.js'
import { request } from './request/main.js'
import { serialize } from './serialize/main.js'
import { addUrl } from './url/main.js'

// Does in order:
//  - serialize request parameters
//  - build request URL
//  - send HTTP request
//  - parse HTTP response
export const run = [serialize, addUrl, request, parse]
