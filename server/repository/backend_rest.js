'use strict';

const axios = require('axios').default;

class Backend {
    constructor(url) {
        this.baseURL = url;
    }

    request(url, method, headers, data) {
        const options = {url: `${this.baseURL}/${url}`, method, headers, data}
        return axios(options);
    }

    validate(cmmn) {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/xml'
        }

        return this.request('repository/validate', 'POST', headers, cmmn);
    }

    getEvents(caseId, from, to, token) {
        const parameters = [];
        if (from && from !== '') {
            parameters.push(`from=${from}`)
        }
        if (to) {
            parameters.push(`to=${to}`)
        }
        const url = `debug/${caseId}?${parameters.join('&')}`;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        }
        if (token) {
            headers.Authorization = token
        }
        return this.request(url, 'GET', headers).then(response => response.data);
    }
}

exports.Backend = Backend;
