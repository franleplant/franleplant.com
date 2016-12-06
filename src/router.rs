use std::collections::HashMap;
use nickel::{Router, HttpRouter};



pub fn routes() -> Router {
    let mut router = Router::new();
    router.get("/", middleware! { |_, response|
        let mut data = HashMap::new();
        data.insert("name", "user");
        return response.render("view/index.tpl", &data);
    });

    router
}
