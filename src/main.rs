#[macro_use] extern crate nickel;
extern crate chrono;


use std::env;
use std::time::Duration;
use std::collections::HashMap;
use nickel::{Nickel, Mountable, HttpRouter, StaticFilesHandler};

use chrono::{DateTime, UTC};

fn main() {
    let mut server = Nickel::new();

    // TODO
    println!("{:?}", env::var("ENV"));

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
        return response.render("src/view/index.tpl", &data);
    });


    server.keep_alive_timeout(None);
    server.listen("0.0.0.0:8000").unwrap();
}
