#[macro_use] extern crate nickel;
extern crate hyper;
extern crate chrono;
extern crate acme_client;


use std::thread;
use std::env;
use std::time::Duration;
use std::collections::HashMap;
use nickel::{Nickel, Options, Mountable, HttpRouter, StaticFilesHandler, Request, Response, MiddlewareResult};
use hyper::net::Openssl;
use chrono::{DateTime, UTC};
use acme_client::AcmeClient;


struct Config {
    ip: String,
    http_port: String,
    https_port: String,
    https: bool,
}

fn get_config() -> Config {
    let http_port = match env::var("HTTP_PORT") {
        Ok(port) => port,
        Err(_) => String::from("8000"),
    };

    let https_port = match env::var("HTTPS_PORT") {
        Ok(port) => port,
        Err(_) => String::from("8001"),
    };

    let ip = match env::var("IP") {
        Ok(ip) => ip,
        Err(_) => String::from("0.0.0.0"),
    };

    let https = match env::var("HTTPS") {
        Ok(_) => true,
        Err(_) => false,
    };

    Config {
        ip: ip,
        http_port: http_port,
        https_port: https_port,
        https: https,
    }
}


fn get_cert() {
    AcmeClient::new()
        .and_then(|ac| ac.set_domain("franleplant.com"))
        .and_then(|ac| ac.register_account(Some("franleplant@gmail.com")))
        .and_then(|ac| ac.identify_domain())
        .and_then(|ac| ac.save_http_challenge_into("./letsencrypt"))
        .and_then(|ac| ac.simple_http_validation())
        .and_then(|ac| ac.sign_certificate())
        .and_then(|ac| ac.save_domain_private_key("domain.pem"))
        .and_then(|ac| ac.save_signed_certificate("domain.crt")).unwrap();

}


fn logger_fn<'mw>(request: &mut Request, respose: Response<'mw>) -> MiddlewareResult<'mw> {
    let time: DateTime<UTC> = UTC::now();
    let ref method = request.origin.method;
    let ref uri = request.origin.uri;
    let ref headers = request.origin.headers;
    let ref remote_addr = request.origin.remote_addr;
    println!("{} LOG: {} {} \n{}from: {} \n", time, method, uri, headers, remote_addr);
    respose.next_middleware()
}


fn start_http_server() {
    let config = get_config();
    let mut server = Nickel::new();
    server.options = Options::default().thread_count(Some(30));
    server.keep_alive_timeout(Some(Duration::from_secs(1)));



    server.utilize(logger_fn);

    // Only for letsencrypt challenge files
    server.mount("/", StaticFilesHandler::new("letsencrypt/"));

    server.get("/", middleware! { |_, response|
        let mut data = HashMap::new();
        data.insert("name", "user");
        return response.render("view/index.tpl", &data);
        //TODO redirect
    });



    let address: &str = &*format!("{}:{}", config.ip, config.http_port);


    match server.listen(address) {
        Err(error) => println!("Error {}", error),

        Ok(_) => {
            //TODO
            //if config.https {
            //get_cert();
            println!("starting HTTPS");
            thread::spawn(start_https_server);
        },
    }
}

fn start_https_server() {
    let config = get_config();
    let mut server = Nickel::new();
    server.options = Options::default().thread_count(Some(30));
    server.keep_alive_timeout(Some(Duration::from_secs(1)));

    server.utilize(logger_fn);

    server.mount("/public/", StaticFilesHandler::new("public/"));

    server.get("/", middleware! { |_, response|
        let mut data = HashMap::new();
        data.insert("name", "user");
        return response.render("view/index.tpl", &data);
    });



    let address: &str = &*format!("{}:{}", config.ip, config.https_port);

    let ssl = Openssl::with_cert_and_key("domain.crt", "domain.pem").unwrap();
    server.listen_https(address, ssl).unwrap();
}

fn main() {

    start_http_server();
}
