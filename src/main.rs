#[macro_use] extern crate nickel;
extern crate hyper;
extern crate chrono;
extern crate acme_client;


use std::thread;
use std::error::Error;
use std::env;
use std::time::Duration;
use std::collections::HashMap;
use nickel::{Nickel, Options, Mountable, HttpRouter, StaticFilesHandler, Request, Response, MiddlewareResult, ListeningServer};
use nickel::extensions::Redirect;
use hyper::net::Openssl;
use chrono::{DateTime, UTC};
use acme_client::AcmeClient;


struct Config {
    ip: String,
    http_port: String,
    https_port: String,
    https: bool,
    thread_count: usize,
    thread_keepalive: u64,
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

    let thread_count: usize = match env::var("THREADS") {
        Ok(threads) => threads.parse().expect("THREADS should be a number"),
        Err(_) => 30,
    };

    let thread_keepalive: u64 = match env::var("THREAD_KEEPALIVE") {
        Ok(keepalive) => keepalive.parse().expect("THREAD_KEEPALIVE should be a number"),
        Err(_) => 1,
    };

    Config {
        ip: ip,
        http_port: http_port,
        https_port: https_port,
        https: https,
        thread_count: thread_count,
        thread_keepalive: thread_keepalive,
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




fn start_server(config: &Config, https_server: bool) -> Result<ListeningServer, Box<Error>> {
    let mut server = Nickel::new();
    server.options = Options::default().thread_count(Some(config.thread_count));
    server.keep_alive_timeout(Some(Duration::from_secs(config.thread_keepalive)));
    server.utilize(logger_fn);


    if config.https && !https_server {
        // Only for letsencrypt challenge files
        server.mount("/", StaticFilesHandler::new("letsencrypt/"));
        server.utilize(middleware! { |_, res| return res.redirect("https://www.franleplant.com") });
    }

    server.mount("/public/", StaticFilesHandler::new("public/"));
    server.get("/", middleware! { |_, response|
        let mut data = HashMap::new();
        data.insert("name", "user");
        return response.render("view/index.tpl", &data);
    });




    if https_server {
        let address: &str = &*format!("{}:{}", config.ip, config.https_port);
        let ssl = Openssl::with_cert_and_key("domain.crt", "domain.pem").unwrap();
        return server.listen_https(address, ssl)
    } else {
        let address: &str = &*format!("{}:{}", config.ip, config.http_port);
        return server.listen(address)
    }
}

// TODO
// - use nickel Router
// - how to autorenew certificates?
fn main() {
    let config = get_config();

    match start_server(&config, false) {
        Err(error) => println!("Error {}", error),

        Ok(_) => {
            if config.https {
                println!("starting HTTPS");
                get_cert();
                thread::spawn(move || {
                    start_server(&config, true).expect("ERROR opening HTTPS server");
                });
            }
        },
    }
}
