'use strict';

var utilFormatUrl = require('@aws-sdk/util-format-url');
var protocolHttp = require('@smithy/protocol-http');
var signatureV4 = require('@smithy/signature-v4');
var runtimeConfig = require('./runtimeConfig');

class Signer {
    credentials;
    hostname;
    port;
    protocol = "https:";
    region;
    service = "rds-db";
    sha256;
    username;
    constructor(configuration) {
        const runtimeConfiguration = runtimeConfig.getRuntimeConfig(configuration);
        this.credentials = runtimeConfiguration.credentials;
        this.hostname = runtimeConfiguration.hostname;
        this.port = runtimeConfiguration.port;
        this.region = runtimeConfiguration.region;
        this.sha256 = runtimeConfiguration.sha256;
        this.username = runtimeConfiguration.username;
    }
    async getAuthToken() {
        const signer = new signatureV4.SignatureV4({
            service: this.service,
            region: this.region,
            credentials: this.credentials,
            sha256: this.sha256,
        });
        const request = new protocolHttp.HttpRequest({
            method: "GET",
            protocol: this.protocol,
            hostname: this.hostname,
            port: this.port,
            query: {
                Action: "connect",
                DBUser: this.username,
            },
            headers: {
                host: `${this.hostname}:${this.port}`,
            },
        });
        const presigned = await signer.presign(request, {
            expiresIn: 900,
        });
        return utilFormatUrl.formatUrl(presigned).replace(`${this.protocol}//`, "");
    }
}

exports.Signer = Signer;
