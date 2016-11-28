#[macro_use] extern crate nickel;
extern crate chrono;


use std::env;
use std::time::Duration;
use std::collections::HashMap;
use nickel::{Nickel, Options, Mountable, HttpRouter, StaticFilesHandler};

use chrono::{DateTime, UTC};

fn main() {
    let port = match env::var("PORT") {
        Ok(port) => port,
        Err(_) => String::from("8000"),
    };

    let ip = match env::var("IP") {
        Ok(ip) => ip,
        Err(_) => String::from("0.0.0.0"),
    };

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

    let address: &str = &*format!("{}:{}", ip, port);
    server.listen(address).unwrap();
}
