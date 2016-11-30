#[macro_use] extern crate nickel;
extern crate chrono;


use std::env;
use std::time::Duration;
use std::collections::HashMap;
use nickel::{Nickel, Options, Mountable, HttpRouter, StaticFilesHandler};

use chrono::{DateTime, UTC};


struct Config {
    ip: String,
    port: u16,
    thread_count: usize,
    thread_keepalive: u64,
}

impl Config {
    fn new() -> Config {
        let ip: String = match env::var("IP") {
            Ok(ip) => ip,
            Err(_) => "0.0.0.0".to_string(),
        };

        let port: u16 = match env::var("PORT") {
            Ok(port) => port.parse().expect("PORT must be a number"),
            Err(_) => 8000u16,
        };

        let thread_count: usize = match env::var("THREAD_COUNT") {
            Ok(count) => count.parse().expect("THREAD_COUNT must be a number"),
            Err(_) => 30usize,
        };

        let thread_keepalive: u64 = match env::var("THREAD_KEEPALIVE") {
            Ok(keepalive) => keepalive.parse().expect("THREAD_KEEPALIVE must be a number"),
            Err(_) => 1u64,
        };


        Config {
            ip: ip,
            port: port,
            thread_count: thread_count,
            thread_keepalive: thread_keepalive,
        }
    }
}


// TODO env config
fn main() {
    let config = Config::new();
    let mut server = Nickel::new();
    server.options = Options::default().thread_count(Some(30));



    server.utilize(middleware! { |request|
        let time: DateTime<UTC> = UTC::now();
        let ref method = request.origin.method;
        let ref uri = request.origin.uri;
        let ref headers = request.origin.headers;
        let ref remote_addr = request.origin.remote_addr;
        println!("{} LOG: {} {} \n{}from: {} \n", time, method, uri, headers, remote_addr);
    });

    server.mount("/public/", StaticFilesHandler::new("public/"));

    server.get("/", middleware! { |_, response|
        let mut data = HashMap::new();
        data.insert("name", "user");
        return response.render("view/index.tpl", &data);
    });


    server.keep_alive_timeout(Some(Duration::from_secs(1)));
    server.listen("0.0.0.0:8000").unwrap();
}
