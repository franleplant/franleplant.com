#[macro_use] extern crate nickel;

use std::collections::HashMap;
use nickel::{Nickel, Mountable, HttpRouter, StaticFilesHandler};

fn main() {
    let mut server = Nickel::new();

    server.utilize(middleware! { |request|
        println!("LOG: {:?}", request.origin.uri);
    });

    server.mount("/public/", StaticFilesHandler::new("public/"));

    server.get("/", middleware! { |_, response|
        let mut data = HashMap::new();
        data.insert("name", "user");
        return response.render("src/view/index.tpl", &data);
    });

    server.listen("127.0.0.1:8000").unwrap();
}
