#[macro_use] extern crate nickel;
extern crate chrono;
mod config;
mod router;

use std::time::Duration;
use nickel::{Nickel, Options, Mountable, StaticFilesHandler};
use chrono::{DateTime, UTC};
use config::Config;



fn main() {
    let config = Config::new();
    let mut server = Nickel::new();
    server.options = Options::default().thread_count(Some(config.thread_count));
    server.keep_alive_timeout(Some(Duration::from_secs(config.thread_keepalive)));

    server.utilize(middleware! { |request|
        let time: DateTime<UTC> = UTC::now();
        let ref method = request.origin.method;
        let ref uri = request.origin.uri;
        let ref headers = request.origin.headers;
        let ref remote_addr = request.origin.remote_addr;
        println!("{} LOG: {} {} \n{}from: {} \n", time, method, uri, headers, remote_addr);
    });

    server.mount("/public/", StaticFilesHandler::new("public/"));

    server.utilize(router::routes());

    let address: &str = &*format!("{}:{}", config.ip, config.port);
    server.listen(address).unwrap();
}

