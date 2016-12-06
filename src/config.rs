use std::env;
use std::default::Default;

pub struct Config {
    pub ip: String,
    pub port: String,
    pub thread_count: usize,
    pub thread_keepalive: u64,
}

impl Default for Config {
    fn default() -> Config {
        Config {
            ip: "0.0.0.0".into(),
            port: "8000".into(),
            thread_count: 30,
            thread_keepalive: 1,
        }
    }
}

impl Config {
    pub fn new() -> Config {
        let mut config: Config = Default::default();

        if let Ok(ip) = env::var("IP") {
            config.ip = ip;
        }

        if let Ok(port) = env::var("PORT") {
            config.port = port;
        }

        if let Ok(thread_count) = env::var("THREAD_COUNT") {
            config.thread_count = thread_count.parse().expect("THREAD_COUNT must be a number");
        }

        if let Ok(thread_keepalive) = env::var("THREAD_KEEPALIVE") {
            config.thread_keepalive = thread_keepalive.parse().expect("THREAD_KEEPALIVE must be a number");
        }


        config
    }
}
