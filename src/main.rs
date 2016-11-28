//#[macro_use] extern crate nickel;
//extern crate chrono;


//use std::env;
//use std::time::Duration;
//use std::collections::HashMap;
//use nickel::{Nickel, Options, Mountable, HttpRouter, StaticFilesHandler};

//use chrono::{DateTime, UTC};

//fn main() {
    //let mut server = Nickel::new();
    //server.options = Options::default().thread_count(Some(30));

    //// TODO
    //println!("{:?}", env::var("ENV"));

    //server.utilize(middleware! { |request|
        //let time: DateTime<UTC> = UTC::now();
        //let ref method = request.origin.method;
        //let ref uri = request.origin.uri;
        //let ref headers = request.origin.headers;
        //let ref remote_addr = request.origin.remote_addr;
        //println!("{} LOG: {} {} \n{}from: {} \n", time, method, uri, headers, remote_addr);
    //});

    //server.mount("/public/", StaticFilesHandler::new("public/"));

    //server.get("/", middleware! { |_, response|
        //let mut data = HashMap::new();
        //data.insert("name", "user");
        //return response.render("view/index.tpl", &data);
    //});


    //server.keep_alive_timeout(Some(Duration::from_secs(1)));
    //server.listen("0.0.0.0:8000").unwrap();
//}

extern crate iron;
extern crate router;
extern crate staticfile;
extern crate mount;
extern crate logger;
extern crate env_logger;

use iron::prelude::*;
use iron::status;
use router::Router;
use staticfile::Static;
use mount::Mount;
use logger::Logger;
use logger::format::Format;

use std::path::Path;


static FORMAT: &'static str =
    "{request-time} {method} {uri}, Status: {status}, Duration: {response-time}";

fn handler(req: &mut Request) -> IronResult<Response> {
    let ref query = req.extensions.get::<Router>().unwrap().find("query").unwrap_or("/");
    Ok(Response::with((status::Ok, "fuck you")))
}

fn main() {
    env_logger::init().unwrap();
    let format = Format::new(FORMAT);

    let mut router = Router::new();

    router.get("/", handler, "index");

    let mut mount = Mount::new();
    mount.mount("/public", Static::new(Path::new("public")));
    mount.mount("/", router);

    let (logger_before, logger_after) = Logger::new(Some(format.unwrap()));
    let mut chain = Chain::new(mount);
    chain.link_before(logger_before);
    chain.link_after(logger_after);

    match Iron::new(chain).http("0.0.0.0:8000") {
        Result::Ok(listening) => println!("{:?}", listening),
        Result::Err(err) => panic!("Error {:?}", err),
    }
}
